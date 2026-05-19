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
  views_count: number
  created_at: string
}

const BRANDS = ['ทั้งหมด', 'Toyota', 'Honda', 'Isuzu', 'Ford', 'Mazda', 'Nissan', 'Mitsubishi', 'BMW', 'Mercedes-Benz']
const PROVINCES = ['ทั้งหมด', 'กรุงเทพมหานคร', 'เชียงใหม่', 'ชลบุรี', 'ภูเก็ต', 'ขอนแก่น', 'นครราชสีมา']

export default function CarsPage() {
  const [cars, setCars] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState('ทั้งหมด')
  const [province, setProvince] = useState('ทั้งหมด')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchCars()
  }, [brand, province, minPrice, maxPrice])

  const fetchCars = async () => {
    setLoading(true)
    let query = supabase
      .from('car_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (brand !== 'ทั้งหมด') query = query.eq('brand', brand)
    if (province !== 'ทั้งหมด') query = query.eq('province', province)
    if (minPrice) query = query.gte('price', Number(minPrice))
    if (maxPrice) query = query.lte('price', Number(maxPrice))

    const { data } = await query
    setCars(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">รถมือสองทั้งหมด</h1>
        <Link
          href="/cars/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + ลงประกาศขาย
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          {BRANDS.map(b => <option key={b}>{b}</option>)}
        </select>

        <select
          value={province}
          onChange={e => setProvince(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        >
          {PROVINCES.map(p => <option key={p}>{p}</option>)}
        </select>

        <input
          type="number"
          placeholder="ราคาต่ำสุด"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        />

        <input
          type="number"
          placeholder="ราคาสูงสุด"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-gray-700"
        />
      </div>

      {/* Car Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">🚗</p>
          <p className="text-lg font-medium">ยังไม่มีประกาศรถ</p>
          <p className="text-sm mt-1">เป็นคนแรกที่ลงประกาศขายรถได้เลยครับ</p>
          <Link href="/cars/create" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            ลงประกาศเลย
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cars.map(car => (
            <Link key={car.id} href={`/cars/${car.id}`}>
              <div className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition cursor-pointer">
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🚗</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{car.title}</h3>
                  <p className="text-blue-600 font-bold text-lg mt-1">
                    ฿{car.price.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{car.year}</span>
                    <span>•</span>
                    <span>{car.mileage.toLocaleString()} กม.</span>
                    <span>•</span>
                    <span>{car.province}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {car.fuel_type === 'gasoline' ? 'เบนซิน' : car.fuel_type === 'diesel' ? 'ดีเซล' : car.fuel_type === 'electric' ? 'ไฟฟ้า' : 'ไฮบริด'}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
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
  )
}