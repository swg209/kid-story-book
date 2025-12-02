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
          <div className="text-gray-600">加载中...</div>
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
    { key: 'character', name: '角色生成', href: `/projects/${id}/character` },
    { key: 'story', name: '故事分镜', href: `/projects/${id}/story` },
    { key: 'pages', name: '绘本插图', href: `/projects/${id}/pages` },
    { key: 'export', name: '导出', href: `/projects/${id}/export` }
  ]

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>创建时间：{new Date(project.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.status === 'done' ? 'bg-green-100 text-green-800' :
              project.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status === 'done' ? '已完成' :
               project.status === 'generating' ? '生成中' : '编辑中'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">绘本创作步骤</h2>
          <div className="space-y-4">
            {steps.map((step) => {
              const status = getStepStatus(step.key)
              return (
                <Link
                  key={step.key}
                  href={step.href}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    status === 'completed' 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      status === 'completed' 
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {status === 'completed' ? '✓' : steps.indexOf(step) + 1}
                    </div>
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === 'completed' && (
                      <span className="text-green-600 text-sm">已完成</span>
                    )}
                    <span className="text-gray-400">→</span>
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
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              继续创作
            </Link>
          </div>
        )}

        {project.status === 'done' && (
          <div className="text-center">
            <Link
              href={`/projects/${id}/export`}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              导出绘本
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}