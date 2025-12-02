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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                儿童绘本生成
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className="ml-8 text-gray-700 hover:text-blue-600"
                >
                  我的绘本
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    登录
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}