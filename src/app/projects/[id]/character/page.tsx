'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
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
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCharacter(data.character)
      }
    } catch (error) {
      console.error('Error fetching character:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCharacter = async () => {
    setGenerating(true)
    try {
      const response = await fetch(`/api/projects/${id}/character/generate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCharacter(prev => prev ? { ...prev, images: data.images } : null)
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
          <div className="text-gray-600">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  if (!character) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">角色信息未找到</div>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            返回项目列表
          </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">角色生成</h1>
          <p className="text-gray-600">为您的绘本主角生成不同姿态的形象</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">角色描述</h2>
          <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {character.description}
          </div>
        </div>

        {!character.images || character.images.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-4">
                还未生成角色卡
              </div>
              <button
                onClick={handleGenerateCharacter}
                disabled={generating}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {generating ? '生成中...' : '生成角色卡'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">角色卡预览</h2>
              <button
                onClick={handleGenerateCharacter}
                disabled={generating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {generating ? '重新生成中...' : '重新生成'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {character.images.map((imageUrl, index) => (
                <div key={index} className="text-center">
                  <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img
                      src={imageUrl}
                      alt={`角色姿态 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm text-gray-600">姿态 {index + 1}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/projects/${id}/story`}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                下一步：编写故事
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}