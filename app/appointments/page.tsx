'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Appointment {
  id: string
  date: string
  time_slot: string
  service: string
  note: string
  status: string
  created_at: string
  garages: {
    id: string
    name: string
    address: string
    phone: string
  }
}

export default function AppointmentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    fetchAppointments(user.id)
  }

  const fetchAppointments = async (userId: string) => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('appointments')
      .select('*, garages(id, name, address, phone)')
      .eq('customer_id', userId)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true })

    if (filter === 'upcoming') {
      query = query.gte('date', today).in('status', ['pending', 'confirmed'])
    } else {
      query = query.lt('date', today)
    }

    const { data } = await query
    setAppointments(data || [])
    setLoading(false)
  }

  const cancelAppointment = async (id: string) => {
    if (!confirm('ยืนยันการยกเลิกนัดหมายครับ?')) return
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (currentUser) fetchAppointments(currentUser.id)
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:   { label: 'รอยืนยัน',  color: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ยกเลิกแล้ว', color: 'bg-red-100 text-red-700' },
    completed: { label: 'เสร็จแล้ว',  color: 'bg-blue-100 text-blue-700' },
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">นัดหมายของฉัน</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'upcoming', label: 'นัดที่กำลังมา' },
          { key: 'past', label: 'นัดที่ผ่านมา' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key)
              if (currentUser) fetchAppointments(currentUser.id)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab.key ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">ไม่มีนัดหมายครับ</p>
          <Link href="/garages" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
            หาอู่ซ่อมรถ →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{apt.garages?.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[apt.status]?.color}`}>
                      {statusConfig[apt.status]?.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📅 {new Date(apt.date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>🕐 {apt.time_slot} น.</p>
                    <p>🔧 {apt.service}</p>
                    <p>📍 {apt.garages?.address}</p>
                    {apt.garages?.phone && (
                      <a href={`tel:${apt.garages.phone}`} className="block text-blue-600">
                        📞 {apt.garages.phone}
                      </a>
                    )}
                    {apt.note && (
                      <p className="text-gray-400 text-xs mt-2">หมายเหตุ: {apt.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/garages/${apt.garages?.id}`}
                    className="text-xs text-blue-600 hover:underline text-center"
                  >
                    ดูอู่ →
                  </Link>
                  {apt.status === 'pending' && (
                    <button
                      onClick={() => cancelAppointment(apt.id)}
                      className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}