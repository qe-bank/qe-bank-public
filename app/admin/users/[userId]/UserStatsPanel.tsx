'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  SubjectCorrectWrongBar,
  CategoryDrilldownBar,
  DailyStackedBar,
  AccuracyDonut,
  SubjectAccuracyHBar
} from './AdminStatsCharts'

// ─── types ───

type QuestionInfo = {
  QuestionNum?: number
  QuestionText?: string
  Subject?: string
  Category?: string
}

type HistoryItem = {
  QuestionID: string
  IsCorrect: boolean
  LastAttemptedAt: string
  Questions: QuestionInfo | QuestionInfo[]
}

type CountPair = { total: number; correct: number }

type StatsResponse = {
  range: { start: string; end: string }
  totals: { total: number; correct: number; incorrect: number; accuracy: number }
  dailyCounts: Record<string, number>
  itemsByDate: Record<string, HistoryItem[]>
  subjectCounts: Record<string, CountPair>
  categoryCounts: Record<string, CountPair>
  subjectCategoryMap: Record<string, Record<string, CountPair>>
  recentWrong: HistoryItem[]
  subjectStatsChart: Array<{ name: string; total: number; correct: number; wrong: number }>
  categoryStatsChart: Array<{ name: string; total: number; correct: number; wrong: number }>
  dailyStatsChart: Array<{ day: string; total: number; correct: number; wrong: number }>
}

type Tab = 'subject' | 'daily' | 'accuracy'

const TABS: { key: Tab; label: string }[] = [
  { key: 'subject', label: '과목별' },
  { key: 'daily', label: '일자별' },
  { key: 'accuracy', label: '정오답 분석' }
]

// ─── helpers ───

function getQuestion(item: HistoryItem): QuestionInfo {
  return Array.isArray(item.Questions) ? item.Questions[0] ?? {} : item.Questions ?? {}
}

// ─── component ───

export default function UserStatsPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<StatsResponse | null>(null)

  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 29)
    return d.toISOString().slice(0, 10)
  })
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().slice(0, 10))

  const [activeTab, setActiveTab] = useState<Tab>('subject')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // ─── fetch ───
  useEffect(() => {
    if (!userId || !rangeStart || !rangeEnd) return
    let mounted = true

    const run = async () => {
      setLoading(true)
      const res = await fetch(
        `/api/admin/users/${userId}/stats?start=${rangeStart}&end=${rangeEnd}`,
        { credentials: 'include' }
      )
      if (!res.ok) {
        if (mounted) {
          setError('상세 통계를 불러오지 못했습니다.')
          setLoading(false)
        }
        return
      }
      const json = await res.json()
      if (mounted) {
        setData(json)
        setError(null)
        setLoading(false)
        setSelectedSubject(null)
        setSelectedDate(null)
      }
    }

    run()
    return () => { mounted = false }
  }, [userId, rangeStart, rangeEnd])

  // ─── derived: 과목 드릴다운 ───
  const categoryDrilldownData = useMemo(() => {
    if (!data || !selectedSubject) return []
    const map = data.subjectCategoryMap[selectedSubject]
    if (!map) return []
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, v]) => ({ name, total: v.total, correct: v.correct, wrong: v.total - v.correct }))
  }, [data, selectedSubject])

  // ─── derived: 과목별 정답률 ───
  const subjectAccuracyData = useMemo(() => {
    if (!data) return []
    return Object.entries(data.subjectCounts).map(([name, v]) => ({
      name,
      total: v.total,
      correct: v.correct,
      accuracy: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 1000) / 10
    }))
  }, [data])

  // ─── derived: 달력 ───
  const calendarDays = useMemo(() => {
    const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
    const days: Array<{ date: Date; key: string } | null> = []
    for (let i = 0; i < start.getDay(); i++) days.push(null)
    for (let d = 1; d <= end.getDate(); d++) {
      const dt = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d)
      days.push({ date: dt, key: dt.toISOString().slice(0, 10) })
    }
    return days
  }, [calendarMonth])

  // ─── render ───
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      {/* 기간 선택 */}
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

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
      ) : !data ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">데이터가 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {/* KPI 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <KpiCard label="풀이 수" value={data.totals.total} />
            <KpiCard label="정답" value={data.totals.correct} className="text-green-600 dark:text-green-300" />
            <KpiCard label="오답" value={data.totals.incorrect} className="text-red-600 dark:text-red-300" />
            <KpiCard label="정답률" value={`${data.totals.accuracy}%`} />
          </div>

          {/* 탭 */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-cyan-300'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 탭 내용 */}
          {activeTab === 'subject' && (
            <TabSubject
              data={data}
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
              categoryDrilldownData={categoryDrilldownData}
            />
          )}
          {activeTab === 'daily' && (
            <TabDaily
              data={data}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              calendarDays={calendarDays}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          )}
          {activeTab === 'accuracy' && (
            <TabAccuracy
              data={data}
              subjectAccuracyData={subjectAccuracyData}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── sub-components ───

function KpiCard({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="p-4 rounded border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${className || ''}`}>{value}</p>
    </div>
  )
}

// ─── 과목별 탭 ───
function TabSubject({
  data,
  selectedSubject,
  onSelectSubject,
  categoryDrilldownData
}: {
  data: StatsResponse
  selectedSubject: string | null
  onSelectSubject: (s: string | null) => void
  categoryDrilldownData: Array<{ name: string; total: number; correct: number; wrong: number }>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">과목별 정답/오답 수 (클릭하여 영역 보기)</h3>
        <SubjectCorrectWrongBar
          data={data.subjectStatsChart}
          onClickSubject={(s) => onSelectSubject(s === selectedSubject ? null : s)}
        />
      </div>

      {selectedSubject && (
        <div className="p-4 rounded border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">
              {selectedSubject} &gt; 영역별 정답/오답
            </h3>
            <button
              type="button"
              className="text-xs text-gray-500 hover:underline"
              onClick={() => onSelectSubject(null)}
            >
              접기
            </button>
          </div>
          <CategoryDrilldownBar data={categoryDrilldownData} />
          {categoryDrilldownData.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">
              {categoryDrilldownData.map((c) => {
                const acc = c.total === 0 ? 0 : Math.round((c.correct / c.total) * 1000) / 10
                return (
                  <li key={c.name} className="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-1">
                    <span>{c.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      정답 {c.correct} / 오답 {c.wrong} ({acc}%)
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* 과목별 수치 리스트 */}
      <div>
        <h3 className="text-sm font-semibold mb-2">과목별 수치</h3>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          {data.subjectStatsChart.map((s) => {
            const acc = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 1000) / 10
            return (
              <li
                key={s.name}
                className={`flex justify-between border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 py-1 rounded ${
                  selectedSubject === s.name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onSelectSubject(s.name === selectedSubject ? null : s.name)}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {s.total}문항 · 정답 {s.correct} · 오답 {s.wrong} · {acc}%
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ─── 일자별 탭 ───
function TabDaily({
  data,
  calendarMonth,
  setCalendarMonth,
  calendarDays,
  selectedDate,
  setSelectedDate
}: {
  data: StatsResponse
  calendarMonth: Date
  setCalendarMonth: (d: Date) => void
  calendarDays: Array<{ date: Date; key: string } | null>
  selectedDate: string | null
  setSelectedDate: (d: string | null) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">일자별 정답/오답 수</h3>
        <DailyStackedBar data={data.dailyStatsChart} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 달력 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">달력</h3>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded"
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
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
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                }
              >
                다음
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-400 mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />
              const count = data.dailyCounts[day.key] || 0
              const isSelected = selectedDate === day.key
              return (
                <button
                  type="button"
                  key={day.key}
                  className={`h-14 rounded border text-left px-1.5 py-1 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : count > 0
                        ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedDate(day.key)}
                >
                  <div className="font-semibold">{day.date.getDate()}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {count ? `${count}문항` : ''}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 날짜 문제 목록 */}
        <div>
          <h3 className="text-sm font-semibold mb-2">
            {selectedDate ? `${selectedDate} 문제 목록` : '날짜를 선택하세요'}
          </h3>
          {selectedDate && data.itemsByDate[selectedDate]?.length ? (
            <>
              <DayKpi items={data.itemsByDate[selectedDate]} />
              <ul className="mt-2 space-y-2 text-xs text-gray-600 dark:text-gray-300 max-h-80 overflow-y-auto">
                {data.itemsByDate[selectedDate].map((item) => {
                  const q = getQuestion(item)
                  return (
                    <li key={`${item.QuestionID}-${item.LastAttemptedAt}`} className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-1">
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {q.Subject || '-'} {q.QuestionNum || ''}번
                        </div>
                        <div className="truncate text-gray-400 dark:text-gray-500">
                          {q.QuestionText || ''}
                        </div>
                      </div>
                      <span className={item.IsCorrect ? 'text-green-600 dark:text-green-300 shrink-0' : 'text-red-600 dark:text-red-300 shrink-0'}>
                        {item.IsCorrect ? '정답' : '오답'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : selectedDate ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">해당 날짜에 풀이 기록이 없습니다.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function DayKpi({ items }: { items: HistoryItem[] }) {
  const total = items.length
  const correct = items.filter((i) => i.IsCorrect).length
  const wrong = total - correct
  const acc = total === 0 ? 0 : Math.round((correct / total) * 1000) / 10
  return (
    <div className="flex gap-3 text-xs mb-2">
      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">총 {total}</span>
      <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">정답 {correct}</span>
      <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">오답 {wrong}</span>
      <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{acc}%</span>
    </div>
  )
}

// ─── 정오답 분석 탭 ───
function TabAccuracy({
  data,
  subjectAccuracyData
}: {
  data: StatsResponse
  subjectAccuracyData: Array<{ name: string; accuracy: number; total: number; correct: number }>
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold mb-2">전체 정/오답 비율</h3>
          <AccuracyDonut correct={data.totals.correct} incorrect={data.totals.incorrect} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">과목별 정답률</h3>
          <SubjectAccuracyHBar data={subjectAccuracyData} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">최근 틀린 문제 (최대 20개)</h3>
        {data.recentWrong.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">틀린 문제가 없습니다.</p>
        ) : (
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            {data.recentWrong.map((item) => {
              const q = getQuestion(item)
              return (
                <li key={`${item.QuestionID}-${item.LastAttemptedAt}`} className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-1">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {q.Subject || '-'} {q.QuestionNum || ''}번
                    </div>
                    <div className="truncate text-gray-400 dark:text-gray-500">
                      {q.QuestionText || ''}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(item.LastAttemptedAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <span className="text-red-600 dark:text-red-300 shrink-0">오답</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
