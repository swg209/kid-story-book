/**
 * 图片删除 API
 * 用于从 Supabase Storage 删除图片
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { deleteImage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    // 创建 Supabase 客户端
    const supabase = await createClient(request)

    // 获取用户信息
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser()

    if (authError || !user) {
      console.error('认证失败:', authError)
      return NextResponse.json(
        { error: '请先登录后再操作' },
        { status: 401 }
      )
    }

    // 获取请求体
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: '缺少图片URL参数' },
        { status: 400 }
      )
    }

    console.log(`🗑️ 用户 ${user.id} 请求删除图片:`, imageUrl)

    // 删除图片
    const result = await deleteImage(imageUrl)

    if (result.success) {
      console.log('✅ 图片删除成功')
      return NextResponse.json({
        success: true,
        message: '图片删除成功'
      })
    } else {
      console.error('❌ 图片删除失败:', result.error)
      return NextResponse.json(
        { error: result.error || '图片删除失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ 删除图片 API 异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  // 支持 DELETE 方法作为别名
  return POST(request)
}