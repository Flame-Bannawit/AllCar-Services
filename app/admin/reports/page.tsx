'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Report {
  id: string
  report_type: string
  description: string
  status: string
  target_type: string
  target_id: string
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const supabase = createClient()

  useEffect(() => {
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*, profiles(full_name, email)')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase
      .from('reports')
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    fetchReports()
  }

  const reportTypeLabel: Record<string, string> = {
    fake_listing: '🚗 ประกาศปลอม',
    scam: '💸 โกง',
    inappropriate: '⚠️ ไม่เหมาะสม',
    wrong_info: '❌ ข้อมูลผิด',
    other: '📝 อื่นๆ',
  }

  const targetTypeLabel: Record<string, string> = {
    listing: 'ประกาศรถ',
    user: 'ผู้ใช้',
    garage: 'อู่ซ่อมรถ',
  }

  const statusLabel: Record<string, string> = {
    pending: 'รอดำเนินการ',
    reviewed: 'กำลังตรวจสอบ',
    resolved: 'แก้ไขแล้ว',
    dismissed: 'ยกเลิก',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการรายงาน</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['pending', 'reviewed', 'resolved', 'dismissed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🚩</p>
          <p>ไม่มีรายงานในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {reportTypeLabel[report.report_type] || report.report_type}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {targetTypeLabel[report.target_type]}
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>รายงานโดย {report.profiles?.full_name || report.profiles?.email}</span>
                    <span>·</span>
                    <span>{new Date(report.created_at).toLocaleDateString('th-TH')}</span>
                  </div>

                  
                  <a
                    href={
                      report.target_type === 'listing'
                        ? `/cars/${report.target_id}`
                        : report.target_type === 'garage'
                        ? `/garages/${report.target_id}`
                        : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    ดูเนื้อหาที่ถูกรายงาน →
                  </a>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {filter === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(report.id, 'reviewed')}
                        className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-100"
                      >
                        กำลังตรวจสอบ
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'resolved')}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
                      >
                        แก้ไขแล้ว ✓
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'dismissed')}
                        className="bg-gray-50 text-gray-600 border px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100"
                      >
                        ยกเลิก
                      </button>
                    </>
                  )}
                  {filter === 'reviewed' && (
                    <>
                      <button
                        onClick={() => updateStatus(report.id, 'resolved')}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
                      >
                        แก้ไขแล้ว ✓
                      </button>
                      <button
                        onClick={() => updateStatus(report.id, 'dismissed')}
                        className="bg-gray-50 text-gray-600 border px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100"
                      >
                        ยกเลิก
                      </button>
                    </>
                  )}
                  {(filter === 'resolved' || filter === 'dismissed') && (
                    <button
                      onClick={() => updateStatus(report.id, 'pending')}
                      className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg text-xs hover:bg-amber-100"
                    >
                      เปิดใหม่
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}