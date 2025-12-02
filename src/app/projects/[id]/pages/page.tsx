'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'

interface PageWithDescription {
  pageIndex: number
  description: string
  imageUrl?: string
  status: 'pending' | 'generating' | 'done' | 'error'
}

export default function PagesPage() {
  const { id } = useParams()
  const router = useRouter()
  const [pages, setPages] = useState<PageWithDescription[]>([])
  const [selectedPage, setSelectedPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [regenerating, setRegenerating] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    if (id) {
      fetchPages()
    }

    // 设置轮询检查生成状态
    const interval = setInterval(() => {
      if (generatingAll || Object.values(regenerating).some(Boolean)) {
        fetchPages()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [id, generatingAll, regenerating])

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/pages`)
      if (response.ok) {
        const data = await response.json()
        setPages(data)
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAll = async () => {
    setGeneratingAll(true)
    try {
      const response = await fetch(`/api/projects/${id}/pages/generate-all`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setPages(data.pages)
      }
    } catch (error) {
      console.error('Error generating pages:', error)
      alert('生成失败')
    } finally {
      setGeneratingAll(false)
      // 开始轮询检查状态
      setTimeout(() => {
        const checkStatus = setInterval(() => {
          fetchPages()
          const allDone = pages.every(p => p.status === 'done' || p.status === 'error')
          if (allDone) {
            clearInterval(checkStatus)
          }
        }, 1000)
      }, 1000)
    }
  }

  const handleRegenerate = async (pageIndex: number) => {
    setRegenerating(prev => ({ ...prev, [pageIndex]: true }))
    try {
      const response = await fetch(`/api/projects/${id}/pages/${pageIndex}/regenerate`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchPages()
      }
    } catch (error) {
      console.error('Error regenerating page:', error)
      alert('重生成失败')
    } finally {
      setRegenerating(prev => ({ ...prev, [pageIndex]: false }))
    }
  }

  const currentPage = pages[selectedPage]

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
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link
            href={`/projects/${id}`}
            className="text-fairytale-primary hover:text-fairytale-secondary text-sm mb-4 inline-flex items-center gap-1 font-bold transition-colors"
          >
            ← 返回项目
          </Link>
          <h1 className="text-3xl font-bold text-fairytale-text mb-2 font-display">🖼️ 绘本插图</h1>
          <p className="text-gray-600 font-medium">预览和管理您的10页绘本插图</p>
        </div>

        {!pages || pages.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-12 text-center">
            <div className="text-6xl mb-6">📝</div>
            <div className="text-gray-500 text-lg mb-8 font-medium">
              还未生成分镜，请先完成故事分镜步骤
            </div>
            <Link
              href={`/projects/${id}/story`}
              className="bg-fairytale-primary text-white px-8 py-3 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 transition-all shadow-lg text-lg inline-flex items-center gap-2"
            >
              <span>📝</span> 去生成分镜
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧页码列表 */}
            <div className="lg:w-1/4">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-6">
                <h3 className="font-bold text-fairytale-text mb-4 font-display text-lg">页面列表</h3>
                <div className="space-y-3">
                  {pages.map((page) => (
                    <button
                      key={page.pageIndex}
                      onClick={() => setSelectedPage(page.pageIndex)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl border-2 transition-all ${selectedPage === page.pageIndex
                          ? 'border-fairytale-primary bg-fairytale-primary/10 shadow-sm'
                          : 'border-transparent hover:bg-white/50 hover:border-fairytale-secondary/30'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${page.status === 'done' ? 'bg-fairytale-secondary text-green-800' :
                          page.status === 'generating' ? 'bg-yellow-100 text-yellow-800 animate-pulse' :
                            'bg-gray-200 text-gray-500'
                        }`}>
                        {page.pageIndex + 1}
                      </div>
                      <div className="flex-grow text-left">
                        <div className="text-sm font-bold text-fairytale-text">第 {page.pageIndex + 1} 页</div>
                        <div className="text-xs font-medium text-gray-500">
                          {page.status === 'done' ? '✅ 已完成' :
                            page.status === 'generating' ? '✨ 生成中' :
                              page.status === 'error' ? '❌ 生成失败' : '⏳ 待生成'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {pages.filter(p => p.status === 'done').length === pages.length && (
                  <div className="mt-6">
                    <Link
                      href={`/projects/${id}/export`}
                      className="w-full bg-fairytale-secondary text-green-800 px-4 py-3 rounded-full font-bold hover:bg-fairytale-accent hover:scale-105 transition-all shadow-md text-center block"
                    >
                      📥 导出绘本
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧预览区 */}
            <div className="lg:w-3/4">
              {currentPage && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-fairytale-text font-display">
                      第 {currentPage.pageIndex + 1} 页
                    </h2>
                    <div className="flex space-x-3">
                      {currentPage.status === 'pending' && pages.filter(p => p.status === 'done').length === 0 && (
                        <button
                          onClick={handleGenerateAll}
                          disabled={generatingAll}
                          className="bg-fairytale-primary text-white px-6 py-2 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all shadow-md"
                        >
                          {generatingAll ? '✨ 生成中...' : '✨ 生成整套绘本'}
                        </button>
                      )}
                      {currentPage.status === 'done' && (
                        <button
                          onClick={() => handleRegenerate(currentPage.pageIndex)}
                          disabled={regenerating[currentPage.pageIndex]}
                          className="bg-fairytale-accent text-white px-6 py-2 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all shadow-md"
                        >
                          {regenerating[currentPage.pageIndex] ? '✨ 重生成中...' : '🔄 重生成此页'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">分镜描述</div>
                    <div className="bg-white/50 p-6 rounded-2xl border-2 border-fairytale-secondary/30 text-gray-700 font-medium leading-relaxed">
                      {currentPage.description}
                    </div>
                  </div>

                  <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-inner border-4 border-white relative">
                    {currentPage.status === 'generating' && (
                      <div className="w-full h-full flex items-center justify-center bg-fairytale-background/50">
                        <div className="text-center">
                          <div className="text-4xl animate-bounce mb-4">🎨</div>
                          <div className="text-fairytale-primary font-bold text-lg">AI 正在施法绘制插图...</div>
                        </div>
                      </div>
                    )}
                    {currentPage.status === 'error' && (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <div className="text-center">
                          <div className="text-red-500 text-lg mb-2 font-bold">生成失败</div>
                          <button
                            onClick={() => handleRegenerate(currentPage.pageIndex)}
                            className="text-fairytale-primary hover:text-fairytale-secondary font-bold underline"
                          >
                            重新生成
                          </button>
                        </div>
                      </div>
                    )}
                    {currentPage.status === 'pending' && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                          <div className="text-4xl mb-4">⏳</div>
                          <div className="font-medium">等待生成</div>
                          {pages.filter(p => p.status === 'done').length === 0 && (
                            <button
                              onClick={handleGenerateAll}
                              className="text-fairytale-primary hover:text-fairytale-secondary font-bold text-sm mt-2 underline"
                            >
                              点击生成整套绘本
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {currentPage.status === 'done' && currentPage.imageUrl && (
                      <img
                        src={currentPage.imageUrl}
                        alt={`第 ${currentPage.pageIndex + 1} 页插图`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}