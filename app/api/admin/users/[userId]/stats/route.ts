import { NextResponse } from 'next/server'
import { getAdminContext } from '../../../../../../lib/adminServer'

const toDateKey = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  const { user, isAdmin, adminClient, error } = await getAdminContext()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin || !adminClient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params

  if (!start || !end) {
    return NextResponse.json({ error: 'Missing date range' }, { status: 400 })
  }

  const startDate = new Date(`${start}T00:00:00.000Z`)
  const endDate = new Date(`${end}T23:59:59.999Z`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  const { data: history, error: historyError } = await adminClient
    .from('UserProblemHistory')
    .select(
      'QuestionID, IsCorrect, LastAttemptedAt, Questions (QuestionNum, QuestionText, Subject, Category)'
    )
    .eq('UserID', userId)
    .gte('LastAttemptedAt', startDate.toISOString())
    .lte('LastAttemptedAt', endDate.toISOString())
    .order('LastAttemptedAt', { ascending: false })

  if (historyError) {
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }

  const items = (history || []) as HistoryItem[]

  // --- aggregation ---
  const itemsByDate: Record<string, HistoryItem[]> = {}
  const dailyCounts: Record<string, number> = {}
  const subjectCounts: Record<string, CountPair> = {}
  const categoryCounts: Record<string, CountPair> = {}
  // 과목 > 영역 중첩 집계
  const subjectCategoryMap: Record<string, Record<string, CountPair>> = {}
  // 최근 틀린 문제 (최대 20개)
  const recentWrong: HistoryItem[] = []

  let total = 0
  let correct = 0

  for (const item of items) {
    total += 1
    if (item.IsCorrect) correct += 1

    // 최근 틀린 문제 수집
    if (!item.IsCorrect && recentWrong.length < 20) {
      recentWrong.push(item)
    }

    const dateKey = toDateKey(item.LastAttemptedAt)
    if (dateKey) {
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
      if (!itemsByDate[dateKey]) itemsByDate[dateKey] = []
      itemsByDate[dateKey].push(item)
    }

    const question = Array.isArray(item.Questions) ? item.Questions[0] : item.Questions
    const subject = question?.Subject || '기타'
    const category = question?.Category || '기타'

    // 과목별
    if (!subjectCounts[subject]) {
      subjectCounts[subject] = { total: 0, correct: 0 }
    }
    subjectCounts[subject].total += 1
    if (item.IsCorrect) subjectCounts[subject].correct += 1

    // 영역별
    if (!categoryCounts[category]) {
      categoryCounts[category] = { total: 0, correct: 0 }
    }
    categoryCounts[category].total += 1
    if (item.IsCorrect) categoryCounts[category].correct += 1

    // 과목 > 영역 중첩
    if (!subjectCategoryMap[subject]) {
      subjectCategoryMap[subject] = {}
    }
    if (!subjectCategoryMap[subject][category]) {
      subjectCategoryMap[subject][category] = { total: 0, correct: 0 }
    }
    subjectCategoryMap[subject][category].total += 1
    if (item.IsCorrect) subjectCategoryMap[subject][category].correct += 1
  }

  // recharts 호환 포맷
  const subjectStatsChart = Object.entries(subjectCounts).map(([name, v]) => ({
    name,
    total: v.total,
    correct: v.correct,
    wrong: v.total - v.correct
  }))

  const categoryStatsChart = Object.entries(categoryCounts)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([name, v]) => ({
      name,
      total: v.total,
      correct: v.correct,
      wrong: v.total - v.correct
    }))

  const dailyStatsChart = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, count]) => {
      const dayItems = itemsByDate[day] || []
      const dayCorrect = dayItems.filter((i) => i.IsCorrect).length
      return { day, total: count, correct: dayCorrect, wrong: count - dayCorrect }
    })

  return NextResponse.json({
    range: { start, end },
    totals: {
      total,
      correct,
      incorrect: total - correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 1000) / 10
    },
    dailyCounts,
    itemsByDate,
    subjectCounts,
    categoryCounts,
    subjectCategoryMap,
    recentWrong,
    subjectStatsChart,
    categoryStatsChart,
    dailyStatsChart
  })
}
