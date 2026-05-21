'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface CarListing {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type: string
  transmission: string
  province: string
  images: string[]
}

interface Garage {
  id: string
  name: string
  address: string
  province: string
  services: string[]
  images: string[]
  rating_avg: number
  rating_count: number
}

interface Stats {
  cars: number
  garages: number
  users: number
}

export default function Home() {
  const [cars, setCars] = useState<CarListing[]>([])
  const [garages, setGarages] = useState<Garage[]>([])
  const [stats, setStats] = useState<Stats>({ cars: 0, garages: 0, users: 0 })
  const supabase = createClient()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('code=')) {
      const code = hash.split('code=')[1]
      supabase.auth.exchangeCodeForSession(code).then(() => {
        window.location.hash = ''
        fetchData()
      })
    }
  }, [])

  const fetchData = async () => {
    const [
      { data: carsData },
      { data: garagesData },
      { count: carsCount },
      { count: garagesCount },
      { count: usersCount },
    ] = await Promise.all([
      supabase.from('car_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(8),
      supabase.from('garages').select('*').eq('status', 'active').order('rating_avg', { ascending: false }).limit(4),
      supabase.from('car_listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('garages').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

    setCars(carsData || [])
    setGarages(garagesData || [])
    setStats({ cars: carsCount || 0, garages: garagesCount || 0, users: usersCount || 0 })
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ซื้อ-ขายรถ และหาอู่ซ่อมรถ
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Platform รถยนต์ครบวงจร ซื้อขายรถมือสอง หาอู่ซ่อมใกล้บ้าน พร้อมระบบรีวิวที่น่าเชื่อถือ
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/cars" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-blue-50 transition">
              ดูรถทั้งหมด
            </Link>
            <Link href="/garages" className="border border-white text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition">
              หาอู่ซ่อมรถ
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold">{stats.cars.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">ประกาศรถ</p>
            </div>
            <div className="border-l border-blue-500 pl-8">
              <p className="text-3xl font-bold">{stats.garages.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">อู่ซ่อมรถ</p>
            </div>
            <div className="border-l border-blue-500 pl-8">
              <p className="text-3xl font-bold">{stats.users.toLocaleString()}</p>
              <p className="text-blue-200 text-sm">ผู้ใช้งาน</p>
            </div>
          </div>
        </div>
      </div>

      {/* รถล่าสุด */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">ประกาศรถล่าสุด</h2>
          <Link href="/cars" className="text-blue-600 text-sm hover:underline">ดูทั้งหมด →</Link>
        </div>

        {cars.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
            <p className="text-4xl mb-3">🚗</p>
            <p>ยังไม่มีประกาศรถครับ</p>
            <Link href="/cars/create" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
              เป็นคนแรกที่ลงประกาศ →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cars.map(car => (
              <Link key={car.id} href={`/cars/${car.id}`}>
                <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition cursor-pointer">
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🚗</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 truncate text-sm">{car.title}</h3>
                    <p className="text-blue-600 font-bold mt-1">฿{car.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <span>{car.year}</span>
                      <span>·</span>
                      <span>{car.mileage.toLocaleString()} กม.</span>
                      <span>·</span>
                      <span>{car.province}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {car.fuel_type === 'gasoline' ? 'เบนซิน' : car.fuel_type === 'diesel' ? 'ดีเซล' : car.fuel_type === 'electric' ? 'ไฟฟ้า' : 'ไฮบริด'}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {car.transmission === 'auto' ? 'ออโต้' : 'แมนวล'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* อู่แนะนำ */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">อู่ซ่อมรถแนะนำ</h2>
            <Link href="/garages" className="text-blue-600 text-sm hover:underline">ดูทั้งหมด →</Link>
          </div>

          {garages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
              <p className="text-4xl mb-3">🔧</p>
              <p>ยังไม่มีอู่ในระบบครับ</p>
              <Link href="/garages/create" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
                ลงทะเบียนอู่ →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {garages.map(garage => (
                <Link key={garage.id} href={`/garages/${garage.id}`}>
                  <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition cursor-pointer">
                    <div className="h-36 bg-gray-100 overflow-hidden">
                      {garage.images?.[0] ? (
                        <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🔧</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 truncate text-sm">{garage.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{garage.address}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-medium">{garage.rating_avg.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({garage.rating_count})</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {garage.services?.slice(0, 2).map(s => (
                          <span key={s} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">มีรถอยากขาย?</h2>
        <p className="text-gray-500 mb-6">ลงประกาศฟรี ไม่มีค่าใช้จ่าย เข้าถึงผู้ซื้อทั่วประเทศ</p>
        <Link
          href="/cars/create"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition inline-block"
        >
          ลงประกาศขายรถเลย
        </Link>
      </div>
    </div>
  )
}