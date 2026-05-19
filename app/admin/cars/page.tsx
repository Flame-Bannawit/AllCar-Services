'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CarListing {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  province: string
  images: string[]
  status: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const supabase = createClient()

  useEffect(() => {
    fetchCars()
  }, [filter])

  const fetchCars = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('car_listings')
      .select('*, profiles(full_name, email)')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setCars(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('car_listings')
      .update({ status })
      .eq('id', id)
    fetchCars()
  }

  const statusLabel: Record<string, string> = {
    pending: 'รออนุมัติ',
    active: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธแล้ว',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการประกาศรถ</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'active', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p>ไม่มีประกาศในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cars.map(car => (
            <div key={car.id} className="bg-white rounded-xl border p-4 flex gap-4">

              {/* รูป */}
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {car.images?.[0] ? (
                  <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                )}
              </div>

              {/* ข้อมูล */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{car.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {car.brand} {car.model} · ปี {car.year} · ฿{car.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{car.province}</p>
                <p className="text-xs text-gray-400 mt-1">
                  โดย {car.profiles?.full_name || car.profiles?.email} ·{' '}
                  {new Date(car.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 justify-center flex-shrink-0">
                <a
                  href={`/cars/${car.id}`}
                  target="_blank"
                  className="text-xs text-blue-600 hover:underline text-center"
                >
                  ดูประกาศ →
                </a>
                {filter === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(car.id, 'active')}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                    >
                      อนุมัติ ✓
                    </button>
                    <button
                      onClick={() => updateStatus(car.id, 'rejected')}
                      className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100"
                    >
                      ปฏิเสธ ✗
                    </button>
                  </>
                )}
                {filter === 'rejected' && (
                  <button
                    onClick={() => updateStatus(car.id, 'active')}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700"
                  >
                    อนุมัติ ✓
                  </button>
                )}
                {filter === 'active' && (
                  <button
                    onClick={() => updateStatus(car.id, 'rejected')}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-lg text-sm hover:bg-red-100"
                  >
                    ระงับ
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