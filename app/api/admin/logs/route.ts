import { NextResponse } from 'next/server'
import { getAdminContext } from '../../../../lib/adminServer'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = parseInt(searchParams.get('perPage') || '20', 10)
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const { user, isAdmin, adminClient, error } = await getAdminContext()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin || !adminClient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error: listError, count } = await adminClient
    .from('admin_actions')
    .select('id, admin_id, action, target_user_id, target_notice_id, payload, created_at', {
      count: 'exact'
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (listError) {
    return NextResponse.json({ error: 'Failed to load logs' }, { status: 500 })
  }

  return NextResponse.json({
    logs: data || [],
    total: count || 0
  })
}
