import { NextResponse } from 'next/server'
import { getAdminContext, logAdminAction } from '../../../../lib/adminServer'

export async function GET() {
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

  const { data, error: listError } = await adminClient
    .from('notice_board')
    .select('id, created_at, title, content')
    .order('created_at', { ascending: false })

  if (listError) {
    return NextResponse.json({ error: 'Failed to load notices' }, { status: 500 })
  }

  return NextResponse.json({ notices: data || [] })
}

export async function POST(request: Request) {
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
  const title = String(body?.title || '').trim()
  const content = String(body?.content || '').trim()

  if (!title || !content) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { data, error: insertError } = await adminClient
    .from('notice_board')
    .insert({ title, content })
    .select('id')
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }

  await logAdminAction({
    adminClient: adminClient as unknown as {
      from: (table: string) => { insert: (values: Record<string, unknown>) => unknown }
    },
    adminId: user.id,
    action: 'notice_create',
    targetNoticeId: data?.id || null,
    payload: { title }
  })

  return NextResponse.json({ ok: true, id: data?.id })
}
