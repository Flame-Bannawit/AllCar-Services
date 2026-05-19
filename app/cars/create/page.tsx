'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const BRANDS = ['Toyota', 'Honda', 'Isuzu', 'Ford', 'Mazda', 'Nissan', 'Mitsubishi', 'BMW', 'Mercedes-Benz', 'Audi', 'Chevrolet', 'Suzuki', 'Subaru', 'Lexus', 'Volvo', 'อื่นๆ']
const PROVINCES = ['กรุงเทพมหานคร', 'เชียงใหม่', 'ชลบุรี', 'ภูเก็ต', 'ขอนแก่น', 'นครราชสีมา', 'สงขลา', 'อุดรธานี', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'เชียงราย', 'นครศรีธรรมราช', 'อื่นๆ']

export default function CreateCarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    brand: 'Toyota',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel_type: 'gasoline',
    transmission: 'auto',
    color: '',
    province: 'กรุงเทพมหานคร',
    description: '',
    is_financed: false,
    can_transfer: true,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 10) {
      setError('อัปโหลดได้สูงสุด 10 รูปครับ')
      return
    }
    setImages(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
    setError('')
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (images.length < 5) {
      setError('กรุณาอัปโหลดรูปอย่างน้อย 5 รูปครับ')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Upload images
      const imageUrls: string[] = []
      for (const image of images) {
        const ext = image.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(path, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('car-images')
          .getPublicUrl(path)

        imageUrls.push(publicUrl)
      }

      // Insert listing
      const { error: insertError } = await supabase
        .from('car_listings')
        .insert({
          seller_id: user.id,
          title: form.title,
          brand: form.brand,
          model: form.model,
          year: form.year,
          price: Number(form.price),
          mileage: Number(form.mileage),
          fuel_type: form.fuel_type,
          transmission: form.transmission,
          color: form.color,
          province: form.province,
          description: form.description,
          is_financed: form.is_financed,
          can_transfer: form.can_transfer,
          images: imageUrls,
          status: 'pending',
        })

      if (insertError) throw insertError

      router.push('/cars?submitted=true')

    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่ครับ')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ลงประกาศขายรถ</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* รูปภาพ */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">รูปภาพรถ <span className="text-red-500">*</span> <span className="text-sm font-normal text-gray-500">(ต้องมีอย่างน้อย 5 รูป)</span></h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.length < 10 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <span className="text-2xl text-gray-400">+</span>
                <span className="text-xs text-gray-400 mt-1">เพิ่มรูป</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">{images.length}/10 รูป</p>
        </div>

        {/* ข้อมูลรถ */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">ข้อมูลรถ</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อประกาศ <span className="text-red-500">*</span></label>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="เช่น Toyota Camry 2020 สีขาว ออโต้ รถมือเดียว"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ <span className="text-red-500">*</span></label>
              <select value={form.brand} onChange={e => set('brand', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {BRANDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น <span className="text-red-500">*</span></label>
              <input required value={form.model} onChange={e => set('model', e.target.value)} placeholder="เช่น Camry, Civic" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ปีรถ <span className="text-red-500">*</span></label>
              <input required type="number" min="1990" max={new Date().getFullYear()} value={form.year} onChange={e => set('year', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สี <span className="text-red-500">*</span></label>
              <input required value={form.color} onChange={e => set('color', e.target.value)} placeholder="เช่น ขาว, ดำ, แดง" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เชื้อเพลิง <span className="text-red-500">*</span></label>
              <select value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="gasoline">เบนซิน</option>
                <option value="diesel">ดีเซล</option>
                <option value="electric">ไฟฟ้า</option>
                <option value="hybrid">ไฮบริด</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เกียร์ <span className="text-red-500">*</span></label>
              <select value={form.transmission} onChange={e => set('transmission', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="auto">ออโต้</option>
                <option value="manual">แมนวล</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
              <input required type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="เช่น 850000" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลขไมล์ (กม.) <span className="text-red-500">*</span></label>
              <input required type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="เช่น 50000" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด <span className="text-red-500">*</span></label>
            <select value={form.province} onChange={e => set('province', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              {PROVINCES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="เช่น สภาพดี ไม่เคยชน รถมือเดียว ประวัติเข้าศูนย์ตลอด..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.can_transfer} onChange={e => set('can_transfer', e.target.checked)} className="rounded" />
              โอนได้ทันที
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.is_financed} onChange={e => set('is_financed', e.target.checked)} className="rounded" />
              ติดไฟแนนซ์
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'กำลังส่งประกาศ...' : 'ส่งประกาศเพื่อรอการอนุมัติ'}
        </button>

        <p className="text-center text-xs text-gray-400">
          ประกาศของคุณจะถูกตรวจสอบโดย Admin ก่อนแสดงบนเว็บไซต์
        </p>
      </form>
    </div>
  )
}