'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { Project, Character, Storyboard, Page } from '@/types'

interface ProjectDetails {
  project: Project
  character?: Character
  storyboards: Storyboard[]
  pages: Page[]
}

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProjectDetails()
    }
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const data: ProjectDetails = await response.json()
        setProjectDetails(data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching project details:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
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

  if (!projectDetails) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">项目未找到</div>
        </div>
      </AppLayout>
    )
  }

  const { project, character, storyboards, pages } = projectDetails

  const getStepStatus = (step: string) => {
    if (step === 'character' && character?.images?.length) return 'completed'
    if (step === 'story' && storyboards.length > 0) return 'completed'
    if (step === 'pages' && pages.filter(p => p.status === 'done').length > 0) return 'completed'
    return 'pending'
  }

  const steps = [
    { key: 'character', name: '角色生成', href: `/projects/${id}/character`, icon: '🎨' },
    { key: 'story', name: '故事分镜', href: `/projects/${id}/story`, icon: '📝' },
    { key: 'pages', name: '绘本插图', href: `/projects/${id}/pages`, icon: '🖼️' },
    { key: 'export', name: '导出', href: `/projects/${id}/export`, icon: '📤' }
  ]

  return (
    <AppLayout>
      <div className="py-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-fairytale-text mb-4 font-display">{project.title}</h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span className="bg-white/50 px-3 py-1 rounded-full">📅 创建时间：{new Date(project.created_at).toLocaleDateString()}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${project.status === 'done' ? 'bg-fairytale-secondary/30 text-green-700' :
                project.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
              }`}>
              {project.status === 'done' ? '✅ 已完成' :
                project.status === 'generating' ? '✨ 生成中' : '📝 编辑中'}
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8 mb-8">
          <h2 className="text-2xl font-bold text-fairytale-text mb-6 font-display text-center">✨ 绘本创作步骤</h2>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step.key)
              return (
                <Link
                  key={step.key}
                  href={step.href}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 ${status === 'completed'
                      ? 'bg-fairytale-secondary/10 border-fairytale-secondary/30 hover:bg-fairytale-secondary/20'
                      : 'bg-white/50 border-gray-100 hover:border-fairytale-primary/30 hover:bg-white'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${status === 'completed'
                        ? 'bg-fairytale-secondary text-green-700'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      {status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-fairytale-text flex items-center gap-2">
                        <span>{step.icon}</span>
                        {step.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === 'completed' && (
                      <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">已完成</span>
                    )}
                    <span className="text-fairytale-primary text-xl">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {project.status !== 'done' && (
          <div className="text-center">
            <Link
              href={`/projects/${id}/character`}
              className="bg-fairytale-primary text-white px-10 py-4 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 transition-all shadow-lg text-lg inline-flex items-center gap-2"
            >
              <span>🚀</span> 继续创作
            </Link>
          </div>
        )}

        {project.status === 'done' && (
          <div className="text-center">
            <Link
              href={`/projects/${id}/export`}
              className="bg-fairytale-secondary text-green-800 px-10 py-4 rounded-full font-bold hover:bg-fairytale-accent hover:scale-105 transition-all shadow-lg text-lg inline-flex items-center gap-2"
            >
              <span>📥</span> 导出绘本
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}