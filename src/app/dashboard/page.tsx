'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Project } from '@/types'

interface ProjectListResponse {
  projects: Project[]
}

export default function DashboardPage() {
  const { user, loading } = useSupabaseAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data: ProjectListResponse = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  if (loading || projectsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的绘本</h1>
          <Link
            href="/projects/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新建绘本
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              还没有创建任何绘本
            </div>
            <Link
              href="/projects/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              创建第一个绘本
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <div className="text-sm text-gray-500 mb-4">
                  创建时间：{new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'done' ? 'bg-green-100 text-green-800' :
                    project.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'done' ? '已完成' :
                     project.status === 'generating' ? '生成中' : '编辑中'}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:text-blue-500 font-medium text-sm"
                  >
                    进入 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </AppLayout>
    </AuthGuard>
  )
}