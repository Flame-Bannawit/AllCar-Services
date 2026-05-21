'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const supabase = createClient()

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('code=')) {
      const code = hash.split('code=')[1].split('&')[0]
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.session) {
          window.location.href = 'https://all-car-services.vercel.app/'
        } else {
          window.location.href = 'https://all-car-services.vercel.app/login?error=auth'
        }
      })
    } else {
      window.location.href = 'https://all-car-services.vercel.app/'
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">กำลังเข้าสู่ระบบ...</p>
    </div>
  )
}