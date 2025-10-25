'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LayoutDashboard, Bookmark, History, Settings } from 'lucide-react'
import { useAuth } from '../AuthContext'

const MyPageTabs = () => {
  const pathname = usePathname();
  const tabs = [
    { name: '통계 대시보드', href: '/my-page', icon: LayoutDashboard },
    { name: '북마크', href: '/my-page/bookmarks', icon: Bookmark },
    { name: '풀이 기록', href: '/my-page/history', icon: History },
    { name: '계정 설정', href: '/my-page/settings', icon: Settings },
  ];

  return (
    <nav className="flex flex-nowrap space-x-1 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm -mb-0.5 whitespace-nowrap
            ${pathname === tab.href
              ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-b-2 border-transparent'
            }
          `}
        >
          <tab.icon size={16} />
          {tab.name}
        </Link>
      ))}
    </nav>
  );
};

export default function MyPageLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">마이페이지</h1>
      <MyPageTabs />
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}