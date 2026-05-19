'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }
    setChecking(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">กำลังตรวจสอบสิทธิ์...</div>
      </div>
    )
  }

  const menus = [
    { href: '/admin', label: 'ภาพรวม', icon: '📊' },
    { href: '/admin/cars', label: 'ประกาศรถ', icon: '🚗' },
    { href: '/admin/garages', label: 'อู่ซ่อมรถ', icon: '🔧' },
    { href: '/admin/users', label: 'ผู้ใช้งาน', icon: '👥' },
    { href: '/admin/reports', label: 'รายงาน', icon: '🚩' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex-shrink-0">
        <div className="p-4 border-b">
          <p className="font-bold text-blue-600">AllCar Admin</p>
          <p className="text-xs text-gray-400 mt-1">จัดการระบบ</p>
        </div>
        <nav className="p-3 space-y-1">
          {menus.map(menu => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                pathname === menu.href
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}