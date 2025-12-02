'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
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
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setStoryboards(data.storyboards || [])
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
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
      const response = await fetch(`/api/projects/${id}/story/generate-storyboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ story: story.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        // 添加新的分镜，但需要获取完整信息（包括id）
        setStoryboards(data.storyboards.map((sb: any, index: number) => ({
          id: `temp-${index}`, // 临时ID，实际应该从后端返回
          project_id: id as string,
          page_index: sb.pageIndex,
          description: sb.description,
          created_at: new Date().toISOString()
        })))
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
      const response = await fetch(`/api/projects/${id}/storyboards/${storyboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
          <div className="text-gray-600">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <Link 
            href={`/projects/${id}`}
            className="text-blue-600 hover:text-blue-500 text-sm mb-4 inline-block"
          >
            ← 返回项目
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">故事分镜</h1>
          <p className="text-gray-600">输入完整的故事，AI 将自动拆分为 10 页分镜</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">故事内容</h2>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={10}
            placeholder="请输入您要制作成绘本的完整故事内容，例如：从前，有一个叫小红帽的女孩，她要去奶奶家..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGenerateStoryboard}
              disabled={generating || !story.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? '生成中...' : '生成 10 页分镜'}
            </button>
          </div>
        </div>

        {storyboards.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">分镜列表</h2>
            <div className="space-y-6">
              {storyboards.map((storyboard) => (
                <div key={storyboard.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleUpdateStoryboard(storyboard.id, storyboard.description)}
                      disabled={saving[storyboard.id]}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      {saving[storyboard.id] ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/projects/${id}/pages`}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                下一步：生成绘本插图
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}