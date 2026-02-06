import { NextResponse } from 'next/server'
import { getAdminContext } from '../../../../lib/adminServer'

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

  const { data: usersData } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1
  })

  const { count: noticesCount } = await adminClient
    .from('notice_board')
    .select('id', { count: 'exact', head: true })

  const { count: historyCount } = await adminClient
    .from('UserProblemHistory')
    .select('QuestionID', { count: 'exact', head: true })

  return NextResponse.json({
    usersTotal: usersData?.total || 0,
    noticesTotal: noticesCount || 0,
    historyTotal: historyCount || 0
  })
}
