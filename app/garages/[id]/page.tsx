'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapView = dynamic(() => import('@/components/shared/MapView'), { ssr: false })

interface Garage {
  id: string
  owner_id: string
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
  status: string
  rating_avg: number
  rating_count: number
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
    email: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string
  }
}

export default function GarageDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [garage, setGarage] = useState<Garage | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    const { data: garageData } = await supabase
      .from('garages')
      .select('*, profiles(full_name, avatar_url, email)')
      .eq('id', id)
      .single()

    if (!garageData) {
      router.push('/garages')
      return
    }
    setGarage(garageData as any)

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('target_type', 'garage')
      .eq('target_id', id)
      .order('created_at', { ascending: false })

    setReviews(reviewsData as any || [])
    setLoading(false)
  }

  const handleChat = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (!garage) return

    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('garage_id', id)
      .eq('buyer_id', currentUser.id)
      .single()

    if (existing) {
      router.push(`/chat/${existing.id}`)
      return
    }

    const { data: newRoom } = await supabase
      .from('chat_rooms')
      .insert({
        garage_id: id,
        buyer_id: currentUser.id,
        seller_id: garage.owner_id,
      })
      .select('id')
      .single()

    if (newRoom) router.push(`/chat/${newRoom.id}`)
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setSubmitting(true)

    await supabase.from('reviews').upsert({
      reviewer_id: currentUser.id,
      target_type: 'garage',
      target_id: id,
      rating,
      comment,
    })

    setShowReviewForm(false)
    setComment('')
    setRating(5)
    fetchData()
    setSubmitting(false)
  }

  const openGoogleMaps = () => {
    if (!garage) return
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${garage.lat},${garage.lng}`, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
      </div>
    )
  }

  if (!garage) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ซ้าย */}
        <div className="lg:col-span-2 space-y-6">

          {/* รูปภาพ */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="h-64 bg-gray-100">
              {garage.images?.[currentImage] ? (
                <img src={garage.images[currentImage]} alt={garage.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🔧</div>
              )}
            </div>
            {garage.images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {garage.images.map((img, i) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${currentImage === i ? 'border-blue-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ข้อมูล */}
          <div className="bg-white rounded-xl border p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{garage.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400">★</span>
              <span className="font-medium">{garage.rating_avg.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({garage.rating_count} รีวิว)</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>📍 {garage.address} {garage.province}</p>
              <p>📞 {garage.phone}</p>
              {garage.open_hours && <p>🕐 {garage.open_hours}</p>}
            </div>

            {garage.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{garage.description}</p>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">บริการ</p>
              <div className="flex flex-wrap gap-2">
                {garage.services?.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* แผนที่ */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">ตำแหน่งที่ตั้ง</h2>
              <button
                onClick={openGoogleMaps}
                className="text-sm text-blue-600 hover:underline"
              >
                นำทางด้วย Google Maps →
              </button>
            </div>
            <MapView
              garages={[garage]}
              selected={garage}
              onSelect={() => {}}
            />
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">รีวิว ({reviews.length})</h2>
              {currentUser && currentUser.id !== garage.owner_id && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  เขียนรีวิว
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={handleReview} className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">คะแนน</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className={`text-2xl transition ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="แชร์ประสบการณ์ของคุณ..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                    {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">ยังไม่มีรีวิวครับ</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${review.profiles?.full_name}&background=3b82f6&color=fff`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.profiles?.full_name}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">
                            {new Date(review.created_at).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ขวา */}
        <div>
          <div className="bg-white rounded-xl border p-6 sticky top-20 space-y-3">
            <p className="font-semibold text-gray-900 text-lg">{garage.name}</p>

            {currentUser?.id !== garage.owner_id && (
              <button
                onClick={handleChat}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
              >
                💬 แชทกับอู่
              </button>
            )}

            <button
              onClick={openGoogleMaps}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              📍 นำทางไปอู่
            </button>

            <a href={`tel:${garage.phone}`} className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition text-center">
              📞 โทร {garage.phone}
            </a>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">เจ้าของอู่</p>
              <div className="flex items-center gap-3">
                <img
                  src={garage.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${garage.profiles?.full_name}&background=3b82f6&color=fff`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{garage.profiles?.full_name}</p>
                  <p className="text-xs text-gray-500">สมาชิก AllCar Services</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Link href={`/report?type=garage&id=${garage.id}`} className="text-xs text-gray-400 hover:text-red-500">
                🚩 รายงานอู่นี้
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}