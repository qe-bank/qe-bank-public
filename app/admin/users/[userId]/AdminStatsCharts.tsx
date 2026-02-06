'use client'

import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E36414', '#9A348E']

// ─── 과목별 정답/오답 수 스택 바 차트 ───
type SubjectBarItem = { name: string; correct: number; wrong: number; total: number }

export function SubjectCorrectWrongBar({
  data,
  onClickSubject
}: {
  data: SubjectBarItem[]
  onClickSubject?: (subject: string) => void
}) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor' }} />
        <YAxis tick={{ fill: 'currentColor' }} />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="correct"
          name="정답"
          stackId="a"
          fill="#22c55e"
          cursor={onClickSubject ? 'pointer' : undefined}
          onClick={(_: unknown, index: number) => onClickSubject?.(data[index].name)}
        />
        <Bar
          dataKey="wrong"
          name="오답"
          stackId="a"
          fill="#ef4444"
          cursor={onClickSubject ? 'pointer' : undefined}
          onClick={(_: unknown, index: number) => onClickSubject?.(data[index].name)}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── 과목 내 영역별 드릴다운 바 차트 ───
type CategoryBarItem = { name: string; correct: number; wrong: number; total: number }

export function CategoryDrilldownBar({ data }: { data: CategoryBarItem[] }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-6">영역 데이터가 없습니다.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
        <XAxis type="number" tick={{ fill: 'currentColor' }} />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 11, fill: 'currentColor' }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="correct" name="정답" stackId="a" fill="#22c55e" />
        <Bar dataKey="wrong" name="오답" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── 일자별 풀이/정답/오답 스택 바 차트 ───
type DailyBarItem = { day: string; correct: number; wrong: number; total: number }

export function DailyStackedBar({ data }: { data: DailyBarItem[] }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>
  }
  const formatted = data.map((item) => ({
    ...item,
    label: new Date(item.day).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
  }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} />
        <YAxis tick={{ fill: 'currentColor' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="correct" name="정답" stackId="a" fill="#22c55e" />
        <Bar dataKey="wrong" name="오답" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── 전체 정/오답 도넛 차트 ───
export function AccuracyDonut({
  correct,
  incorrect
}: {
  correct: number
  incorrect: number
}) {
  const data = [
    { name: '정답', value: correct },
    { name: '오답', value: incorrect }
  ]
  const colors = ['#22c55e', '#ef4444']

  if (correct + incorrect === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          label={(entry) => `${entry.name} ${entry.value}`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── 과목별 정답률 수평 막대 ───
type AccuracyBarItem = { name: string; accuracy: number; total: number; correct: number }

export function SubjectAccuracyHBar({ data }: { data: AccuracyBarItem[] }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: 'currentColor' }} />
        <YAxis
          type="category"
          dataKey="name"
          width={60}
          tick={{ fontSize: 12, fill: 'currentColor' }}
        />
        <Tooltip
          formatter={(value: number, _name: string, props: unknown) => {
            const payload = (props as { payload?: AccuracyBarItem })?.payload
            if (!payload) return [`${value.toFixed(1)}%`, '정답률']
            return [`${value.toFixed(1)}% (${payload.correct}/${payload.total})`, '정답률']
          }}
        />
        <Bar dataKey="accuracy" name="정답률" fill="#3b82f6">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
