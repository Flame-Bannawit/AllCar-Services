'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  image_url: string | null
  profiles: {
    full_name: string
    avatar_url: string
  }
}

interface Room {
  id: string
  buyer_id: string
  seller_id: string
  car_listings: {
    id: string
    title: string
    price: number
    images: string[]
  } | null
  garages: {
    id: string
    name: string
  } | null
  buyer: {
    full_name: string
    avatar_url: string
  }
  seller: {
    full_name: string
    avatar_url: string
  }
}

export default function ChatRoomPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    init()
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUser(user)
    await fetchRoom(user.id)
    await fetchMessages()
    setupRealtime()
    setLoading(false)
  }

  const fetchRoom = async (userId: string) => {
    const { data } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        car_listings(id, title, price, images),
        garages(id, name),
        buyer:profiles!chat_rooms_buyer_id_fkey(full_name, avatar_url),
        seller:profiles!chat_rooms_seller_id_fkey(full_name, avatar_url)
      `)
      .eq('id', id)
      .single()

    if (!data || (data.buyer_id !== userId && data.seller_id !== userId)) {
      router.push('/chat')
      return
    }
    setRoom(data as any)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('room_id', id)
      .order('created_at', { ascending: true })
    setMessages(data as any || [])
  }

  const setupRealtime = () => {
    if (channelRef.current) return

    channelRef.current = supabase
      .channel(`chat-room-${id}-${Date.now()}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${id}`,
        },
        async (payload: any) => {
          const { data } = await supabase
            .from('chat_messages')
            .select('*, profiles(full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMessages(prev => {
              const exists = prev.find(m => m.id === data.id)
              if (exists) return prev
              return [...prev, data as any]
            })
          }
        }
      )
      .subscribe()
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || sending || !currentUser) return

    setSending(true)
    const text = content.trim()
    setContent('')

    await supabase.from('chat_messages').insert({
      room_id: id,
      sender_id: currentUser.id,
      content: text,
    })

    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    )
  }

  if (!room) return null

  const isbuyer = currentUser?.id === room.buyer_id
  const otherUser = isbuyer ? room.seller : room.buyer

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Link href="/chat" className="text-gray-400 hover:text-gray-600 text-lg">
          ←
        </Link>
        <img
          src={(otherUser as any)?.avatar_url || `https://ui-avatars.com/api/?name=${(otherUser as any)?.full_name}&background=3b82f6&color=fff`}
          alt=""
          className="w-9 h-9 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">{(otherUser as any)?.full_name}</p>
          {room.car_listings && (
            <Link href={`/cars/${room.car_listings.id}`} className="text-xs text-blue-600 hover:underline truncate block">
              {room.car_listings.title} · ฿{room.car_listings.price.toLocaleString()}
            </Link>
          )}
          {room.garages && (
            <Link href={`/garages/${room.garages.id}`} className="text-xs text-blue-600 hover:underline truncate block">
              {room.garages.name}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            เริ่มการสนทนาได้เลยครับ
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUser?.id
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <img
                  src={msg.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${msg.profiles?.full_name}&background=3b82f6&color=fff`}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
                />
              )}
              <div className={`max-w-xs flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-white border text-gray-900 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <p className="text-xs text-gray-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t px-4 py-3 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          ส่ง
        </button>
      </form>
    </div>
  )
}