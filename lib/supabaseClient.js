// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 토큰 저장소 최적화
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // 자동 새로고침 비활성화 (필요시에만 수동으로 처리)
    autoRefreshToken: true,
    // 세션 지속성 설정
    persistSession: true,
    // 불필요한 데이터 저장 최소화
    detectSessionInUrl: false,
    // 토큰 만료 시간 설정 (기본값 사용)
    flowType: 'pkce'
  },
  // 실시간 연결 최적화
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})