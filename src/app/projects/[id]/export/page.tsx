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
          <div className="text-gray-600">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  const allPagesComplete = exportData.length > 0 && exportData.every(page => page.imageUrl)

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <Link 
            href={`/projects/${id}`}
            className="text-blue-600 hover:text-blue-500 text-sm mb-4 inline-block"
          >
            ← 返回项目
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">导出绘本</h1>
          <p className="text-gray-600">选择您需要的格式导出完整的绘本</p>
        </div>

        {!allPagesComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">绘本未完成</h3>
                <p className="text-yellow-700 mt-1">
                  还有 {exportData.filter(p => !p.imageUrl).length} 页插图未生成完成，
                  请先<Link href={`/projects/${id}/pages`} className="text-blue-600 hover:text-blue-500 underline">完成所有插图</Link>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <button
              onClick={handleExportPNG}
              disabled={!allPagesComplete || exporting.png || exporting.pdf}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">导出 PNG</h3>
              <p className="text-gray-600 text-sm mb-4">
                获取所有绘本插图的图片文件，适合单独使用或打印
              </p>
              <div className="text-blue-600 font-medium">
                {exporting.png ? '导出中...' : allPagesComplete ? '下载图片包' : '需完成插图'}
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={!allPagesComplete || exporting.pdf || exporting.png}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">导出 PDF</h3>
              <p className="text-gray-600 text-sm mb-4">
                获取完整排版好的PDF文档，方便分享和打印
              </p>
              <div className="text-green-600 font-medium">
                {exporting.pdf ? '导出中...' : allPagesComplete ? '下载PDF文档' : '需完成插图'}
              </div>
            </button>
          </div>

          {exportData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">绘本预览</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {exportData.map((page) => (
                  <div key={page.pageIndex} className="text-center">
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-2">
                      {page.imageUrl ? (
                        <img
                          src={page.imageUrl}
                          alt={`第 ${page.pageIndex + 1} 页`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          第 {page.pageIndex + 1} 页
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      第 {page.pageIndex + 1} 页
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allPagesComplete && (
            <div className="mt-8 text-center">
              <div className="text-green-600 mb-4">✅ 绘本已完成，可以导出</div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleExportPNG}
                  disabled={exporting.png || exporting.pdf}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {exporting.png ? '导出中...' : '导出 PNG'}
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting.pdf || exporting.png}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {exporting.pdf ? '导出中...' : '导出 PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}