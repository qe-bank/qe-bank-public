'use client'

import { useAuth } from '../../AuthContext'
import Link from 'next/link'
import { User, LogIn, PieChart, Bookmark } from 'lucide-react'

export default function LoginWelcome() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
            <User size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              안녕하세요!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
              {user.email}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/my-page"
            className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
          >
            <PieChart size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">통계</span>
          </Link>
          <Link
            href="/my-page/bookmarks"
            className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition"
          >
            <Bookmark size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">북마크</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <LogIn size={24} className="text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            로그인이 필요합니다
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            학습 기록과 북마크를 저장하려면 로그인하세요
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          • 풀이 기록 자동 저장
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          • 북마크 기능 사용
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          • 학습 통계 확인
        </p>
      </div>
    </div>
  );
}