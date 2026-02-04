// app/my-page/history/page.js
'use client'

import { useState, useEffect } from 'react'
import { Loader2, History, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../AuthContext'

export default function HistoryPage() {
  const { supabase, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('UserProblemHistory')
          .select(`
            QuestionID,
            IsCorrect,
            LastAttemptedAt,
            Questions (*) 
          `)
          .eq('UserID', user.id)
          .order('LastAttemptedAt', { ascending: false })
          .limit(50);

        if (error) {
          console.error('풀이 기록 로드 오류:', error);
          console.error('오류 상세:', JSON.stringify(error, null, 2));
        } else {
          setHistory(data || []);
        }
        setLoading(false);
      };
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🕓 최근 풀이 기록</h2>
      {history.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <History size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">아직 문제를 푼 기록이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((item) => {
            const q = item.Questions; // JOIN된 문제 객체
            if (!q) return null; // 혹시 모를 오류 방지

            return (
              <li key={`${q.QuestionID}-${item.LastAttemptedAt}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${item.IsCorrect ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'}`}>
                    {item.IsCorrect ? <Check size={20} /> : <X size={20} />}
                  </span>
                  <div>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-medium">
                      {q.Subject}
                    </span>
                    <p className="mt-1 font-medium line-clamp-1">{q.QuestionNum}. {q.QuestionText.replace(/\[.*?\]/g, '')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.LastAttemptedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                {/* 3. 다시 풀기 기능 */}
                <Link 
                  href={`/?retry_id=${q.QuestionID}`}
                  className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 shrink-0"
                >
                  다시 풀기
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
}