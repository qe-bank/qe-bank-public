'use client'

import Link from 'next/link'

export default function AdminQuestionsPage() {
  const questionAdminUrl = process.env.NEXT_PUBLIC_QUESTION_ADMIN_URL || ''

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">문항 관리</h1>
        <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          관리자 홈
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          문항 관리는 별도 페이지에서 진행됩니다.
        </p>
        {questionAdminUrl ? (
          <a
            href={questionAdminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            문항 관리 페이지 열기
          </a>
        ) : (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            `NEXT_PUBLIC_QUESTION_ADMIN_URL` 환경변수를 설정해 주세요.
          </p>
        )}
      </div>
    </div>
  )
}
