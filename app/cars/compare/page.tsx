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
  color: string
  province: string
  images: string[]
  is_financed: boolean
  can_transfer: boolean
}

const FUEL_LABEL: Record<string, string> = {
  gasoline: 'เบนซิน', diesel: 'ดีเซล', electric: 'ไฟฟ้า', hybrid: 'ไฮบริด'
}

export default function ComparePage() {
  const supabase = createClient()
  const [cars, setCars] = useState<(CarListing | null)[]>([null, null])
  const [search, setSearch] = useState(['', ''])
  const [results, setResults] = useState<CarListing[][]>([[], []])
  const [searching, setSearching] = useState([false, false])

  const searchCars = async (query: string, index: number) => {
    if (!query.trim()) {
      setResults(prev => { const n = [...prev]; n[index] = []; return n })
      return
    }
    setSearching(prev => { const n = [...prev]; n[index] = true; return n })
    const { data } = await supabase
      .from('car_listings')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`)
      .limit(5)
    setResults(prev => { const n = [...prev]; n[index] = data || []; return n })
    setSearching(prev => { const n = [...prev]; n[index] = false; return n })
  }

  const selectCar = (car: CarListing, index: number) => {
    setCars(prev => { const n = [...prev]; n[index] = car; return n })
    setSearch(prev => { const n = [...prev]; n[index] = car.title; return n })
    setResults(prev => { const n = [...prev]; n[index] = []; return n })
  }

  const removeCar = (index: number) => {
    setCars(prev => { const n = [...prev]; n[index] = null; return n })
    setSearch(prev => { const n = [...prev]; n[index] = ''; return n })
  }

  const specs = [
    { label: 'ยี่ห้อ', key: 'brand' },
    { label: 'รุ่น', key: 'model' },
    { label: 'ปี', key: 'year' },
    { label: 'ราคา', key: 'price', format: (v: any) => `฿${Number(v).toLocaleString()}` },
    { label: 'เลขไมล์', key: 'mileage', format: (v: any) => `${Number(v).toLocaleString()} กม.` },
    { label: 'เชื้อเพลิง', key: 'fuel_type', format: (v: any) => FUEL_LABEL[v] || v },
    { label: 'เกียร์', key: 'transmission', format: (v: any) => v === 'auto' ? 'ออโต้' : 'แมนวล' },
    { label: 'สี', key: 'color' },
    { label: 'จังหวัด', key: 'province' },
    { label: 'โอนได้ทันที', key: 'can_transfer', format: (v: any) => v ? '✅ ได้' : '❌ ไม่ได้' },
    { label: 'ติดไฟแนนซ์', key: 'is_financed', format: (v: any) => v ? '⚠️ ติด' : '✅ ไม่ติด' },
  ]

  const getBetter = (key: string, format?: Function) => {
    const [a, b] = cars
    if (!a || !b) return [false, false]
    if (key === 'price' || key === 'mileage') {
      const va = Number((a as any)[key])
      const vb = Number((b as any)[key])
      return [va <= vb, vb <= va]
    }
    if (key === 'year') {
      const va = Number((a as any)[key])
      const vb = Number((b as any)[key])
      return [va >= vb, vb >= va]
    }
    if (key === 'can_transfer') return [(a as any)[key], (b as any)[key]]
    if (key === 'is_financed') return [!(a as any)[key], !(b as any)[key]]
    return [false, false]
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">เปรียบเทียบรถ</h1>
        <p className="text-gray-500 text-sm mt-1">เลือกรถ 2 คันเพื่อเปรียบเทียบ spec ครับ</p>
      </div>

      {/* Search boxes */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[0, 1].map(i => (
          <div key={i} className="relative">
            {cars[i] ? (
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {(cars[i] as CarListing).images?.[0] ? (
                      <img src={(cars[i] as CarListing).images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{(cars[i] as CarListing).title}</p>
                    <p className="text-blue-600 font-bold">฿{(cars[i] as CarListing).price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeCar(i)} className="text-gray-400 hover:text-red-500 text-lg">✕</button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={search[i]}
                  onChange={e => {
                    const v = e.target.value
                    setSearch(prev => { const n = [...prev]; n[i] = v; return n })
                    searchCars(v, i)
                  }}
                  placeholder={`ค้นหารถคันที่ ${i + 1}...`}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {results[i].length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg mt-1 z-10 overflow-hidden">
                    {results[i].map(car => (
                      <button
                        key={car.id}
                        onClick={() => selectCar(car, i)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {car.images?.[0] ? (
                            <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg flex items-center justify-center w-full h-full">🚗</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">{car.title}</p>
                          <p className="text-xs text-blue-600">฿{car.price.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {cars[0] && cars[1] ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 w-1/4">รายการ</th>
                <th className="text-center px-4 py-3 w-3/8">
                  <p className="text-sm font-semibold text-gray-900 truncate">{cars[0]?.brand} {cars[0]?.model}</p>
                </th>
                <th className="text-center px-4 py-3 w-3/8">
                  <p className="text-sm font-semibold text-gray-900 truncate">{cars[1]?.brand} {cars[1]?.model}</p>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {specs.map(spec => {
                const [betterA, betterB] = getBetter(spec.key, spec.format)
                const valA = (cars[0] as any)[spec.key]
                const valB = (cars[1] as any)[spec.key]
                const displayA = spec.format ? spec.format(valA) : valA
                const displayB = spec.format ? spec.format(valB) : valB

                return (
                  <tr key={spec.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{spec.label}</td>
                    <td className={`px-4 py-3 text-center text-sm font-medium ${betterA ? 'text-green-600 bg-green-50' : 'text-gray-900'}`}>
                      {displayA}
                    </td>
                    <td className={`px-4 py-3 text-center text-sm font-medium ${betterB ? 'text-green-600 bg-green-50' : 'text-gray-900'}`}>
                      {displayB}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-4 p-4 border-t bg-gray-50">
            <Link
              href={`/cars/${cars[0]?.id}`}
              className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              ดูรายละเอียด {cars[0]?.brand} {cars[0]?.model}
            </Link>
            <Link
              href={`/cars/${cars[1]?.id}`}
              className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              ดูรายละเอียด {cars[1]?.brand} {cars[1]?.model}
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <p className="text-4xl mb-3">🚗🆚🚗</p>
          <p className="font-medium">เลือกรถ 2 คันเพื่อเปรียบเทียบครับ</p>
        </div>
      )}
    </div>
  )
}