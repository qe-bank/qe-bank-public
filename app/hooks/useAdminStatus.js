'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'

export default function useAdminStatus() {
  const { supabase, user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkAdmin = async () => {
      if (!user) {
        if (isMounted) {
          setIsAdmin(false)
          setRole(null)
          setLoading(false)
        }
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (error) {
        if (isMounted) {
          setIsAdmin(false)
          setRole(null)
        }
          return
        }

        if (isMounted) {
        setIsAdmin(!!data)
        setRole(data?.role || null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAdmin()

    return () => {
      isMounted = false
    }
  }, [supabase, user])

  return { isAdmin, role, isSuperAdmin: role === 'super_admin', loading }
}
