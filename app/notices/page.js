'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { Loader2, AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import NoticeModal from '../components/NoticeModal'

const NOTICES_PER_PAGE = 10;

export default function AllNoticesPage() {
  const { supabase } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    if (supabase) {
      const fetchNotices = async () => {
        setLoading(true);
        setError(null);

        const from = (currentPage - 1) * NOTICES_PER_PAGE;
        const to = from + NOTICES_PER_PAGE - 1;

        const { count, error: countError } = await supabase
          .from('notice_board')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('공지사항 개수 로드 오류:', countError);
          setError('공지사항 개수를 불러오지 못했습니다.');
          setLoading(false);
          return;
        }
        
        setTotalPages(Math.ceil(count / NOTICES_PER_PAGE));

        const { data, error: dataError } = await supabase
          .from('notice_board')
          .select('*') 
          .order('created_at', { ascending: false })
          .range(from, to);

        if (dataError) {
          console.error('전체 공지사항 로드 오류:', dataError);
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
  }, [supabase, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Link href="/" className="flex items-center gap-1 text-sm text-gray-500 hover:underline mb-4">
        <ArrowLeft size={16} /> 홈으로 돌아가기
      </Link>
      <h1 className="text-3xl font-bold mb-6 border-b pb-3 dark:border-gray-700">
        전체 공지사항
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : error ? (
        <p className="text-center text-red-500 flex items-center justify-center gap-2 py-10">
          <AlertTriangle size={16} /> {error}
        </p>
      ) : notices.length === 0 ? (
        <p className="text-center text-gray-500 py-20">등록된 공지사항이 없습니다.</p>
      ) : (
        <>
          <div className="space-y-3">
            {notices.map((notice) => (
              <button
                key={notice.id}
                onClick={() => setSelectedNotice(notice)}
                className="w-full text-left bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {notice.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                    {new Date(notice.created_at).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow border disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={16} /> 이전
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow border disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                다음 <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* 공지사항 모달 */}
      <NoticeModal 
        notice={selectedNotice} 
        onClose={() => setSelectedNotice(null)} 
      />
    </div>
  );
}