import { NextResponse } from 'next/server'
import { getAdminContext, logAdminAction } from '../../../../../lib/adminServer'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = parseInt(searchParams.get('perPage') || '50', 10)
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

  const { userId } = await params

  const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { count: historyCount } = await adminClient
    .from('UserProblemHistory')
    .select('QuestionID', { count: 'exact', head: true })
    .eq('UserID', userId)

  const { count: bookmarkCount } = await adminClient
    .from('UserBookmarks')
    .select('QuestionID', { count: 'exact', head: true })
    .eq('UserID', userId)

  const { data: lastHistory } = await adminClient
    .from('UserProblemHistory')
    .select('LastAttemptedAt')
    .eq('UserID', userId)
    .order('LastAttemptedAt', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: recentHistory, count: recentHistoryTotal } = await adminClient
    .from('UserProblemHistory')
    .select('QuestionID, IsCorrect, LastAttemptedAt, Questions (QuestionNum, QuestionText, Subject)', {
      count: 'exact'
    })
    .eq('UserID', userId)
    .order('LastAttemptedAt', { ascending: false })
    .range(from, to)

  const { data: profile, error: profileError } = await adminClient
    .from('user_profiles')
    .select('is_deleted, deleted_at')
    .eq('user_id', userId)
    .maybeSingle()

  return NextResponse.json({
    user: userData.user,
    stats: {
      historyCount: historyCount || 0,
      bookmarkCount: bookmarkCount || 0,
      lastAttemptedAt: lastHistory?.LastAttemptedAt || null
    },
    profile: profileError ? null : (profile || null),
    recentHistory: recentHistory || [],
    recentHistoryTotal: recentHistoryTotal || 0
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { user, isAdmin, role, adminClient, error } = await getAdminContext()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdmin || !adminClient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (role !== 'super_admin') {
    return NextResponse.json({ error: 'Super admin only' }, { status: 403 })
  }

  const { userId } = await params
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot delete self' }, { status: 400 })
  }

  await adminClient.from('UserProblemHistory').delete().eq('UserID', userId)
  await adminClient.from('UserBookmarks').delete().eq('UserID', userId)
  await adminClient.from('admins').delete().eq('user_id', userId)
  await adminClient.from('user_profiles').delete().eq('user_id', userId)

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }

  await logAdminAction({
    adminClient: adminClient as unknown as {
      from: (table: string) => { insert: (values: Record<string, unknown>) => unknown }
    },
    adminId: user.id,
    action: 'user_hard_delete',
    targetUserId: userId
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
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

  const body = await request.json()
  const action = body?.action
  const { userId } = await params

  if (action !== 'soft_delete' && action !== 'restore') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const isDeleted = action === 'soft_delete'
  const { error: updateError } = await adminClient
    .from('user_profiles')
    .upsert(
      {
        user_id: userId,
        is_deleted: isDeleted,
        deleted_at: isDeleted ? new Date().toISOString() : null,
        deleted_by: user.id
      },
      { onConflict: 'user_id' }
    )

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }

  await logAdminAction({
    adminClient: adminClient as unknown as {
      from: (table: string) => { insert: (values: Record<string, unknown>) => unknown }
    },
    adminId: user.id,
    action: isDeleted ? 'user_soft_delete' : 'user_restore',
    targetUserId: userId
  })

  return NextResponse.json({ ok: true })
}
