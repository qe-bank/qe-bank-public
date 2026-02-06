'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Trash2 } from 'lucide-react'
import RichTextEditor from '../../../components/RichTextEditor'

export default function AdminNoticeEditPage() {
  const params = useParams()
  const router = useRouter()
  const rawNoticeId = params?.id
  const noticeId = Array.isArray(rawNoticeId) ? rawNoticeId[0] : rawNoticeId
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNotice = async () => {
      if (!noticeId) return
      setLoading(true)
      const res = await fetch(`/api/admin/notices/${noticeId}`, {
        credentials: 'include'
      })

      if (!res.ok) {
        setError('공지사항을 불러오지 못했습니다.')
      } else {
        const payload = await res.json()
        setTitle(payload.notice?.title || '')
        setContent(payload.notice?.content || '')
        setError(null)
      }
      setLoading(false)
    }

    fetchNotice()
  }, [supabase, noticeId])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSaving(true)
    const res = await fetch(`/api/admin/notices/${noticeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: title.trim(), content: content.trim() })
    })

    if (!res.ok) {
      setError('공지사항 수정에 실패했습니다.')
    } else {
      setError(null)
      router.push('/admin/notices')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('이 공지사항을 삭제할까요?')) return

    setDeleting(true)
    const res = await fetch(`/api/admin/notices/${noticeId}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) {
      setError('공지사항 삭제에 실패했습니다.')
      setDeleting(false)
      return
    }

    router.push('/admin/notices')
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">공지사항 수정</h1>
        <Link href="/admin/notices" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          목록으로
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
        >
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
          {error && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-300">{error}</p>
          )}
          <div className="mt-5 flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
