'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { GarageMarker } from '@/components/shared/MapView'

const MapView = dynamic(() => import('@/components/shared/MapView'), { ssr: false })

interface Garage {
  id: string
  name: string
  description: string
  phone: string
  address: string
  province: string
  lat: number
  lng: number
  services: string[]
  images: string[]
  open_hours: string
  rating_avg: number
  rating_count: number
}

const PROVINCES = ['ทั้งหมด', 'กรุงเทพมหานคร', 'เชียงใหม่', 'ชลบุรี', 'ภูเก็ต', 'ขอนแก่น', 'นครราชสีมา']
const SERVICES = ['ทั้งหมด', 'ซ่อมเครื่องยนต์', 'เปลี่ยนยาง', 'ล้างรถ', 'ตรวจเช็คระยะ', 'ซ่อมช่วงล่าง', 'ซ่อมไฟฟ้า']

export default function GaragesPage() {
  const [garages, setGarages] = useState<Garage[]>([])
  const [loading, setLoading] = useState(true)
  const [province, setProvince] = useState('ทั้งหมด')
  const [service, setService] = useState('ทั้งหมด')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [selected, setSelected] = useState<GarageMarker | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchGarages()
  }, [province, service])

  const fetchGarages = async () => {
    setLoading(true)
    let query = supabase
      .from('garages')
      .select('*')
      .eq('status', 'active')
      .order('rating_avg', { ascending: false })

    if (province !== 'ทั้งหมด') query = query.eq('province', province)
    if (service !== 'ทั้งหมด') query = query.contains('services', [service])

    const { data } = await query
    setGarages(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">หาอู่ซ่อมรถ</h1>
        <Link
          href="/garages/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + ลงทะเบียนอู่
        </Link>
      </div>

      {/* Filter + View Toggle */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={province}
          onChange={e => setProvince(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          {PROVINCES.map(p => <option key={p}>{p}</option>)}
        </select>

        <select
          value={service}
          onChange={e => setService(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          {SERVICES.map(s => <option key={s}>{s}</option>)}
        </select>

        <div className="ml-auto flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium transition ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            รายการ
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 text-sm font-medium transition ${view === 'map' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            แผนที่
          </button>
        </div>
      </div>

      {/* Map View */}
      {view === 'map' && (
        <div className="mb-6">
          <MapView
            garages={garages}
            selected={selected}
            onSelect={setSelected}
          />
          {selected && (
            <div className="mt-4 bg-white rounded-xl border p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.address}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-medium">{selected.rating_avg.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({selected.rating_count} รีวิว)</span>
                </div>
              </div>
              <Link
                href={`/garages/${selected.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                ดูรายละเอียด
              </Link>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : garages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🔧</p>
            <p className="text-lg font-medium">ยังไม่มีอู่ในระบบ</p>
            <p className="text-sm mt-1">เป็นเจ้าของอู่? ลงทะเบียนได้เลยครับ</p>
            <Link href="/garages/create" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              ลงทะเบียนอู่
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {garages.map(garage => (
              <Link key={garage.id} href={`/garages/${garage.id}`}>
                <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition cursor-pointer">
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    {garage.images?.[0] ? (
                      <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🔧</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{garage.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{garage.address}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium">{garage.rating_avg.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({garage.rating_count} รีวิว)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {garage.services?.slice(0, 3).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                      {garage.services?.length > 3 && (
                        <span className="text-xs text-gray-400 py-1">+{garage.services.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}