'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">جاري التحميل...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">الملف الشخصي</h1>

          <div className="space-y-4 mb-8">
            <div>
              <p className="text-sm text-slate-500">البريد الإلكتروني</p>
              <p className="text-slate-800 font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">معرف المستخدم</p>
              <p className="text-slate-600 text-sm break-all">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">تاريخ الإنشاء</p>
              <p className="text-slate-800">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '-'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition"
            >
              العودة للمهام
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-center border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-xl font-medium transition"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}