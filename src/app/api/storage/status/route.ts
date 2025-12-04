/**
 * 存储状态检查 API
 * 用于检查 Supabase Storage 配置和状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { ensureBucketExists } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    // 创建 Supabase 客户端
    const supabase = await createClient(request)

    // 获取用户信息（可选，用于日志记录）
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser()

    const userId = user?.id || 'anonymous'
    console.log(`📊 用户 ${userId} 检查存储状态`)

    // 检查存储桶状态
    const bucketResult = await ensureBucketExists()

    // 获取存储桶列表
    const { data: buckets, error: listError } = await (supabase as any).storage.listBuckets()

    const storageInfo: any = {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      bucketCreated: bucketResult.success,
      bucketName: 'story-images',
      buckets: buckets || [],
      error: listError?.message || bucketResult.error,
      timestamp: new Date().toISOString()
    }

    // 检查存储桶是否存在于列表中
    if (buckets) {
      const storyBucket = buckets.find((bucket: any) => bucket.name === 'story-images')
      storageInfo.bucketExists = !!storyBucket
      if (storyBucket) {
        storageInfo.bucketDetails = {
          id: storyBucket.id,
          name: storyBucket.name,
          public: storyBucket.public,
          fileSizeLimit: storyBucket.file_size_limit,
          allowedMimeTypes: storyBucket.allowed_mime_types
        }
      }
    }

    // 如果检查成功，返回状态信息
    return NextResponse.json({
      success: true,
      data: storageInfo
    })

  } catch (error) {
    console.error('❌ 检查存储状态异常:', error)
    return NextResponse.json(
      {
        success: false,
        error: '检查存储状态失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}