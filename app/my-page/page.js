'use client'

import { useState, useEffect } from 'react'
import { Loader2, BarChart2, PieChart, Calendar } from 'lucide-react'
import { SubjectPieChart, CategoryBarChart, DailyBarChart } from './StatsChart'
import { useAuth } from '../AuthContext'

export default function StatisticsDashboard() {
  const { supabase, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_user_stats');
        
        if (error) {
          console.error('통계 로드 오류:', error);
          console.error('오류 상세:', JSON.stringify(error, null, 2));
        } else {
          setStats(data || null);
        }
        setLoading(false);
      };
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="ml-3 text-lg">통계 데이터를 불러오는 중...</span>
      </div>
    );
  }
  
  if (!user) {
    return <p>통계를 보려면 로그인이 필요합니다.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 통계 대시보드</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <PieChart size={20} />
            과목별 정답률
          </h3>
          <SubjectPieChart data={stats?.subject_stats} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <BarChart2 size={20} />
            분류별 정답률 (Top 10)
          </h3>
          <CategoryBarChart data={stats?.category_stats} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Calendar size={20} />
          일자별 풀이 현황 (최근 30일)
        </h3>
        <DailyBarChart data={stats?.daily_stats} />
      </div>
    </div>
  );
}