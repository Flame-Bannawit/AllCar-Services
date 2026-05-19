'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00'
]

const SERVICES = [
  'ซ่อมเครื่องยนต์', 'เปลี่ยนยาง', 'ล้างรถ',
  'ตรวจเช็คระยะ', 'ซ่อมช่วงล่าง', 'ซ่อมไฟฟ้า',
  'เปลี่ยนถ่ายน้ำมัน', 'ซ่อมแอร์', 'เคาะพ่นสี'
]

interface Garage {
  id: string
  name: string
  address: string
  services: string[]
  open_hours: string
}

interface Appointment {
  date: string
  time_slot: string
}

export default function BookAppointmentPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [garage, setGarage] = useState<Garage | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Appointment[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    date: '',
    time_slot: '',
    service: '',
    note: '',
  })

  useEffect(() => {
    init()
  }, [id])

  useEffect(() => {
    if (form.date) fetchBookedSlots(form.date)
  }, [form.date])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('garages')
      .select('id, name, address, services, open_hours')
      .eq('id', id)
      .single()

    if (!data) {
      router.push('/garages')
      return
    }

    setGarage(data)
    setLoading(false)
  }

  const fetchBookedSlots = async (date: string) => {
    const { data } = await supabase
      .from('appointments')
      .select('date, time_slot')
      .eq('garage_id', id)
      .eq('date', date)
      .in('status', ['pending', 'confirmed'])

    setBookedSlots(data || [])
  }

  const isSlotBooked = (slot: string) =>
    bookedSlots.some(b => b.time_slot === slot)

  const minDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const maxDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.date || !form.time_slot || !form.service) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วนครับ')
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('appointments').insert({
      garage_id: id,
      customer_id: user.id,
      date: form.date,
      time_slot: form.time_slot,
      service: form.service,
      note: form.note,
      status: 'pending',
    })

    if (insertError) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่ครับ')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">นัดหมายสำเร็จแล้วครับ!</h2>
        <p className="text-gray-500 mb-6">ทางอู่จะยืนยันนัดหมายของคุณเร็วๆ นี้ครับ</p>
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-blue-900 mb-2">{garage?.name}</p>
          <p className="text-sm text-blue-700">📅 {new Date(form.date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-sm text-blue-700">🕐 {form.time_slot} น.</p>
          <p className="text-sm text-blue-700">🔧 {form.service}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/appointments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ดูนัดหมายของฉัน
          </button>
          <button
            onClick={() => router.push('/garages')}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            กลับหน้าอู่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">นัดซ่อมรถ</h1>
        <p className="text-gray-500 mt-1">{garage?.name}</p>
        <p className="text-sm text-gray-400">{garage?.address}</p>
        {garage?.open_hours && (
          <p className="text-sm text-gray-400">🕐 {garage.open_hours}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* เลือกวันที่ */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">เลือกวันที่</h2>
          <input
            type="date"
            required
            min={minDate()}
            max={maxDate()}
            value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value, time_slot: '' }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-2">สามารถนัดล่วงหน้าได้สูงสุด 30 วันครับ</p>
        </div>

        {/* เลือกเวลา */}
        {form.date && (
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-4">เลือกเวลา</h2>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map(slot => {
                const booked = isSlotBooked(slot)
                const selected = form.time_slot === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={booked}
                    onClick={() => setForm(p => ({ ...p, time_slot: slot }))}
                    className={`py-2 rounded-lg text-sm font-medium transition ${
                      booked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selected
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {booked ? '🔴' : slot}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">🔴 = ไม่ว่างครับ</p>
          </div>
        )}

        {/* เลือกบริการ */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">บริการที่ต้องการ</h2>
          <div className="flex flex-wrap gap-2">
            {(garage?.services?.length ? garage.services : SERVICES).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setForm(p => ({ ...p, service: s }))}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  form.service === s
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* หมายเหตุ */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">หมายเหตุเพิ่มเติม</h2>
          <textarea
            value={form.note}
            onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            rows={3}
            placeholder="เช่น รถเสียงดัง, ยางแบน, ต้องการตรวจเพิ่มเติม..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !form.date || !form.time_slot || !form.service}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? 'กำลังนัดหมาย...' : 'ยืนยันการนัดหมาย'}
        </button>
      </form>
    </div>
  )
}