'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import RichTextEditor from '../../components/RichTextEditor'

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)

  const fetchNotices = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/notices', { credentials: 'include' })
    if (!res.ok) {
      setError('공지사항을 불러오지 못했습니다.')
    } else {
      const data = await res.json()
      setNotices(data.notices || [])
      setError(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSaving(true)
    const res = await fetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: title.trim(), content: content.trim() })
    })

    if (!res.ok) {
      setError('공지사항 등록에 실패했습니다.')
    } else {
      setTitle('')
      setContent('')
      setError(null)
      await fetchNotices()
    }
    setSaving(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">공지사항 관리</h1>
        <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          관리자 홈
        </Link>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} /> 새 공지 등록
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <RichTextEditor value={content} onChange={setContent} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '등록 중...' : '공지 등록'}
        </button>
        {error && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-300">{error}</p>
        )}
      </form>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">공지 목록</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notices.map((notice) => (
              <li key={notice.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{notice.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <Link
                  href={`/admin/notices/${notice.id}`}
                  className="text-sm font-semibold text-blue-600 dark:text-cyan-300 hover:underline"
                >
                  수정
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
