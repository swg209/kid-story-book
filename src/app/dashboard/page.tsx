'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { supabase } from '@/lib/supabaseClient'
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
      // 获取当前用户session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        return
      }

      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
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
          <div className="text-fairytale-primary text-xl font-bold animate-bounce">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-fairytale-text font-display">我的绘本 📚</h1>
            <Link
              href="/projects/new"
              className="bg-fairytale-primary text-white px-6 py-3 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 transition-all shadow-md border-2 border-white"
            >
              ✨ 新建绘本
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-fairytale-secondary">
              <div className="text-6xl mb-4">🎨</div>
              <div className="text-gray-500 text-lg mb-6 font-medium">
                还没有创建任何绘本，快来施展魔法吧！
              </div>
              <Link
                href="/projects/new"
                className="bg-fairytale-primary text-white px-8 py-4 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 transition-all shadow-lg text-lg"
              >
                创建第一个绘本
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border-2 border-fairytale-primary/20 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-xl font-bold text-fairytale-text mb-2 font-display">
                    {project.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4 font-medium">
                    创建时间：{new Date(project.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${project.status === 'done' ? 'bg-fairytale-secondary/30 text-green-700' :
                        project.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                      }`}>
                      {project.status === 'done' ? '✅ 已完成' :
                        project.status === 'generating' ? '✨ 生成中' : '📝 编辑中'}
                    </span>
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-fairytale-primary hover:text-fairytale-secondary font-bold text-sm flex items-center gap-1"
                    >
                      进入 <span className="text-lg">→</span>
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