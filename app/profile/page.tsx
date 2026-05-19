'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  phone: string
  role: string
  created_at: string
}

interface CarListing {
  id: string
  title: string
  price: number
  status: string
  images: string[]
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myListings, setMyListings] = useState<CarListing[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setForm({ full_name: profileData.full_name || '', phone: profileData.phone || '' })
    }

    const { data: listings } = await supabase
      .from('car_listings')
      .select('id, title, price, status, images, created_at')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    setMyListings(listings || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', profile.id)
    setProfile(prev => prev ? { ...prev, ...form } : prev)
    setEditing(false)
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    draft:    { label: 'แบบร่าง',      color: 'bg-gray-100 text-gray-600' },
    pending:  { label: 'รออนุมัติ',    color: 'bg-amber-100 text-amber-700' },
    active:   { label: 'ประกาศอยู่',   color: 'bg-green-100 text-green-700' },
    sold:     { label: 'ขายแล้ว',      color: 'bg-blue-100 text-blue-700' },
    rejected: { label: 'ถูกปฏิเสธ',   color: 'bg-red-100 text-red-700' },
    expired:  { label: 'หมดอายุ',      color: 'bg-gray-100 text-gray-500' },
  }

  const roleLabel: Record<string, string> = {
    buyer: 'ผู้ซื้อ', seller: 'ผู้ขาย', garage: 'เจ้าของอู่', admin: 'แอดมิน'
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl mb-6" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Profile Card */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start gap-4">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || profile.email}&background=3b82f6&color=fff&size=128`}
            alt=""
            className="w-20 h-20 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อ-นามสกุล</label>
                  <input
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="เช่น 081-234-5678"
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {profile.full_name || 'ไม่ได้ระบุชื่อ'}
                  </h1>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {roleLabel[profile.role] || profile.role}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                {profile.phone && <p className="text-gray-500 text-sm">📞 {profile.phone}</p>}
                <p className="text-gray-400 text-xs mt-1">
                  สมาชิกตั้งแต่ {new Date(profile.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  แก้ไขโปรไฟล์
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/chat" className="bg-white rounded-xl border p-4 hover:shadow-sm transition text-center">
          <p className="text-2xl mb-1">💬</p>
          <p className="text-sm font-medium text-gray-900">แชทของฉัน</p>
        </Link>
        <Link href="/cars/create" className="bg-white rounded-xl border p-4 hover:shadow-sm transition text-center">
          <p className="text-2xl mb-1">🚗</p>
          <p className="text-sm font-medium text-gray-900">ลงประกาศขายรถ</p>
        </Link>
      </div>

      {/* ประกาศของฉัน */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">ประกาศของฉัน ({myListings.length})</h2>

        {myListings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-3xl mb-2">🚗</p>
            <p className="text-sm">ยังไม่มีประกาศครับ</p>
            <Link href="/cars/create" className="mt-2 inline-block text-blue-600 text-sm hover:underline">
              ลงประกาศเลย →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map(listing => (
              <Link key={listing.id} href={`/cars/${listing.id}`}>
                <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer border">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{listing.title}</p>
                    <p className="text-blue-600 font-bold text-sm">฿{listing.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabel[listing.status]?.color}`}>
                        {statusLabel[listing.status]?.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(listing.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition"
      >
        ออกจากระบบ
      </button>
    </div>
  )
}