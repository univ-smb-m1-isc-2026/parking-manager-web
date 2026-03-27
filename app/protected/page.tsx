'use client' // <--- TRÈS IMPORTANT

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/client' 

export default function ProtectedPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [router])

  if (!user) return <p>Chargement...</p>

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>Hello <span>{user.email}</span></p>
      <LogoutButton />
    </div>
  )
}