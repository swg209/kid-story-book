'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'

interface ExportData {
  pageIndex: number
  imageUrl?: string
  description: string
}

export default function ExportPage() {
  const { id } = useParams()
  const router = useRouter()
  const [exportData, setExportData] = useState<ExportData[]>([])
  const [projectTitle, setProjectTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<{ png: boolean; pdf: boolean }>({
    png: false,
    pdf: false
  })

  useEffect(() => {
    if (id) {
      fetchExportData()
    }
  }, [id])

  const fetchExportData = async () => {
    try {
      // 获取PNG导出数据
      const response = await fetch(`/api/projects/${id}/export/png`)
      if (response.ok) {
        const data = await response.json()
        setProjectTitle(data.title)
        setExportData(data.images.map((url: string, index: number) => ({
          pageIndex: index,
          imageUrl: url,
          description: `第 ${index + 1} 页`
        })))
      } else {
        // 如果没有完成，从pages获取数据
        const pagesResponse = await fetch(`/api/projects/${id}/pages`)
        if (pagesResponse.ok) {
          const data = await pagesResponse.json()
          setExportData(data.map((item: ExportData) => item))
        }
      }
    } catch (error) {
      console.error('Error fetching export data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPNG = async () => {
    setExporting(prev => ({ ...prev, png: true }))
    try {
      const response = await fetch(`/api/projects/${id}/export/png`)
      if (response.ok) {
        const data = await response.json()

        // TODO: 实际的ZIP打包逻辑
        // 目前先在新窗口打开图片
        data.images.forEach((url: string, index: number) => {
          setTimeout(() => {
            window.open(url, '_blank')
          }, index * 500)
        })

        alert(`已打开 ${data.images.length} 张图片，您可以右键另存为\n未来将支持一键下载ZIP包`)
      }
    } catch (error) {
      console.error('Error exporting PNG:', error)
      alert('导出失败')
    } finally {
      setExporting(prev => ({ ...prev, png: false }))
    }
  }

  const handleExportPDF = async () => {
    setExporting(prev => ({ ...prev, pdf: true }))
    try {
      const response = await fetch(`/api/projects/${id}/export/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectTitle || '绘本'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('导出失败')
    } finally {
      setExporting(prev => ({ ...prev, pdf: false }))
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

  const allPagesComplete = exportData.length > 0 && exportData.every(page => page.imageUrl)

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link
            href={`/projects/${id}`}
            className="text-fairytale-primary hover:text-fairytale-secondary text-sm mb-4 inline-flex items-center gap-1 font-bold transition-colors"
          >
            ← 返回项目
          </Link>
          <h1 className="text-3xl font-bold text-fairytale-text mb-2 font-display">📤 导出绘本</h1>
          <p className="text-gray-600 font-medium">选择您需要的格式导出完整的绘本</p>
        </div>

        {!allPagesComplete && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="text-yellow-600 text-2xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-yellow-800">绘本未完成</h3>
                <p className="text-yellow-700 mt-1 font-medium">
                  还有 {exportData.filter(p => !p.imageUrl).length} 页插图未生成完成，
                  请先<Link href={`/projects/${id}/pages`} className="text-blue-600 hover:text-blue-500 underline font-bold ml-1">完成所有插图</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-fairytale-primary/20 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <button
              onClick={handleExportPNG}
              disabled={!allPagesComplete || exporting.png || exporting.pdf}
              className="group p-8 border-2 border-dashed border-fairytale-secondary rounded-3xl hover:border-fairytale-primary hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🖼️</div>
              <h3 className="text-xl font-bold text-fairytale-text mb-2 font-display">导出 PNG</h3>
              <p className="text-gray-600 text-sm mb-6 font-medium">
                获取所有绘本插图的图片文件，适合单独使用或打印
              </p>
              <div className="text-fairytale-primary font-bold text-lg">
                {exporting.png ? '✨ 导出中...' : allPagesComplete ? '⬇️ 下载图片包' : '🔒 需完成插图'}
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={!allPagesComplete || exporting.pdf || exporting.png}
              className="group p-8 border-2 border-dashed border-fairytale-secondary rounded-3xl hover:border-fairytale-primary hover:bg-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📄</div>
              <h3 className="text-xl font-bold text-fairytale-text mb-2 font-display">导出 PDF</h3>
              <p className="text-gray-600 text-sm mb-6 font-medium">
                获取完整排版好的PDF文档，方便分享和打印
              </p>
              <div className="text-fairytale-secondary font-bold text-lg">
                {exporting.pdf ? '✨ 导出中...' : allPagesComplete ? '⬇️ 下载PDF文档' : '🔒 需完成插图'}
              </div>
            </button>
          </div>

          {exportData.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-fairytale-text mb-6 font-display">📖 绘本预览</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {exportData.map((page) => (
                  <div key={page.pageIndex} className="text-center group">
                    <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-3 shadow-md border-4 border-white group-hover:scale-105 transition-transform duration-300">
                      {page.imageUrl ? (
                        <img
                          src={page.imageUrl}
                          alt={`第 ${page.pageIndex + 1} 页`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50">
                          第 {page.pageIndex + 1} 页
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold text-fairytale-text bg-white/50 inline-block px-3 py-1 rounded-full">
                      第 {page.pageIndex + 1} 页
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allPagesComplete && (
            <div className="mt-12 text-center">
              <div className="text-green-600 mb-6 font-bold text-lg bg-green-50 inline-block px-6 py-2 rounded-full">✅ 绘本已完成，可以导出啦！</div>
              <div className="flex justify-center space-x-6">
                <button
                  onClick={handleExportPNG}
                  disabled={exporting.png || exporting.pdf}
                  className="bg-fairytale-primary text-white px-8 py-3 rounded-full font-bold hover:bg-fairytale-secondary hover:scale-105 disabled:opacity-50 transition-all shadow-lg"
                >
                  {exporting.png ? '✨ 导出中...' : '🖼️ 导出 PNG'}
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting.pdf || exporting.png}
                  className="bg-fairytale-secondary text-green-800 px-8 py-3 rounded-full font-bold hover:bg-fairytale-accent hover:scale-105 disabled:opacity-50 transition-all shadow-lg"
                >
                  {exporting.pdf ? '✨ 导出中...' : '📄 导出 PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}