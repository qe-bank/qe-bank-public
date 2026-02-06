import { NextResponse } from 'next/server'
import { getAdminContext } from '../../../../lib/adminServer'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = parseInt(searchParams.get('perPage') || '20', 10)

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

  const { data, error: listError } = await adminClient.auth.admin.listUsers({
    page,
    perPage
  })

  if (listError) {
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }

  const userIds = (data.users || []).map((item) => item.id)
  let profilesById = {}

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await adminClient
      .from('user_profiles')
      .select('user_id, is_deleted, deleted_at')
      .in('user_id', userIds)

    if (!profilesError) {
      profilesById = (profiles || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile
        return acc
      }, {})
    }
  }

  const mergedUsers = (data.users || []).map((item) => ({
    ...item,
    profile: profilesById[item.id] || null
  }))

  return NextResponse.json({
    users: mergedUsers,
    total: data.total
  })
}
