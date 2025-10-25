// app/components/BookmarkButton.js
'use client'

import { useState } from 'react'
import { Bookmark, Loader2 } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function BookmarkButton({ 
  questionId, 
  userId, 
  initialIsBookmarked, 
  onToggle 
}) {
  const { supabase } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation(); // 퀴즈 답안 선택 방지
    if (!userId) {
      alert('로그인이 필요한 기능입니다.'); // 6. 에러 처리
      return;
    }

    setLoading(true);
    const newState = !isBookmarked;

    try {
      if (newState) {
        // 북마크 추가
        const { error } = await supabase
          .from('UserBookmarks')
          .insert({ UserID: userId, QuestionID: questionId });
        if (error) throw error;
      } else {
        // 북마크 삭제
        const { error } = await supabase
          .from('UserBookmarks')
          .delete()
          .eq('UserID', userId)
          .eq('QuestionID', questionId);
        if (error) throw error;
      }
      
      setIsBookmarked(newState);
      onToggle(questionId, newState); // 부모(QuizEngine) 상태 업데이트

    } catch (error) {
      console.error('북마크 처리 오류:', error);
      console.error('오류 상세:', JSON.stringify(error, null, 2));
      alert('북마크 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      title="북마크"
      className={`p-1.5 rounded-full transition-colors ${
        isBookmarked 
          ? 'text-blue-500 bg-blue-100 dark:bg-blue-900' 
          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {loading 
        ? <Loader2 size={18} className="animate-spin" />
        : <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
      }
    </button>
  );
}