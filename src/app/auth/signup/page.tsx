'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { AppLayout } from '@/components/layout/AppLayout'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signup } = useSupabaseAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signup(email, password)
    if (error) {
      setError(error.message)
    } else {
      setMessage('注册成功！请检查您的邮箱确认注册。')
    }
    setLoading(false)
  }

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-fairytale-secondary/30 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-fairytale-accent/30 rounded-bubble animate-wiggle"></div>

        <div className="max-w-md w-full space-y-8 cartoon-card bg-gradient-to-br from-white/95 to-fairytale-background/80 backdrop-blur-cartoon p-10 rounded-3xl shadow-cartoon-lg border-4 border-fairytale-secondary/30 transform hover:scale-105 transition-all duration-300">
          <div>
            <div className="text-6xl text-center mb-4 animate-wiggle">✨</div>
            <h2 className="text-center text-cartoon-4xl font-cartoon text-fairytale-text emphasized-text rainbow-text">
              🌟 创建新账户 🌟
            </h2>
            <p className="mt-4 text-center text-cartoon-lg text-gray-700 font-playful leading-relaxed">
              开启您的 AI 绘本创作之旅 🎨📚
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="sr-only">邮箱地址</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="cartoon-input w-full px-6 py-4 text-cartoon-lg border-4 border-fairytale-secondary/50 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-fairytale-primary/50 focus:border-fairytale-primary transition-all bg-white/80 font-playful"
                  placeholder="📧 邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">密码</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="cartoon-input w-full px-6 py-4 text-cartoon-lg border-4 border-fairytale-secondary/50 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-fairytale-primary/50 focus:border-fairytale-primary transition-all bg-white/80 font-playful"
                  placeholder="🔒 密码（至少6位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-fairytale-danger text-cartoon-base text-center font-cartoon bg-fairytale-danger/20 py-3 px-4 rounded-2xl border-2 border-fairytale-danger/40 animate-shake">
                ❌ {error}
              </div>
            )}

            {message && (
              <div className="text-fairytale-success text-cartoon-base text-center font-cartoon bg-fairytale-success/20 py-3 px-4 rounded-2xl border-2 border-fairytale-success/40 animate-pulse-cartoon">
                ✅ {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="cartoon-button w-full py-4 px-6 text-cartoon-xl font-cartoon bg-linear-to-r from-fairytale-secondary to-fairytale-accent rounded-full hover:from-fairytale-primary hover:to-fairytale-purple disabled:opacity-50 shadow-cartoon-lg"
              >
                {loading ? '🔄 注册中... 🔄' : '🎉 注册 🎉'}
              </button>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/auth/login"
                className="text-cartoon-lg text-fairytale-primary hover:text-fairytale-secondary font-cartoon emphasized-text transition-all hover:scale-105 inline-block"
              >
                🔑 已有账户？立即登录 🔑
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}