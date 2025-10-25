// app/my-page/StatsChart.js
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

// 파이 차트용 색상 배열
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E36414', '#9A348E'];

/**
 * 4. 과목별 정답률 (파이 차트)
 */
export function SubjectPieChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>;
  }
  
  // recharts가 요구하는 데이터 형식으로 가공
  const chartData = data.map(item => ({
    name: item.Subject,
    value: item.total, // 총 푼 문제 수
    correct: item.correct
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie 
          data={chartData} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          outerRadius={80} 
          fill="#8884d8" 
          label={(entry) => entry.name}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => [
            `${props.payload.correct} / ${value} (정답률: ${((props.payload.correct / value) * 100).toFixed(0)}%)`, 
            name
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * 4. 분류별 정답률 (수평 막대 차트)
 */
export function CategoryBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>;
  }

  const chartData = data.map(item => ({
    name: item.Category || '기타',
    total: item.total,
    correct: item.correct,
    정답률: (item.correct / item.total) * 100 // '정답률' 키로 정렬
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
        <XAxis type="number" domain={[0, 100]} unit="%" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={80} 
          tick={{ fontSize: 12, fill: 'currentColor' }} 
        />
        <Tooltip 
          formatter={(value, name, props) => [
            `${value.toFixed(1)}% (${props.payload.correct}/${props.payload.total})`,
            "정답률"
          ]}
        />
        <Bar dataKey="정답률" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * 4. 일자별 풀이 현황 (수직 막대 차트)
 */
export function DailyBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-10">데이터가 없습니다.</p>;
  }

  const chartData = data.map(item => ({
    // 날짜 포맷팅 (예: 10/25)
    name: new Date(item.day).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
    "총 푼 문제": item.total,
    "맞춘 문제": item.correct
  })).reverse(); // 시간 순 (오래된 -> 최신)으로 변경

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor' }} />
        <YAxis tick={{ fill: 'currentColor' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="총 푼 문제" fill="#8884d8" />
        <Bar dataKey="맞춘 문제" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}