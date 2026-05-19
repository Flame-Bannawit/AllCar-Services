'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalUsers: number
  totalCars: number
  pendingCars: number
  totalGarages: number
  pendingGarages: number
  totalReports: number
  pendingReports: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCars: 0,
    pendingCars: 0,
    totalGarages: 0,
    pendingGarages: 0,
    totalReports: 0,
    pendingReports: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const [
      { count: totalUsers },
      { count: totalCars },
      { count: pendingCars },
      { count: totalGarages },
      { count: pendingGarages },
      { count: totalReports },
      { count: pendingReports },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('car_listings').select('*', { count: 'exact', head: true }),
      supabase.from('car_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('garages').select('*', { count: 'exact', head: true }),
      supabase.from('garages').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    setStats({
      totalUsers: totalUsers || 0,
      totalCars: totalCars || 0,
      pendingCars: pendingCars || 0,
      totalGarages: totalGarages || 0,
      pendingGarages: pendingGarages || 0,
      totalReports: totalReports || 0,
      pendingReports: pendingReports || 0,
    })
    setLoading(false)
  }

  const cards = [
    { label: 'ผู้ใช้งานทั้งหมด', value: stats.totalUsers, icon: '👥', color: 'blue' },
    { label: 'ประกาศรถทั้งหมด', value: stats.totalCars, icon: '🚗', color: 'green' },
    { label: 'รอการอนุมัติ (รถ)', value: stats.pendingCars, icon: '⏳', color: 'amber', urgent: stats.pendingCars > 0 },
    { label: 'อู่ซ่อมรถทั้งหมด', value: stats.totalGarages, icon: '🔧', color: 'purple' },
    { label: 'อู่รอการอนุมัติ', value: stats.pendingGarages, icon: '⏳', color: 'amber', urgent: stats.pendingGarages > 0 },
    { label: 'รายงานทั้งหมด', value: stats.totalReports, icon: '🚩', color: 'gray' },
    { label: 'รายงานรอดำเนินการ', value: stats.pendingReports, icon: '🔴', color: 'red', urgent: stats.pendingReports > 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ภาพรวมระบบ</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(card => (
            <div
              key={card.label}
              className={`bg-white rounded-xl border p-5 ${card.urgent ? 'border-red-300 bg-red-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{card.label}</p>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className={`text-3xl font-bold ${card.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h2>
        <div className="space-y-3">
          {stats.pendingCars > 0 && (
            <a href="/admin/cars" className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-xl">🚗</span>
                <div>
                  <p className="font-medium text-amber-800">ประกาศรถรออนุมัติ</p>
                  <p className="text-sm text-amber-600">{stats.pendingCars} รายการ</p>
                </div>
              </div>
              <span className="text-amber-600">→</span>
            </a>
          )}
          {stats.pendingGarages > 0 && (
            <a href="/admin/garages" className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔧</span>
                <div>
                  <p className="font-medium text-purple-800">อู่รออนุมัติ</p>
                  <p className="text-sm text-purple-600">{stats.pendingGarages} รายการ</p>
                </div>
              </div>
              <span className="text-purple-600">→</span>
            </a>
          )}
          {stats.pendingReports > 0 && (
            <a href="/admin/reports" className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
              <div className="flex items-center gap-3">
                <span className="text-xl">🚩</span>
                <div>
                  <p className="font-medium text-red-800">รายงานรอดำเนินการ</p>
                  <p className="text-sm text-red-600">{stats.pendingReports} รายการ</p>
                </div>
              </div>
              <span className="text-red-600">→</span>
            </a>
          )}
          {stats.pendingCars === 0 && stats.pendingGarages === 0 && stats.pendingReports === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">ไม่มีรายการรอดำเนินการครับ ✅</p>
          )}
        </div>
      </div>
    </div>
  )
}