/**
 * Supabase Storage 图片管理工具
 * 提供图片上传、下载、删除等功能
 */

import { createClient } from '@supabase/supabase-js'
import { createSimpleClient } from './supabaseSimple'

// 存储桶配置
const BUCKET_NAME = 'story-images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']

interface StorageResult {
  success: boolean
  data?: string
  error?: string
}

/**
 * 获取 Supabase Storage 客户端
 */
function getStorageClient() {
  const supabase = createSimpleClient()
  return supabase.storage
}

/**
 * 确保 Storage Bucket 存在
 */
export async function ensureBucketExists(): Promise<StorageResult> {
  try {
    const storage = getStorageClient()

    // 检查 bucket 是否存在
    const { data: buckets, error } = await storage.listBuckets()

    if (error) {
      console.error('获取存储桶列表失败:', error)
      return { success: false, error: error.message }
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      // 创建新的存储桶
      const { error: createError } = await storage.createBucket(BUCKET_NAME, {
        public: true, // 允许公开访问
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: MAX_FILE_SIZE
      })

      if (createError) {
        console.error('创建存储桶失败:', createError)
        return { success: false, error: createError.message }
      }

      console.log(`✅ 成功创建存储桶: ${BUCKET_NAME}`)
    } else {
      console.log(`ℹ️ 存储桶 ${BUCKET_NAME} 已存在`)
    }

    // 设置 bucket 的公共访问策略
    const { error: policyError } = await storage.from(BUCKET_NAME).createSignedUrl('setup.txt', 60)

    if (policyError && !policyError.message.includes('The object was not found')) {
      console.warn('设置存储桶策略时出现警告:', policyError.message)
    }

    return { success: true }

  } catch (error) {
    console.error('初始化存储桶失败:', error)
    return { success: false, error: '初始化存储桶失败' }
  }
}

/**
 * 将 Base64 图片数据上传到 Supabase Storage
 */
export async function uploadImageFromBase64(
  base64Data: string,
  fileName: string,
  path: string = 'generated'
): Promise<StorageResult> {
  try {
    // 确保 base64Data 包含正确的 data URL 前缀
    const base64String = base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data

    // 检查文件大小
    const fileSize = Buffer.byteLength(base64String, 'base64')
    if (fileSize > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `文件大小 ${Math.round(fileSize / 1024 / 1024)}MB 超过限制 ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // 检查文件扩展名
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        success: false,
        error: `不支持的文件格式: ${fileExtension}。支持的格式: ${ALLOWED_EXTENSIONS.join(', ')}`
      }
    }

    // 确保 bucket 存在
    const bucketResult = await ensureBucketExists()
    if (!bucketResult.success) {
      return bucketResult
    }

    // 生成唯一的文件名（避免冲突）
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const uniqueFileName = `${timestamp}_${randomSuffix}_${fileName}`
    const fullPath = `${path}/${uniqueFileName}`

    // 将 base64 转换为 Buffer
    const imageBuffer = Buffer.from(base64String, 'base64')

    // 上传到 Supabase Storage
    const storage = getStorageClient()
    const { data, error } = await storage
      .from(BUCKET_NAME)
      .upload(fullPath, imageBuffer, {
        contentType: `image/${fileExtension}`,
        upsert: true
      })

    if (error) {
      console.error('图片上传失败:', error)
      return { success: false, error: error.message }
    }

    // 获取公共 URL
    const { data: { publicUrl } } = storage
      .from(BUCKET_NAME)
      .getPublicUrl(fullPath)

    console.log(`✅ 图片上传成功: ${fullPath}`)
    console.log(`🔗 公共URL: ${publicUrl}`)

    return {
      success: true,
      data: publicUrl
    }

  } catch (error) {
    console.error('图片上传异常:', error)
    return { success: false, error: '图片上传失败' }
  }
}

/**
 * 从 Supabase Storage 删除图片
 */
export async function deleteImage(imageUrl: string): Promise<StorageResult> {
  try {
    if (!imageUrl) {
      return { success: false, error: '图片URL不能为空' }
    }

    // 从 URL 中提取文件路径
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/)

    if (!pathMatch) {
      return { success: false, error: '无效的图片URL格式' }
    }

    const filePath = decodeURIComponent(pathMatch[1])

    const storage = getStorageClient()
    const { error } = await storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('图片删除失败:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ 图片删除成功: ${filePath}`)
    return { success: true }

  } catch (error) {
    console.error('图片删除异常:', error)
    return { success: false, error: '图片删除失败' }
  }
}

/**
 * 获取图片的公共 URL（如果不存在则上传）
 */
export async function getOrUploadImage(
  base64Data: string,
  fileName: string,
  path: string = 'generated'
): Promise<StorageResult> {
  // 如果已经是公共 URL 格式，直接返回
  if (base64Data.startsWith('http')) {
    return { success: true, data: base64Data }
  }

  // 如果是 base64 格式，上传到 Storage
  if (base64Data.startsWith('data:image/')) {
    // 提取文件扩展名
    const mimeType = base64Data.match(/data:image\/([^;]+)/)?.[1]
    if (mimeType) {
      fileName = `${fileName}.${mimeType}`
    }

    return await uploadImageFromBase64(base64Data, fileName, path)
  }

  return { success: false, error: '无效的图片数据格式' }
}

/**
 * 批量上传多张图片
 */
export async function uploadMultipleImages(
  imagesData: string[],
  fileNamePrefix: string,
  path: string = 'generated'
): Promise<StorageResult[]> {
  const results: StorageResult[] = []

  for (let i = 0; i < imagesData.length; i++) {
    const fileName = `${fileNamePrefix}_${i + 1}`
    const result = await getOrUploadImage(imagesData[i], fileName, path)
    results.push(result)
  }

  return results
}

/**
 * 清理指定路径下的所有图片（谨慎使用）
 */
export async function cleanupPath(path: string): Promise<StorageResult> {
  try {
    const storage = getStorageClient()

    // 列出路径下的所有文件
    const { data: files, error } = await storage
      .from(BUCKET_NAME)
      .list(path)

    if (error) {
      console.error('获取文件列表失败:', error)
      return { success: false, error: error.message }
    }

    if (!files || files.length === 0) {
      return { success: true }
    }

    // 删除所有文件
    const filePaths = files.map(file => `${path}/${file.name}`)
    const { error: deleteError } = await storage
      .from(BUCKET_NAME)
      .remove(filePaths)

    if (deleteError) {
      console.error('批量删除失败:', deleteError)
      return { success: false, error: deleteError.message }
    }

    console.log(`✅ 清理路径 ${path} 成功，删除了 ${filePaths.length} 个文件`)
    return { success: true }

  } catch (error) {
    console.error('清理路径异常:', error)
    return { success: false, error: '清理失败' }
  }
}