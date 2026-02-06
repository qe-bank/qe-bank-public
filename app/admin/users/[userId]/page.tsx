'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Trash2 } from 'lucide-react'
import useAdminStatus from '../../../hooks/useAdminStatus'

type AdminUser = {
  id: string
  email: string | null
  created_at: string | null
  last_sign_in_at: string | null
}

type UserStats = {
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

type AdminStatsResponse = {
  range: { start: string; end: string }
  totals: {
    total: number
    correct: number
    incorrect: number
    accuracy: number
  }
  dailyCounts: Record<string, number>
  itemsByDate: Record<string, RecentHistoryItem[]>
  subjectCounts: Record<string, { total: number; correct: number }>
  categoryCounts: Record<string, { total: number; correct: number }>
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
  const [stats, setStats] = useState<UserStats | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentHistory, setRecentHistory] = useState<RecentHistoryItem[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const historyPerPage = 50
  const [refreshKey, setRefreshKey] = useState(0)

  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [statsDetail, setStatsDetail] = useState<AdminStatsResponse | null>(null)
  const [rangeStart, setRangeStart] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    return start.toISOString().slice(0, 10)
  })
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().slice(0, 10))
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    const run = async () => {
      await Promise.resolve()
      if (isMounted) {
        setLoading(true)
      }
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
        setStats(data.stats)
        setProfile(data.profile)
        setRecentHistory(data.recentHistory || [])
        setHistoryTotal(data.recentHistoryTotal || 0)
        setError(null)
        setLoading(false)
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [userId, historyPage, refreshKey])

  useEffect(() => {
    if (!userId || !rangeStart || !rangeEnd) return
    let isMounted = true

    const run = async () => {
      setStatsLoading(true)
      const res = await fetch(
        `/api/admin/users/${userId}/stats?start=${rangeStart}&end=${rangeEnd}`,
        { credentials: 'include' }
      )
      if (!res.ok) {
        if (isMounted) {
          setStatsError('상세 통계를 불러오지 못했습니다.')
          setStatsLoading(false)
        }
        return
      }
      const data = await res.json()
      if (isMounted) {
        setStatsDetail(data)
        setStatsError(null)
        setStatsLoading(false)
        setSelectedDate(null)
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [userId, rangeStart, rangeEnd])

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
    const confirmMessage =
      action === 'soft_delete'
        ? '이 회원을 소프트 삭제할까요? (복구 가능)'
        : '이 회원을 복구할까요?'
    if (!window.confirm(confirmMessage)) return
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

  const calendarDays = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
    const days = []
    const startOffset = start.getDay()
    for (let i = 0; i < startOffset; i += 1) {
      days.push(null)
    }
    for (let day = 1; day <= end.getDate(); day += 1) {
      const current = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
      const key = current.toISOString().slice(0, 10)
      days.push({ date: current, key })
    }
    return days
  }, [calendarMonth])

  const sortedSubjectStats = useMemo(() => {
    if (!statsDetail?.subjectCounts) return []
    return Object.entries(statsDetail.subjectCounts).sort((a, b) => b[1].total - a[1].total)
  }, [statsDetail])

  const sortedCategoryStats = useMemo(() => {
    if (!statsDetail?.categoryCounts) return []
    return Object.entries(statsDetail.categoryCounts).sort((a, b) => b[1].total - a[1].total)
  }, [statsDetail])

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
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
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">통계/기록</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>풀이 기록 수: {stats?.historyCount ?? 0}</p>
              <p>북마크 수: {stats?.bookmarkCount ?? 0}</p>
              <p>마지막 풀이: {stats?.lastAttemptedAt ? new Date(stats.lastAttemptedAt).toLocaleString('ko-KR') : '-'}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                최근 풀이 기록 (페이지당 {historyPerPage}개)
              </h3>
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
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">상세 통계</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="text-gray-600 dark:text-gray-300">
                  시작
                  <input
                    type="date"
                    className="ml-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                  />
                </label>
                <label className="text-gray-600 dark:text-gray-300">
                  종료
                  <input
                    type="date"
                    className="ml-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {statsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-gray-400" />
              </div>
            ) : statsError ? (
              <p className="text-sm text-red-500 dark:text-red-300">{statsError}</p>
            ) : statsDetail ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-4 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">풀이 수</p>
                    <p className="text-xl font-bold">{statsDetail.totals.total}</p>
                  </div>
                  <div className="p-4 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">정답</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-300">
                      {statsDetail.totals.correct}
                    </p>
                  </div>
                  <div className="p-4 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">오답</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-300">
                      {statsDetail.totals.incorrect}
                    </p>
                  </div>
                  <div className="p-4 rounded border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">정답률</p>
                    <p className="text-xl font-bold">{statsDetail.totals.accuracy}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">과목별 풀이 수/정답률</h3>
                    {sortedSubjectStats.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                    ) : (
                      <ul className="space-y-2 text-xs">
                        {sortedSubjectStats.map(([subject, stats]) => {
                          const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 1000) / 10
                          return (
                            <li key={subject} className="flex items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                              <span className="font-medium">{subject}</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {stats.total}문항 · {accuracy}%
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">영역별 풀이 수/정답률</h3>
                    {sortedCategoryStats.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
                    ) : (
                      <ul className="space-y-2 text-xs">
                        {sortedCategoryStats.map(([category, stats]) => {
                          const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 1000) / 10
                          return (
                            <li key={category} className="flex items-center justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-2">
                              <span className="font-medium">{category}</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {stats.total}문항 · {accuracy}%
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">달력 보기</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded"
                          onClick={() =>
                            setCalendarMonth(
                              new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                            )
                          }
                        >
                          이전
                        </button>
                        <span className="text-gray-600 dark:text-gray-300">
                          {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                        </span>
                        <button
                          type="button"
                          className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded"
                          onClick={() =>
                            setCalendarMonth(
                              new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                            )
                          }
                        >
                          다음
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-xs text-center text-gray-400 mb-2">
                      {['일', '월', '화', '수', '목', '금', '토'].map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-xs">
                      {calendarDays.map((day, idx) => {
                        if (!day) {
                          return <div key={`empty-${idx}`} />
                        }
                        const count = statsDetail.dailyCounts[day.key] || 0
                        const isSelected = selectedDate === day.key
                        return (
                          <button
                            type="button"
                            key={day.key}
                            className={`h-14 rounded border text-left px-2 py-1 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => setSelectedDate(day.key)}
                          >
                            <div className="font-semibold">{day.date.getDate()}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">
                              {count ? `${count}문항` : '0'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">선택 날짜 문제 목록</h3>
                    {!selectedDate ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        달력에서 날짜를 선택하세요.
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {selectedDate}
                        </p>
                        {statsDetail.itemsByDate[selectedDate]?.length ? (
                          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 max-h-80 overflow-y-auto">
                            {statsDetail.itemsByDate[selectedDate].map((item) => (
                              <li
                                key={`${item.QuestionID}-${item.LastAttemptedAt}`}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <div className="truncate">
                                    {item.Questions?.Subject || '-'} {item.Questions?.QuestionNum || ''}번
                                  </div>
                                  <div className="truncate text-gray-400 dark:text-gray-500">
                                    {item.Questions?.QuestionText || ''}
                                  </div>
                                </div>
                                <span
                                  className={
                                    item.IsCorrect
                                      ? 'text-green-600 dark:text-green-300'
                                      : 'text-red-600 dark:text-red-300'
                                  }
                                >
                                  {item.IsCorrect ? '정답' : '오답'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400">풀이 기록이 없습니다.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
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
