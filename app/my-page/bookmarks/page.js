'use client'

import { useState, useEffect } from 'react'
import { Loader2, BookmarkX } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../AuthContext'

export default function BookmarksPage() {
  const { supabase, user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBookmarks = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('UserBookmarks')
          .select('QuestionID, Questions (*)')
          .eq('UserID', user.id);

        if (error) {
          console.error('북마크 로드 오류:', error);
          console.error('오류 상세:', JSON.stringify(error, null, 2));
        } else {
          setBookmarks(data || []);
        }
        setLoading(false);
      };
      fetchBookmarks();
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
  
  if (!user) {
    return <p>북마크를 보려면 로그인이 필요합니다.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">🔖 북마크한 문제</h2>
      {bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BookmarkX size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">북마크한 문제가 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {bookmarks.map(({ Questions: q }) => (
            <li key={q.QuestionID} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                  {q.Subject}
                </span>
                <p className="mt-1 font-medium line-clamp-1">{q.QuestionNum}. {q.QuestionText.replace(/\[.*?\]/g, '')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{q.ExamYear}년 {q.ExamRound}회</p>
              </div>
              <Link 
                href={`/?retry_id=${q.QuestionID}`}
                className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                다시 풀기
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}