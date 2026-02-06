import { NextResponse } from 'next/server'
import { getAdminContext, logAdminAction } from '../../../../../lib/adminServer'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
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

  const noticeId = params.id
  const { data, error: fetchError } = await adminClient
    .from('notice_board')
    .select('id, title, content, created_at')
    .eq('id', noticeId)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
  }

  return NextResponse.json({ notice: data })
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
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

  const noticeId = params.id
  const body = await request.json()
  const title = String(body?.title || '').trim()
  const content = String(body?.content || '').trim()

  if (!title || !content) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error: updateError } = await adminClient
    .from('notice_board')
    .update({ title, content })
    .eq('id', noticeId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 })
  }

  await logAdminAction({
    adminClient,
    adminId: user.id,
    action: 'notice_update',
    targetNoticeId: noticeId,
    payload: { title }
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
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

  const noticeId = params.id

  const { error: deleteError } = await adminClient
    .from('notice_board')
    .delete()
    .eq('id', noticeId)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }

  await logAdminAction({
    adminClient,
    adminId: user.id,
    action: 'notice_delete',
    targetNoticeId: noticeId
  })

  return NextResponse.json({ ok: true })
}
