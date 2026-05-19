'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  }
  customer: {
    full_name: string
    email: string
    phone: string
  }
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        garages(id, name),
        customer:profiles!appointments_customer_id_fkey(full_name, email, phone)
      `)
      .eq('status', filter)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true })

    setAppointments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchAppointments()
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending:   { label: 'รอยืนยัน',   color: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'ยกเลิกแล้ว', color: 'bg-red-100 text-red-700' },
    completed: { label: 'เสร็จแล้ว',  color: 'bg-blue-100 text-blue-700' },
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการนัดหมาย</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusConfig[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📅</p>
          <p>ไม่มีนัดหมายในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{apt.garages?.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[apt.status]?.color}`}>
                      {statusConfig[apt.status]?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                    <p>📅 {new Date(apt.date).toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    <p>🕐 {apt.time_slot} น.</p>
                    <p>🔧 {apt.service}</p>
                    <p>👤 {apt.customer?.full_name || apt.customer?.email}</p>
                    {apt.customer?.phone && <p>📞 {apt.customer.phone}</p>}
                  </div>
                  {apt.note && (
                    <p className="text-xs text-gray-400 mt-2">หมายเหตุ: {apt.note}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {filter === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, 'confirmed')}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                      >
                        ยืนยัน ✓
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, 'cancelled')}
                        className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100"
                      >
                        ยกเลิก ✗
                      </button>
                    </>
                  )}
                  {filter === 'confirmed' && (
                    <button
                      onClick={() => updateStatus(apt.id, 'completed')}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                    >
                      เสร็จแล้ว ✓
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