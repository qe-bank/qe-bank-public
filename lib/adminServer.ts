import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function getAdminContext() {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return { user: null, isAdmin: false, role: null, adminClient: null, error: 'Missing Supabase env' }
  }

  const cookieStore = await cookies()

  const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      }
    }
  })

  const { data: { user } } = await authClient.auth.getUser()
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false }
  })

  let isAdmin = false
  let role: string | null = null
  if (user) {
    const { data } = await adminClient
      .from('admins')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    isAdmin = !!data
    role = data?.role || null
  }

  return { user, isAdmin, role, adminClient, error: null }
}

type AdminClientLike = {
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => unknown
  }
}

const isAdminClientLike = (value: unknown): value is AdminClientLike => {
  if (!value || typeof value !== 'object') return false
  return typeof (value as AdminClientLike).from === 'function'
}

export async function logAdminAction({
  adminClient,
  adminId,
  action,
  targetUserId,
  targetNoticeId,
  payload
}: {
  adminClient: unknown
  adminId: string
  action: string
  targetUserId?: string | null
  targetNoticeId?: string | number | null
  payload?: Record<string, unknown> | null
}) {
  if (!isAdminClientLike(adminClient)) return
  try {
    await adminClient.from('admin_actions').insert({
      admin_id: adminId,
      action,
      target_user_id: targetUserId || null,
      target_notice_id: targetNoticeId || null,
      payload: payload || null
    })
  } catch (error) {
    // logging should not block main flow
    console.error('admin_actions insert failed', error)
  }
}
