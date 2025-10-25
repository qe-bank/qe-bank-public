// app/components/NoticeModal.js
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { X } from 'lucide-react'

export default function NoticeModal({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 방지
      >
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{notice.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* 모달 본문 (스크롤) */}
        <div className="overflow-y-auto pr-3 grow">
          <div className="notice-content prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // 제목 스타일링
                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-5">{children}</h3>,
                h4: ({children}) => <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">{children}</h4>,
                
                // 문단 스타일링
                p: ({children}) => <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{children}</p>,
                
                // 목록 스타일링
                ul: ({children}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">{children}</ol>,
                li: ({children}) => <li className="leading-relaxed">{children}</li>,
                
                // 강조 스타일링
                strong: ({children}) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-800 dark:text-gray-200">{children}</em>,
                
                // 링크 스타일링
                a: ({href, children}) => (
                  <a 
                    href={href} 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                
                // 코드 스타일링
                code: ({children, className}) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">{children}</code>;
                  }
                  return <code className={className}>{children}</code>;
                },
                pre: ({children}) => (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-200 dark:border-gray-700">
                    {children}
                  </pre>
                ),
                
                // 인용문 스타일링
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">
                    {children}
                  </blockquote>
                ),
                
                // 테이블 스타일링
                table: ({children}) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                      {children}
                    </table>
                  </div>
                ),
                th: ({children}) => (
                  <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                    {children}
                  </th>
                ),
                td: ({children}) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
                    {children}
                  </td>
                ),
                
                // 구분선 스타일링
                hr: () => <hr className="my-6 border-gray-300 dark:border-gray-600" />,
              }}
            >
              {notice.content}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* 닫기 버튼 (하단) */}
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}