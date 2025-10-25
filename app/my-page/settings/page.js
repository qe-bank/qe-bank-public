'use client'

import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../AuthContext'

export default function SettingsPage() {
  const { supabase, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);


  const handleWithdrawal = async () => {
    if (!user) return;
    
    if (window.confirm(
      '정말로 회원 탈퇴를 하시겠습니까?\n모든 풀이 기록과 북마크가 영구적으로 삭제됩니다.'
    )) {
      setLoading(true);
      const { error } = await supabase.rpc('delete_user_data');
      
      if (error) {
        console.error('회원 탈퇴 오류:', error);
        alert(`탈퇴 처리 중 오류가 발생했습니다: ${error.message}`);
        setLoading(false);
      } else {
        alert('회원 탈퇴가 완료되었습니다.');
        await supabase.auth.signOut();
        router.push('/');
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🛡️ 계정 설정</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold">로그인 정보</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          현재 <b className="text-black dark:text-white">{user.email}</b> (으)로 로그인되어 있습니다.
        </p>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/50 p-6 rounded-lg shadow border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <ShieldAlert size={24} className="text-red-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              위험 구역
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              계정을 삭제하면 모든 풀이 기록, 북마크, 통계 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
          </div>
        </div>
        <button
          onClick={handleWithdrawal}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '처리 중...' : '계정 영구 삭제'}
        </button>
      </div>
    </div>
  );
}