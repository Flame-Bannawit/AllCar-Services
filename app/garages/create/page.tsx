'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const SERVICES = ['ซ่อมเครื่องยนต์', 'เปลี่ยนยาง', 'ล้างรถ', 'ตรวจเช็คระยะ', 'ซ่อมช่วงล่าง', 'ซ่อมไฟฟ้า', 'เปลี่ยนถ่ายน้ำมัน', 'ซ่อมแอร์', 'พ่นสี', 'เคาะพ่นสี']
const PROVINCES = ['กรุงเทพมหานคร', 'เชียงใหม่', 'ชลบุรี', 'ภูเก็ต', 'ขอนแก่น', 'นครราชสีมา', 'สงขลา', 'อุดรธานี', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'เชียงราย', 'นครศรีธรรมราช', 'อื่นๆ']

export default function CreateGaragePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    province: 'กรุงเทพมหานคร',
    lat: '',
    lng: '',
    open_hours: '',
  })

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      setError('อัปโหลดได้สูงสุด 5 รูปครับ')
      return
    }
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    setError('')
  }

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const toggleService = (s: string) => {
    setSelectedServices(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        set('lat', pos.coords.latitude.toString())
        set('lng', pos.coords.longitude.toString())
        setLocating(false)
      },
      () => {
        setError('ไม่สามารถดึงตำแหน่งได้ครับ กรุณากรอกเองครับ')
        setLocating(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedServices.length === 0) {
      setError('กรุณาเลือกบริการอย่างน้อย 1 อย่างครับ')
      return
    }
    if (!form.lat || !form.lng) {
      setError('กรุณาระบุตำแหน่งอู่ครับ')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const imageUrls: string[] = []
      for (const image of images) {
        const ext = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('garage-images')
          .upload(path, image)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('garage-images').getPublicUrl(path)
        imageUrls.push(publicUrl)
      }

      const { error: insertError } = await supabase.from('garages').insert({
        owner_id: user.id,
        name: form.name,
        description: form.description,
        phone: form.phone,
        address: form.address,
        province: form.province,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        services: selectedServices,
        images: imageUrls,
        open_hours: form.open_hours,
        status: 'pending',
      })

      if (insertError) throw insertError
      router.push('/garages?submitted=true')

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่ครับ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ลงทะเบียนอู่ซ่อมรถ</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* รูปภาพ */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">รูปภาพอู่ <span className="text-sm font-normal text-gray-500">(สูงสุด 5 รูป)</span></h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <span className="text-2xl text-gray-400">+</span>
                <span className="text-xs text-gray-400 mt-1">เพิ่มรูป</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* ข้อมูลอู่ */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">ข้อมูลอู่</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่ออู่ <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="เช่น อู่ช่างสมชาย" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
            <input required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="เช่น 081-234-5678" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ <span className="text-red-500">*</span></label>
            <textarea required value={form.address} onChange={e => set('address', e.target.value)} rows={2} placeholder="เช่น 123 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด <span className="text-red-500">*</span></label>
              <select value={form.province} onChange={e => set('province', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เวลาทำการ</label>
              <input value={form.open_hours} onChange={e => set('open_hours', e.target.value)} placeholder="เช่น จ-ศ 8:00-17:00" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="แนะนำอู่ของคุณ..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* ตำแหน่งที่ตั้ง */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">ตำแหน่งที่ตั้ง <span className="text-red-500">*</span></h2>

          <button
            type="button"
            onClick={getLocation}
            disabled={locating}
            className="w-full border border-blue-300 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-50 transition disabled:opacity-50"
          >
            {locating ? 'กำลังดึงตำแหน่ง...' : '📍 ใช้ตำแหน่งปัจจุบัน'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="เช่น 13.7563" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="เช่น 100.5018" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400">หรือกรอก Latitude/Longitude จาก Google Maps ได้เลยครับ</p>
        </div>

        {/* บริการ */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">บริการของอู่ <span className="text-red-500">*</span></h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`px-3 py-2 rounded-lg text-sm border transition ${
                  selectedServices.includes(s)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเพื่อรอการอนุมัติ'}
        </button>

        <p className="text-center text-xs text-gray-400">อู่ของคุณจะถูกตรวจสอบโดย Admin ก่อนแสดงบนเว็บไซต์</p>
      </form>
    </div>
  )
}