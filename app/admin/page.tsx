'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, ClipboardList, Megaphone, Activity } from 'lucide-react'

const adminCards = [
  {
    title: '회원 관리',
    description: '회원 목록, 통계, 기록 확인 및 삭제',
    href: '/admin/users',
    icon: Users
  },
  {
    title: '공지사항 관리',
    description: '공지사항 등록, 수정, 삭제',
    href: '/admin/notices',
    icon: Megaphone
  },
  {
    title: '문항 관리',
    description: '별도 페이지에서 관리',
    href: '/admin/questions',
    icon: ClipboardList
  },
  {
    title: '활동 로그',
    description: '관리자 작업 이력 조회',
    href: '/admin/logs',
    icon: Activity
  }
]

export default function AdminHomePage() {
  const [metrics, setMetrics] = useState<{
    usersTotal: number
    noticesTotal: number
    historyTotal: number
  } | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch('/api/admin/metrics', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setMetrics(data)
    }
    fetchMetrics()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">관리자 메뉴</h1>
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          홈으로
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">총 회원 수</p>
          <p className="text-2xl font-bold">{metrics?.usersTotal ?? '-'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">공지사항 수</p>
          <p className="text-2xl font-bold">{metrics?.noticesTotal ?? '-'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">누적 풀이 수</p>
          <p className="text-2xl font-bold">{metrics?.historyTotal ?? '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminCards.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={title}
            href={href}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Icon className="text-blue-600 dark:text-blue-300" size={20} />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
