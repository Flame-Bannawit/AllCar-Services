'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = 'https://all-car-services.vercel.app/'
      }
    })

    const hash = window.location.hash
    if (hash.includes('access_token=')) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.location.href = 'https://all-car-services.vercel.app/'
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  )
}