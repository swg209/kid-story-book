'use client'

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'

export default function HomePage() {
  const { user, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          AI 儿童绘本生成器
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          让不会画画的家长/老师，也能用 AI 一键生成<br />
          角色一致 + 故事连贯 + 10 页成套插图
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              我的绘本
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                开始创作
              </Link>
              <Link
                href="/auth/login"
                className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
              >
                登录
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-4">🎨</div>
          <h3 className="text-lg font-semibold mb-2">角色一致</h3>
          <p className="text-gray-600">AI 确保主角在整个绘本中保持一致的外观</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-4">📖</div>
          <h3 className="text-lg font-semibold mb-2">故事连贯</h3>
          <p className="text-gray-600">自动拆分故事为 10 页连贯的分镜</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold mb-2">一键生成</h3>
          <p className="text-gray-600">完整的绘本插图，支持导出 PNG 和 PDF</p>
        </div>
      </div>
    </div>
    </AppLayout>
  )
}