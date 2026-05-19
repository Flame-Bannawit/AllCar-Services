'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  role: string
  is_banned: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const toggleBan = async (id: string, is_banned: boolean) => {
    await supabase.from('profiles').update({ is_banned: !is_banned }).eq('id', id)
    fetchUsers()
  }

  const changeRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    fetchUsers()
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColor: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    seller: 'bg-blue-100 text-blue-700',
    garage: 'bg-green-100 text-green-700',
    buyer: 'bg-gray-100 text-gray-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการผู้ใช้งาน</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">ผู้ใช้</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">สถานะ</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">สมัครเมื่อ</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(user => (
                <tr key={user.id} className={user.is_banned ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name || user.email}&background=3b82f6&color=fff`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || '-'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => changeRole(user.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${roleColor[user.role] || 'bg-gray-100'}`}
                    >
                      <option value="buyer">buyer</option>
                      <option value="seller">seller</option>
                      <option value="garage">garage</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_banned ? (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">ถูกแบน</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">ปกติ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBan(user.id, user.is_banned)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition ${
                        user.is_banned
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {user.is_banned ? 'ปลดแบน' : 'แบน'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500">ไม่พบผู้ใช้งาน</div>
          )}
        </div>
      )}
    </div>
  )
}