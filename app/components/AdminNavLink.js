\'use client\'

import Link from 'next/link'
import useAdminStatus from '../hooks/useAdminStatus'

export default function AdminNavLink() {
  const { isAdmin, loading } = useAdminStatus()

  if (loading || !isAdmin) return null

  return (
    <Link
      href="/admin"
      className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-300"
    >
      관리자
    </Link>
  )
}
