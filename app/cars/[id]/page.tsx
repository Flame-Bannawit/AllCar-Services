'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
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
  description: string
  images: string[]
  status: string
  is_financed: boolean
  can_transfer: boolean
  views_count: number
  created_at: string
  seller_id: string
  profiles: {
    full_name: string
    avatar_url: string
    email: string
  }
}

export default function CarDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [car, setCar] = useState<CarListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [wishlist, setWishlist] = useState(false)

  useEffect(() => {
    fetchCar()
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    if (user) {
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .single()
      setWishlist(!!data)
    }
  }

  const fetchCar = async () => {
    const { data } = await supabase
      .from('car_listings')
      .select('*, profiles(full_name, avatar_url, email)')
      .eq('id', id)
      .single()

    if (!data) {
      router.push('/cars')
      return
    }

    setCar(data)
    setLoading(false)

    // เพิ่ม views
    await supabase
      .from('car_listings')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id)
  }

  const toggleWishlist = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (wishlist) {
      await supabase.from('wishlists').delete()
        .eq('user_id', currentUser.id)
        .eq('listing_id', id)
      setWishlist(false)
    } else {
      await supabase.from('wishlists').insert({
        user_id: currentUser.id,
        listing_id: id,
      })
      setWishlist(true)
    }
  }

  const handleChat = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (!car) return

    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('listing_id', id)
      .eq('buyer_id', currentUser.id)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    const { data: newRoom } = await supabase
      .from('chat_rooms')
      .insert({
        listing_id: id,
        buyer_id: currentUser.id,
        seller_id: car.seller_id,
      })
      .select('id')
      .single()

    if (newRoom) router.push(`/chat/${newRoom.id}`)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
      </div>
    )
  }

  if (!car) return null

  const fuelLabel: Record<string, string> = {
    gasoline: 'เบนซิน', diesel: 'ดีเซล', electric: 'ไฟฟ้า', hybrid: 'ไฮบริด'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ซ้าย: รูปและรายละเอียด */}
        <div className="lg:col-span-2 space-y-6">

          {/* รูปภาพ */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="h-80 bg-gray-100 overflow-hidden">
              {car.images?.[currentImage] ? (
                <img
                  src={car.images[currentImage]}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🚗</div>
              )}
            </div>
            {car.images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {car.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${currentImage === i ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="bg-white rounded-xl border p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-4">{car.title}</h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'ยี่ห้อ', value: car.brand },
                { label: 'รุ่น', value: car.model },
                { label: 'ปี', value: car.year },
                { label: 'สี', value: car.color },
                { label: 'เชื้อเพลิง', value: fuelLabel[car.fuel_type] },
                { label: 'เกียร์', value: car.transmission === 'auto' ? 'ออโต้' : 'แมนวล' },
                { label: 'เลขไมล์', value: `${car.mileage.toLocaleString()} กม.` },
                { label: 'จังหวัด', value: car.province },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-4">
              {car.can_transfer && (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                  โอนได้ทันที
                </span>
              )}
              {car.is_financed && (
                <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                  ติดไฟแนนซ์
                </span>
              )}
            </div>

            {car.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">รายละเอียดเพิ่มเติม</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{car.description}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">
              เปิดดู {car.views_count} ครั้ง · ลงประกาศเมื่อ {new Date(car.created_at).toLocaleDateString('th-TH')}
            </p>
          </div>
        </div>

        {/* ขวา: ราคา + ติดต่อ */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <p className="text-3xl font-bold text-blue-600 mb-1">
              ฿{car.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-6">ราคาตามตกลง</p>

            {currentUser?.id !== car.seller_id && (
              <div className="space-y-3">
                <button
                  onClick={handleChat}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  💬 แชทกับผู้ขาย
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`w-full py-3 rounded-xl font-medium border transition ${wishlist ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {wishlist ? '❤️ บันทึกแล้ว' : '🤍 บันทึกไว้ดูภายหลัง'}
                </button>
              </div>
            )}

            {/* ข้อมูลผู้ขาย */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">ข้อมูลผู้ขาย</p>
              <div className="flex items-center gap-3">
                <img
                  src={car.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${car.profiles?.full_name}&background=3b82f6&color=fff`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{car.profiles?.full_name || 'ผู้ขาย'}</p>
                  <p className="text-xs text-gray-500">สมาชิก AllCar Services</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link
                href={`/report?type=listing&id=${car.id}`}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                🚩 รายงานประกาศนี้
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}