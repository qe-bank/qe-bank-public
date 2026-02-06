'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Trash2 } from 'lucide-react'
import useAdminStatus from '../../../hooks/useAdminStatus'
import UserStatsPanel from './UserStatsPanel'

type AdminUser = {
  id: string
  email: string | null
  created_at: string | null
  last_sign_in_at: string | null
}

type UserBasicStats = {
  historyCount: number
  bookmarkCount: number
  lastAttemptedAt: string | null
}

type UserProfile = {
  is_deleted: boolean
  deleted_at: string | null
}

type RecentHistoryItem = {
  QuestionID: string
  IsCorrect: boolean
  LastAttemptedAt: string
  Questions?: {
    Subject?: string
    QuestionNum?: number
    QuestionText?: string
  }
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isSuperAdmin } = useAdminStatus()
  const rawUserId = params?.userId
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [softDeleting, setSoftDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [basicStats, setBasicStats] = useState<UserBasicStats | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentHistory, setRecentHistory] = useState<RecentHistoryItem[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const historyPerPage = 50
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    const run = async () => {
      await Promise.resolve()
      if (isMounted) setLoading(true)
      const res = await fetch(
        `/api/admin/users/${userId}?page=${historyPage}&perPage=${historyPerPage}`,
        { credentials: 'include' }
      )
      if (!res.ok) {
        if (isMounted) {
          setError('회원 정보를 불러오지 못했습니다.')
          setLoading(false)
        }
        return
      }
      const data = await res.json()
      if (isMounted) {
        setUser(data.user)
        setBasicStats(data.stats)
        setProfile(data.profile)
        setRecentHistory(data.recentHistory || [])
        setHistoryTotal(data.recentHistoryTotal || 0)
        setError(null)
        setLoading(false)
      }
    }

    run()
    return () => { isMounted = false }
  }, [userId, historyPage, refreshKey])

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 회원을 삭제할까요?')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) {
      setError('회원 삭제에 실패했습니다.')
      setDeleting(false)
      return
    }
    router.push('/admin/users')
  }

  const handleSoftDelete = async (action: 'soft_delete' | 'restore') => {
    const msg = action === 'soft_delete'
      ? '이 회원을 소프트 삭제할까요? (복구 가능)'
      : '이 회원을 복구할까요?'
    if (!window.confirm(msg)) return
    setSoftDeleting(true)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action })
    })
    if (!res.ok) {
      setError('회원 상태 변경에 실패했습니다.')
      setSoftDeleting(false)
      return
    }
    setSoftDeleting(false)
    setHistoryPage(1)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">회원 상세</h1>
        <Link href="/admin/users" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          목록으로
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
      ) : (
        <>
          {/* 기본 정보 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>이메일: {user?.email || '-'}</p>
              <p>가입일: {user?.created_at ? new Date(user.created_at).toLocaleString('ko-KR') : '-'}</p>
              <p>최근 로그인: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ko-KR') : '-'}</p>
              <p>사용자 ID: {user?.id}</p>
              <p>
                상태:{' '}
                {profile?.is_deleted ? (
                  <span className="text-red-600 dark:text-red-300">
                    삭제됨 {profile?.deleted_at ? `(${new Date(profile.deleted_at).toLocaleString('ko-KR')})` : ''}
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-300">정상</span>
                )}
              </p>
              <div className="flex gap-6 mt-2">
                <span>풀이 기록: {basicStats?.historyCount ?? 0}건</span>
                <span>북마크: {basicStats?.bookmarkCount ?? 0}건</span>
                <span>마지막 풀이: {basicStats?.lastAttemptedAt ? new Date(basicStats.lastAttemptedAt).toLocaleString('ko-KR') : '-'}</span>
              </div>
            </div>
          </div>

          {/* 상세 통계 대시보드 */}
          {userId && <UserStatsPanel userId={userId} />}

          {/* 최근 풀이 기록 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">
              최근 풀이 기록 (페이지당 {historyPerPage}개)
            </h2>
            {recentHistory.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">최근 풀이 기록이 없습니다.</p>
            ) : (
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {recentHistory.map((item) => (
                  <li key={`${item.QuestionID}-${item.LastAttemptedAt}`} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="truncate">
                        {item.Questions?.Subject || '-'} {item.Questions?.QuestionNum || ''}번
                      </div>
                      <div className="truncate text-gray-400 dark:text-gray-500">
                        {item.Questions?.QuestionText || ''}
                      </div>
                    </div>
                    <span className={item.IsCorrect ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}>
                      {item.IsCorrect ? '정답' : '오답'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {historyTotal > historyPerPage && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  이전
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {historyPage} / {Math.max(1, Math.ceil(historyTotal / historyPerPage))}
                </span>
                <button
                  onClick={() => setHistoryPage((p) => Math.min(Math.ceil(historyTotal / historyPerPage), p + 1))}
                  disabled={historyPage >= Math.ceil(historyTotal / historyPerPage)}
                  className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            )}
          </div>

          {/* 관리 버튼 */}
          <div className="flex flex-wrap justify-end gap-3">
            {profile?.is_deleted ? (
              <button
                onClick={() => handleSoftDelete('restore')}
                disabled={softDeleting}
                className="px-4 py-2 font-semibold text-green-700 border border-green-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
              >
                {softDeleting ? '복구 중...' : '복구'}
              </button>
            ) : (
              <button
                onClick={() => handleSoftDelete('soft_delete')}
                disabled={softDeleting}
                className="px-4 py-2 font-semibold text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-50"
              >
                {softDeleting ? '처리 중...' : '소프트 삭제'}
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting ? '삭제 중...' : '영구 삭제'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
