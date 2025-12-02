'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'

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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新绘本</h1>
          <p className="text-gray-600">填写基本信息，开始创作您的儿童绘本</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目标题 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：小红帽的冒险"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              角色描述 *
            </label>
            <textarea
              required
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
              rows={6}
              placeholder="描述您绘本的主角，例如：一个7岁的小女孩，穿着红色斗篷，有着褐色的长发和大大的眼睛，性格活泼可爱..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              详细的描述能帮助 AI 生成更符合您期望的角色形象
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '创建中...' : '创建绘本'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}