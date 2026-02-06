import { NextResponse } from 'next/server'
import { getAdminContext } from '../../../../../../lib/adminServer'

const toDateKey = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

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

  const itemsByDate: Record<string, unknown[]> = {}
  const dailyCounts: Record<string, number> = {}
  const subjectCounts: Record<string, { total: number; correct: number }> = {}
  const categoryCounts: Record<string, { total: number; correct: number }> = {}

  let total = 0
  let correct = 0

  for (const item of history || []) {
    total += 1
    if (item.IsCorrect) correct += 1

    const dateKey = toDateKey(item.LastAttemptedAt)
    if (dateKey) {
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1
      if (!itemsByDate[dateKey]) itemsByDate[dateKey] = []
      itemsByDate[dateKey].push(item)
    }

    const question = Array.isArray(item.Questions) ? item.Questions[0] : item.Questions
    const subject = question?.Subject || '기타'
    if (!subjectCounts[subject]) {
      subjectCounts[subject] = { total: 0, correct: 0 }
    }
    subjectCounts[subject].total += 1
    if (item.IsCorrect) subjectCounts[subject].correct += 1

    const category = question?.Category || '기타'
    if (!categoryCounts[category]) {
      categoryCounts[category] = { total: 0, correct: 0 }
    }
    categoryCounts[category].total += 1
    if (item.IsCorrect) categoryCounts[category].correct += 1
  }

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
    categoryCounts
  })
}
