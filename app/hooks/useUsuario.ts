// hooks/useUsuario.ts
// Hook para acessar o usuário autenticado em Client Components

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUsuario() {
  const [user, setUser] = useState<User | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setCarregando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, carregando }
}
