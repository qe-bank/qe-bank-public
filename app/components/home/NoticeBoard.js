'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'
import { Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import NoticeModal from '../NoticeModal'

const createPreview = (text, maxLength = 50) => {
  if (!text) return '';
  const plainText = text.replace(/<[^>]*>/g, ''); 
  if (plainText.length <= maxLength) {
    return plainText;
  }
  return plainText.substring(0, maxLength) + '...';
};

export default function NoticeBoard() {
  const { supabase } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    if (supabase) { 
      const fetchNotices = async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('notice_board')
          .select('id, created_at, title, content')
          .order('created_at', { ascending: false })
          .limit(5); 

        if (error) {
          console.error('공지사항 로드 오류:', error);
          setError('공지사항을 불러오지 못했습니다.');
        } else {
          setNotices(data);
        }
        setLoading(false);
      };
      fetchNotices();
    } else {
       setLoading(true); 
    }
  }, [supabase]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <NoticeModal 
        notice={selectedNotice} 
        onClose={() => setSelectedNotice(null)} 
      />
      
      <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
        <h2 className="text-xl font-bold">공지사항</h2>
        <Link 
          href="/notices"
          className="text-xs text-blue-500 hover:underline flex items-center"
        >
          더보기 <ChevronRight size={14} />
        </Link>
      </div>
      
      <div className="grow overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="space-y-4">
            {notices.map((notice) => (
              <li key={notice.id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0">
                <button 
                  onClick={() => setSelectedNotice(notice)} 
                  className="text-left w-full group"
                >
                  <h3 className="font-semibold text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug line-clamp-2">
                    {createPreview(notice.content, 60)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}