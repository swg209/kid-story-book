'use client'

import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@/types'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始用户状态
    const getUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!
        })
      }
      setLoading(false)
    }

    getUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    return { error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    login,
    signup,
    logout
  }
}