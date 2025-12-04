/**
 * Gemini Imagen图像生成API调用工具
 * API文档: https://ai.google.dev/gemini-api/docs/vision#imagen
 */

import { getSampleImageForDescription } from './sampleImages'
import { getOrUploadImage, uploadMultipleImages } from './storage'

interface ImageGenerationOptions {
  prompt: string
  width?: number
  height?: number
  count?: number
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const IMAGEN_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict'

// 主要的图像生成函数
export async function generateImage(options: ImageGenerationOptions): Promise<string[]> {
  const { prompt, width = 1024, height = 1024, count = 1 } = options

  try {
    // 检查API密钥是否配置
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using sample images')
      return getSampleImages(count)
    }

    console.log('🎨 开始生成图像，提示词:', prompt)
    console.log('📏 图像尺寸:', width, 'x', height)
    console.log('🔢 生成数量:', count)

    // 构建请求体 - 适配儿童绘本风格，移除不支持的negativePrompt参数
    const requestBody = {
      instances: [
        {
          prompt: `${prompt}，儿童绘本插画风格，温馨可爱，色彩鲜艳，简洁背景，适合3岁小朋友，卡通风格，无复杂背景，避免恐怖、暴力、黑暗元素`
        }
      ],
      parameters: {
        sampleCount: Math.min(count, 4), // Gemini API限制最多4张
        aspectRatio: "1:1", // 保持正方形比例
        addSafetyFilter: true
      }
    }

    console.log('📤 发送请求到 Gemini Imagen API:', IMAGEN_API_URL)
    console.log('📦 请求体:', JSON.stringify(requestBody, null, 2))

    // 调用Gemini Imagen API
    const response = await fetch(`${IMAGEN_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 API响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini Imagen API错误:', errorText)
      throw new Error(`Gemini Imagen API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📊 API响应数据:', JSON.stringify(data, null, 2))

    // 检查响应结构
    if (data && data.predictions && Array.isArray(data.predictions) && data.predictions.length > 0) {
      const base64Images = data.predictions.map((prediction: any, index: number) => {
        if (prediction && prediction.bytesBase64Encoded) {
          // 将base64图像数据转换为 data URL
          const imageData = `data:image/png;base64,${prediction.bytesBase64Encoded}`
          console.log(`✅ 图像 ${index + 1} 生成成功 (base64格式)`)
          return imageData
        } else {
          console.warn(`⚠️ 图像 ${index + 1} 数据格式异常:`, prediction)
          return null
        }
      }).filter((url: string | null) => url !== null)

      // 上传到 Supabase Storage
      if (base64Images.length > 0) {
        console.log('🔄 开始上传图片到 Supabase Storage...')

        // 生成文件名前缀（基于提示词的前几个字符）
        const fileNamePrefix = prompt.substring(0, 20).replace(/[^\w\u4e00-\u9fa5]/g, '_')

        // 批量上传图片
        const uploadResults = await uploadMultipleImages(
          base64Images,
          fileNamePrefix,
          'generated'
        )

        // 提取成功的公共URL
        const publicUrls = uploadResults
          .filter(result => result.success && result.data)
          .map(result => result.data!)

        if (publicUrls.length > 0) {
          console.log(`🎉 成功生成并上传 ${publicUrls.length} 张图像到 Supabase Storage`)
          return publicUrls
        } else {
          console.warn('⚠️ 所有图片上传失败，返回原始 base64 数据')
          return base64Images
        }
      }

      return base64Images
    } else {
      console.warn('⚠️ API响应格式异常，使用备用图片:', data)
      return getSampleImages(count)
    }

  } catch (error) {
    console.error('❌ 图像生成失败:', error)
    console.log('🔄 使用备用图片')
    return getSampleImages(count)
  }
}

// 为角色生成多个角度的图像
export async function generateCharacterImage(characterDescription: string): Promise<string[]> {
  console.log('👥 开始生成角色图像，角色描述:', characterDescription)

  const characterPrompts = [
    `${characterDescription}全身像，简单背景，儿童绘本风格`,
    `${characterDescription}半身像，微笑表情，友好可爱，儿童绘本风格`,
    `${characterDescription}侧面像，玩耍姿势，动态感，儿童绘本风格`,
    `${characterDescription}背影，可爱造型，温馨色彩，儿童绘本风格`,
    `${characterDescription}正面像，惊讶表情，卡通风格，色彩鲜艳`,
    `${characterDescription}坐姿，阅读或玩耍姿势，温馨场景，儿童绘本风格`
  ]

  try {
    const allImages: string[] = []

    for (let i = 0; i < characterPrompts.length; i++) {
      const prompt = characterPrompts[i]
      console.log(`🎨 生成角色角度 ${i + 1}/${characterPrompts.length}`)

      try {
        const images = await generateImage({
          prompt,
          width: 1024,
          height: 1024,
          count: 1
        })

        if (images && images.length > 0) {
          // 检查是否已经是公共URL，如果不是则上传
          const imageUrl = images[0]
          if (imageUrl.startsWith('http')) {
            allImages.push(imageUrl)
            console.log(`✅ 角色角度 ${i + 1} 完成 (已上传到Storage)`)
          } else {
            // 上传到 Supabase Storage
            const uploadResult = await getOrUploadImage(
              imageUrl,
              `character_angle_${i + 1}`,
              'characters'
            )
            if (uploadResult.success && uploadResult.data) {
              allImages.push(uploadResult.data)
              console.log(`✅ 角色角度 ${i + 1} 完成 (已上传到Storage)`)
            } else {
              console.warn(`⚠️ 角色角度 ${i + 1} 上传失败，使用原始数据`)
              allImages.push(imageUrl)
            }
          }
        } else {
          // 如果生成失败，使用样例图片
          const sampleUrl = getSampleImageForDescription(prompt, i)
          allImages.push(sampleUrl)
          console.log(`⚠️ 角色角度 ${i + 1} 使用样例图片`)
        }
      } catch (error) {
        console.error(`❌ 角色角度 ${i + 1} 生成失败:`, error)
        // 使用样例图片作为备用
        const sampleUrl = getSampleImageForDescription(prompt, i)
        allImages.push(sampleUrl)
      }

      // 添加延迟避免API限制
      if (i < characterPrompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Gemini API可能需要更长的延迟
      }
    }

    console.log(`🎉 角色图像生成完成，共 ${allImages.length} 张`)
    return allImages

  } catch (error) {
    console.error('❌ 角色图像生成整体失败:', error)
    // 返回全部样例图片
    return characterPrompts.map((prompt, index) => getSampleImageForDescription(prompt, index))
  }
}

// 为绘本生成所有页面插图
export async function generatePageImages(storyboards: Array<{ description: string, page_index: number }>): Promise<string[]> {
  console.log('📚 开始生成绘本插图，共', storyboards.length, '页')

  try {
    const pageImages: string[] = []

    for (let i = 0; i < storyboards.length; i++) {
      const storyboard = storyboards[i]
      console.log(`🎨 生成第 ${storyboard.page_index + 1} 页插图`)

      try {
        const images = await generateImage({
          prompt: `${storyboard.description}，儿童绘本插画风格，温馨可爱，色彩鲜艳，简洁背景`,
          width: 1024,
          height: 1024,
          count: 1
        })

        if (images && images.length > 0) {
          // 检查是否已经是公共URL，如果不是则上传
          const imageUrl = images[0]
          if (imageUrl.startsWith('http')) {
            pageImages.push(imageUrl)
            console.log(`✅ 第 ${storyboard.page_index + 1} 页插图生成完成 (已上传到Storage)`)
          } else {
            // 上传到 Supabase Storage
            const uploadResult = await getOrUploadImage(
              imageUrl,
              `page_${storyboard.page_index + 1}`,
              'story-pages'
            )
            if (uploadResult.success && uploadResult.data) {
              pageImages.push(uploadResult.data)
              console.log(`✅ 第 ${storyboard.page_index + 1} 页插图生成完成 (已上传到Storage)`)
            } else {
              console.warn(`⚠️ 第 ${storyboard.page_index + 1} 页上传失败，使用原始数据`)
              pageImages.push(imageUrl)
            }
          }
        } else {
          // 如果生成失败，使用样例图片
          const sampleUrl = getSampleImageForDescription(storyboard.description, storyboard.page_index)
          pageImages.push(sampleUrl)
          console.log(`⚠️ 第 ${storyboard.page_index + 1} 页使用样例图片`)
        }
      } catch (error) {
        console.error(`❌ 第 ${storyboard.page_index + 1} 页插图生成失败:`, error)
        // 使用样例图片作为备用
        const sampleUrl = getSampleImageForDescription(storyboard.description, storyboard.page_index)
        pageImages.push(sampleUrl)
      }

      // 添加延迟避免API限制
      if (i < storyboards.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Gemini API可能需要更长的延迟
      }
    }

    console.log(`🎉 绘本插图生成完成，共 ${pageImages.length} 张`)
    return pageImages

  } catch (error) {
    console.error('❌ 绘本插图生成整体失败:', error)
    // 返回全部样例图片
    return storyboards.map(storyboard => getSampleImageForDescription(storyboard.description, storyboard.page_index))
  }
}

// 单张图像生成函数（兼容旧接口）
export async function generateCharacterImageSingle(prompt: string): Promise<string> {
  const images = await generateImage({
    prompt,
    count: 1
  })

  if (images && images.length > 0) {
    return images[0]
  } else {
    // 如果生成失败，返回样例图片
    return getSampleImages(1)[0]
  }
}

// 重新生成单个页面图像（兼容旧接口）
export async function regeneratePageImage(prompt: string): Promise<string> {
  return await generateCharacterImageSingle(prompt)
}

// 备用图片获取函数
function getSampleImages(count: number): string[] {
  const sampleImages = [
    'https://images.unsplash.com/photo-1587652395909-7c31de6df6a8?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1587654780291-39c9794b0428?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1587651911156-79921284149e?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1587652916446-37259a47b1d3?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1587653459945-2e6031c19a4e?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1587652833329-15dd1994559d?w=800&h=600&fit=crop&auto=format'
  ]

  return Array.from({ length: count }, (_, i) => sampleImages[i % sampleImages.length])
}