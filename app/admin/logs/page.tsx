'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const PER_PAGE = 20

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLogs = async (nextPage) => {
    setLoading(true)
    const res = await fetch(`/api/admin/logs?page=${nextPage}&perPage=${PER_PAGE}`, {
      credentials: 'include'
    })
    if (!res.ok) {
      setError('활동 로그를 불러오지 못했습니다.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setLogs(data.logs || [])
    setTotal(data.total || 0)
    setError(null)
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">관리자 활동 로그</h1>
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
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">기록이 없습니다.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {logs.map((log) => (
                <li key={log.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">{log.action}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {log.created_at ? new Date(log.created_at).toLocaleString('ko-KR') : '-'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 space-x-2">
                    <span>관리자: {log.admin_id}</span>
                    {log.target_user_id && <span>회원: {log.target_user_id}</span>}
                    {log.target_notice_id && <span>공지: {log.target_notice_id}</span>}
                  </div>
                  {log.payload && (
                    <pre className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
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
