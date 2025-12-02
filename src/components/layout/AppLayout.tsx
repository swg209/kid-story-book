'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useSupabaseAuth()

  return (
    <div className="min-h-screen">
      <nav className="fixed top-4 left-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-2 border-fairytale-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-fairytale-primary hover:text-fairytale-secondary transition-colors font-display tracking-wide">
                ✨ 儿童绘本生成
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="ml-8 text-fairytale-text hover:text-fairytale-primary font-medium transition-colors"
                >
                  我的绘本
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 font-medium">{user.email}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-fairytale-text hover:text-fairytale-primary font-medium transition-colors"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm text-fairytale-text hover:text-fairytale-primary font-bold transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-fairytale-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-fairytale-secondary hover:scale-105 transition-all shadow-md"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}