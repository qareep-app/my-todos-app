'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

type Todo = {
  id: number
  title: string
  is_complete: boolean
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      loadTodos()
    }
    checkUser()
  }, [])

  async function loadTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true })

    if (error) setError(error.message)
    else setTodos(data || [])
    setLoading(false)
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const { error } = await supabase
      .from('todos')
      .insert({ title: newTitle.trim(), is_complete: false, user_id: user?.id })

    if (error) setError(error.message)
    else {
      setNewTitle('')
      loadTodos()
    }
  }

  async function toggleTodo(id: number, current: boolean) {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !current })
      .eq('id', id)

    if (error) setError(error.message)
    else loadTodos()
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) setError(error.message)
    else loadTodos()
  }

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
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">قائمة المهام</h1>
            <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
            >
              البروفايل
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
            >
              تسجيل خروج
            </button>
          </div>
        </div>

        <form onSubmit={addTodo} className="flex gap-3 mb-8">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="اكتب مهمة جديدة..."
            className="flex-1 border border-slate-200 rounded-xl px-5 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition shadow-sm"
          >
            إضافة
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {todos.length === 0 ? (
          <p className="text-center text-slate-400 py-10">مفيش مهام لسه. ابدأ بإضافة واحدة!</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition"
              >
                <input
                  type="checkbox"
                  checked={todo.is_complete}
                  onChange={() => toggleTodo(todo.id, todo.is_complete)}
                  className="w-5 h-5 rounded accent-blue-600 cursor-pointer"
                />
                <span className={`flex-1 ${todo.is_complete ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}