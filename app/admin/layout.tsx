'use client'

import Link from 'next/link'
import { Loader2, ShieldAlert } from 'lucide-react'
import useAdminStatus from '../hooks/useAdminStatus'
import { useAuth } from '../AuthContext'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const { isAdmin, loading } = useAdminStatus()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 text-center">
          <ShieldAlert className="mx-auto text-red-500" size={36} />
          <h1 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            관리자 권한이 필요합니다
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            관리자 계정으로 로그인 후 다시 시도해 주세요.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      {children}
    </div>
  )
}
