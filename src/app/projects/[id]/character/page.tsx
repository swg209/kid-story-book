'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabaseClient'
import { Character } from '@/types'

export default function CharacterPage() {
  const { id } = useParams()
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCharacter()
    }
  }, [id])

  const fetchCharacter = async () => {
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
        setCharacter(data.character)
      } else if (response.status === 401) {
        router.push('/auth/login')
      } else if (response.status === 404) {
        // 项目不存在，可能是角色还没创建，尝试创建角色
        router.push(`/projects/${id}/story`)
      }
    } catch (error) {
      console.error('Error fetching character:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCharacter = async () => {
    setGenerating(true)
    try {
      // 获取当前用户session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        router.push('/auth/login')
        return
      }

      const response = await fetch(`/api/projects/${id}/character/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCharacter(prev => prev ? { ...prev, images: data.images } : null)
        // 重新获取完整的角色信息
        fetchCharacter()
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Error generating character:', error)
    } finally {
      setGenerating(false)
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

  if (!character) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">角色信息未找到</div>
          <Link href="/dashboard" className="text-fairytale-primary hover:text-fairytale-secondary font-bold">
            返回项目列表
          </Link>
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
          <h1 className="text-3xl font-bold text-fairytale-text mb-2 font-display">🎨 角色生成</h1>
          <p className="text-gray-600 font-medium">为您的绘本主角生成不同姿态的形象</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8 mb-8">
          <h2 className="text-xl font-bold text-fairytale-text mb-4 font-display">角色描述</h2>
          <div className="text-gray-700 bg-white/50 p-6 rounded-2xl border-2 border-fairytale-secondary/30 font-medium leading-relaxed">
            {character.description}
          </div>
        </div>

        {!character.images || character.images.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-12">
            <div className="text-center">
              <div className="text-6xl mb-6">✨</div>
              <div className="text-gray-500 text-lg mb-8 font-medium">
                还未生成角色卡，点击下方按钮开始施法！
              </div>
              <button
                onClick={handleGenerateCharacter}
                disabled={generating}
                className="bg-fairytale-primary text-white px-10 py-4 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all shadow-lg text-lg"
              >
                {generating ? '✨ 正在施法...' : '✨ 生成角色卡'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-fairytale-text font-display">角色卡预览</h2>
              <button
                onClick={handleGenerateCharacter}
                disabled={generating}
                className="bg-fairytale-accent text-white px-6 py-2 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all shadow-md text-sm"
              >
                {generating ? '✨ 重新施法...' : '🔄 重新生成'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {character.images.map((imageUrl, index) => (
                <div key={index} className="text-center group">
                  <div className="aspect-[2/3] bg-white rounded-2xl overflow-hidden mb-4 shadow-md border-4 border-white group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={imageUrl}
                      alt={`角色姿态 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm font-bold text-fairytale-text bg-white/50 inline-block px-3 py-1 rounded-full">姿态 {index + 1}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={`/projects/${id}/story`}
                className="bg-fairytale-secondary text-green-800 px-10 py-4 rounded-full font-bold hover:bg-fairytale-accent hover:scale-105 transition-all shadow-lg text-lg inline-flex items-center gap-2"
              >
                <span>📝</span> 下一步：编写故事
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}