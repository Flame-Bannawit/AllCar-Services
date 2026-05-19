'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Garage {
  id: string
  name: string
  address: string
  province: string
  phone: string
  services: string[]
  images: string[]
  status: string
  rating_avg: number
  rating_count: number
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function AdminGaragesPage() {
  const [garages, setGarages] = useState<Garage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const supabase = createClient()

  useEffect(() => {
    fetchGarages()
  }, [filter])

  const fetchGarages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('garages')
      .select('*, profiles(full_name, email)')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setGarages(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('garages').update({ status }).eq('id', id)
    fetchGarages()
  }

  const statusLabel: Record<string, string> = {
    pending: 'รออนุมัติ',
    active: 'อนุมัติแล้ว',
    suspended: 'ระงับแล้ว',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการอู่ซ่อมรถ</h1>

      <div className="flex gap-2 mb-6">
        {['pending', 'active', 'suspended'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : garages.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔧</p>
          <p>ไม่มีอู่ในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {garages.map(garage => (
            <div key={garage.id} className="bg-white rounded-xl border p-4 flex gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {garage.images?.[0] ? (
                  <img src={garage.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🔧</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{garage.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{garage.address} · {garage.province}</p>
                <p className="text-sm text-gray-500">📞 {garage.phone}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {garage.services?.slice(0, 3).map(s => (
                    <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  โดย {garage.profiles?.full_name || garage.profiles?.email} ·{' '}
                  {new Date(garage.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>

              <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                {filter === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(garage.id, 'active')}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                    >
                      อนุมัติ ✓
                    </button>
                    <button
                      onClick={() => updateStatus(garage.id, 'suspended')}
                      className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100"
                    >
                      ปฏิเสธ ✗
                    </button>
                  </>
                )}
                {filter === 'active' && (
                  <button
                    onClick={() => updateStatus(garage.id, 'suspended')}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100"
                  >
                    ระงับ
                  </button>
                )}
                {filter === 'suspended' && (
                  <button
                    onClick={() => updateStatus(garage.id, 'active')}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                  >
                    เปิดใช้งาน
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}