'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabaseClient'

export default function NewProjectPage() {
  const [title, setTitle] = useState('')
  const [characterDescription, setCharacterDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !characterDescription.trim()) {
      setError('请填写项目标题和角色描述')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 获取当前用户session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError('请先登录')
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          characterDescription: characterDescription.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/projects/${data.projectId}/character`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '创建项目失败')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-fairytale-text mb-2 font-display">✨ 创建新绘本</h1>
          <p className="text-gray-600 font-medium">填写基本信息，开始创作您的儿童绘本</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-2 border-fairytale-primary/20">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-bold text-fairytale-text mb-2 font-display">
                项目标题 <span className="text-fairytale-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：小红帽的冒险"
                className="w-full px-4 py-3 border-2 border-fairytale-secondary/50 rounded-xl focus:outline-none focus:ring-fairytale-primary focus:border-fairytale-primary transition-colors bg-white/50 text-lg"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-fairytale-text mb-2 font-display">
                角色描述 <span className="text-fairytale-primary">*</span>
              </label>
              <textarea
                required
                value={characterDescription}
                onChange={(e) => setCharacterDescription(e.target.value)}
                rows={6}
                placeholder="描述您绘本的主角，例如：一个7岁的小女孩，穿着红色斗篷，有着褐色的长发和大大的眼睛，性格活泼可爱..."
                className="w-full px-4 py-3 border-2 border-fairytale-secondary/50 rounded-xl focus:outline-none focus:ring-fairytale-primary focus:border-fairytale-primary transition-colors bg-white/50 text-base leading-relaxed"
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                <span className="text-fairytale-primary">💡</span> 详细的描述能帮助 AI 生成更符合您期望的角色形象
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-medium text-center">
                {error}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all font-bold"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-fairytale-primary text-white px-6 py-3 rounded-full hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all font-bold shadow-md"
              >
                {loading ? '✨ 创建中...' : '开始创作 ✨'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}