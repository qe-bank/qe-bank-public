'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const PER_PAGE = 20

export default function AdminUsersPage() {
  type AdminUser = {
    id: string
    email: string | null
    created_at: string | null
    last_sign_in_at: string | null
    profile?: {
      is_deleted?: boolean
      deleted_at?: string | null
    } | null
  }

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async (nextPage: number) => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?page=${nextPage}&perPage=${PER_PAGE}`, {
      credentials: 'include'
    })

    if (!res.ok) {
      setError('회원 목록을 불러오지 못했습니다.')
      setLoading(false)
      return
    }

    const data = await res.json()
    setUsers(data.users || [])
    setTotal(data.total || 0)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers(page)
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">회원 관리</h1>
        <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          관리자 홈
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">회원이 없습니다.</p>
        ) : (
          <>
            <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              총 {total}명
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <li key={user.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.email || '이메일 없음'}
                      </p>
                      {user.profile?.is_deleted && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">
                          삭제됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      가입일: {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                      {' · '}
                      최근 로그인: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}
                    </p>
                  </div>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-sm font-semibold text-blue-600 dark:text-cyan-300 hover:underline"
                  >
                    상세
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  이전
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
