'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ChatRoom {
  id: string
  created_at: string
  car_listings: {
    id: string
    title: string
    images: string[]
    price: number
  } | null
  garages: {
    id: string
    name: string
    images: string[]
  } | null
  buyer: {
    id: string
    full_name: string
    avatar_url: string
  }
  seller: {
    id: string
    full_name: string
    avatar_url: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
}

export default function ChatListPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

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
    fetchRooms(user.id)
  }

  const fetchRooms = async (userId: string) => {
    const { data } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        car_listings(id, title, images, price),
        garages(id, name, images),
        buyer:profiles!chat_rooms_buyer_id_fkey(id, full_name, avatar_url),
        seller:profiles!chat_rooms_seller_id_fkey(id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (data) {
      const roomsWithLastMsg = await Promise.all(
        data.map(async room => {
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
          return { ...room, last_message: msgs?.[0] || null }
        })
      )
      setRooms(roomsWithLastMsg as any)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แชทของฉัน</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 flex gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-lg font-medium">ยังไม่มีแชท</p>
          <p className="text-sm mt-1">เริ่มแชทได้จากหน้ารายละเอียดรถครับ</p>
          <Link href="/cars" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            ดูรถทั้งหมด
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map(room => {
            const isbuyer = currentUser?.id === (room.buyer as any)?.id
            const otherUser = isbuyer ? room.seller : room.buyer
            const topic = room.car_listings?.title || room.garages?.name || 'แชท'
            const image = room.car_listings?.images?.[0] || room.garages?.images?.[0]

            return (
              <Link key={room.id} href={`/chat/${room.id}`}>
                <div className="bg-white rounded-xl border p-4 flex gap-3 hover:shadow-sm transition cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <img
                      src={(otherUser as any)?.avatar_url || `https://ui-avatars.com/api/?name=${(otherUser as any)?.full_name}&background=3b82f6&color=fff`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {image && (
                      <img
                        src={image}
                        alt=""
                        className="w-6 h-6 rounded object-cover absolute -bottom-1 -right-1 border-2 border-white"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {(otherUser as any)?.full_name || 'ผู้ใช้'}
                      </p>
                      {room.last_message && (
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(room.last_message.created_at).toLocaleDateString('th-TH')}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 truncate">{topic}</p>
                    {room.last_message && (
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {room.last_message.sender_id === currentUser?.id ? 'คุณ: ' : ''}
                        {room.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}