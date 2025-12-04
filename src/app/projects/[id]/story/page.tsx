'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabaseClient'
import { Storyboard } from '@/types'

interface StoryboardWithId extends Storyboard {
  id: string
}

export default function StoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [story, setStory] = useState('')
  const [storyboards, setStoryboards] = useState<StoryboardWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id])

  const fetchProjectData = async () => {
    try {
      // 获取当前用户session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStoryboards(data.storyboards || [])
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStoryboard = async () => {
    if (!story.trim()) {
      alert('请输入故事内容')
      return
    }

    setGenerating(true)
    try {
      // 获取当前用户session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/projects/${id}/story/generate-storyboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ story: story.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        // 使用后端返回的真实数据
        setStoryboards(data.storyboards)
      }
    } catch (error) {
      console.error('Error generating storyboard:', error)
      alert('生成分镜失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleUpdateStoryboard = async (storyboardId: string, description: string) => {
    setSaving(prev => ({ ...prev, [storyboardId]: true }))
    try {
      // 获取当前用户session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/projects/${id}/storyboards/${storyboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ description })
      })

      if (response.ok) {
        // 更新本地状态
        setStoryboards(prev =>
          prev.map(sb =>
            sb.id === storyboardId ? { ...sb, description } : sb
          )
        )
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error updating storyboard:', error)
      alert('保存失败')
    } finally {
      setSaving(prev => ({ ...prev, [storyboardId]: false }))
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-fairytale-primary text-xl font-bold animate-bounce">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link
            href={`/projects/${id}`}
            className="text-fairytale-primary hover:text-fairytale-secondary text-sm mb-4 inline-flex items-center gap-1 font-bold transition-colors"
          >
            ← 返回项目
          </Link>
          <h1 className="text-3xl font-bold text-fairytale-text mb-2 font-display">📝 故事分镜</h1>
          <p className="text-gray-600 font-medium">输入完整的故事，AI 将自动拆分为 10 页分镜</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8 mb-8">
          <h2 className="text-xl font-bold text-fairytale-text mb-4 font-display">故事内容</h2>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={10}
            placeholder="请输入您要制作成绘本的完整故事内容，例如：从前，有一个叫小红帽的女孩，她要去奶奶家..."
            className="w-full px-4 py-3 border-2 border-fairytale-secondary/50 rounded-xl focus:outline-none focus:ring-fairytale-primary focus:border-fairytale-primary transition-colors bg-white/50 text-base leading-relaxed"
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerateStoryboard}
              disabled={generating || !story.trim()}
              className="bg-fairytale-primary text-white px-8 py-3 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all shadow-md"
            >
              {generating ? '✨ 生成中...' : '✨ 生成 10 页分镜'}
            </button>
          </div>
        </div>

        {storyboards.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8">
            <h2 className="text-xl font-bold text-fairytale-text mb-6 font-display">分镜列表</h2>
            <div className="space-y-6">
              {storyboards.map((storyboard) => (
                <div key={storyboard.id} className="flex items-start space-x-4 bg-white/50 p-4 rounded-2xl border-2 border-transparent hover:border-fairytale-secondary/30 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 bg-fairytale-secondary text-green-800 rounded-full flex items-center justify-center font-bold shadow-sm text-lg">
                    {storyboard.page_index + 1}
                  </div>
                  <div className="flex-grow">
                    <textarea
                      value={storyboard.description}
                      onChange={(e) => {
                        const newDescription = e.target.value
                        setStoryboards(prev =>
                          prev.map(sb =>
                            sb.id === storyboard.id ? { ...sb, description: newDescription } : sb
                          )
                        )
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-fairytale-primary focus:border-fairytale-primary bg-white transition-colors"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleUpdateStoryboard(storyboard.id, storyboard.description)}
                      disabled={saving[storyboard.id]}
                      className="bg-fairytale-accent text-white px-4 py-2 rounded-full font-bold hover:bg-fairytale-secondary disabled:opacity-50 transition-all shadow-sm text-sm"
                    >
                      {saving[storyboard.id] ? '💾 保存中...' : '💾 保存'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={`/projects/${id}/pages`}
                className="bg-fairytale-secondary text-green-800 px-10 py-4 rounded-full font-bold hover:bg-fairytale-accent hover:scale-105 transition-all shadow-lg text-lg inline-flex items-center gap-2"
              >
                <span>🖼️</span> 下一步：生成绘本插图
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}