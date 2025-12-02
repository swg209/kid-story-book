import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '儿童绘本生成',
  description: '让不会画画的家长/老师，也能用 AI 一键生成角色一致 + 故事连贯的儿童绘本',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}