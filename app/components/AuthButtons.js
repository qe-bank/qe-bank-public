'use client'

import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function AuthButtons() {
  const { supabase, user } = useAuth();

  const handleLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({
      provider: provider,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    return (
      <div className="flex items-center gap-2 md:gap-4">
        <Link 
          href="/my-page"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500"
        >
          <User size={16} className="shrink-0" />
          <span className="truncate max-w-[100px] md:max-w-xs">{user.email}</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:underline flex items-center gap-1 shrink-0"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">로그아웃</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => handleLogin('google')}
        className="px-2 py-1.5 md:px-3 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
      >
        <span className="hidden md:inline">Google 로그인</span>
        <span className="md:hidden">Google</span>
      </button>
      <button 
        onClick={() => handleLogin('kakao')}
        className="px-2 py-1.5 md:px-3 text-sm font-semibold bg-yellow-400 text-black rounded-lg hover:bg-yellow-500"
      >
        <span className="hidden md:inline">Kakao 로그인</span>
        <span className="md:hidden">Kakao</span>
      </button>
    </div>
  );
}