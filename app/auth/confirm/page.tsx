'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const [status, setStatus] = useState('กำลังเข้าสู่ระบบ...')
  const supabase = createClient()

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace('#', '?'))
      const code = params.get('code')

      if (code) {
        setStatus('กำลังยืนยันตัวตน...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          setStatus(`เกิดข้อผิดพลาด: ${error.message}`)
          setTimeout(() => {
            window.location.href = '/login?error=auth'
          }, 2000)
          return
        }

        if (data.session) {
          setStatus('เข้าสู่ระบบสำเร็จ! กำลังพาไปหน้าหลัก...')
          setTimeout(() => {
            window.location.href = '/'
          }, 500)
          return
        }
      }

      // ถ้าไม่มี code ลองดู session ที่มีอยู่
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        window.location.href = '/'
      } else {
        window.location.href = '/login'
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-xl border shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}