import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { generatePageImages } from '@/lib/imageGeneration'
import { getSampleImageForDescription } from '@/lib/sampleImages'

// 使用统一的安全认证验证
async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Invalid or missing authorization token' }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return { user }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // 使用统一认证验证
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const { user } = authResult

    // 验证项目归属
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 获取分镜信息
    const { data: storyboards, error: storyboardError } = await supabase
      .from('storyboards')
      .select('*')
      .eq('project_id', id)
      .order('page_index', { ascending: true })

    if (storyboardError) {
      return NextResponse.json({ error: storyboardError.message }, { status: 500 })
    }

    if (!storyboards || storyboards.length === 0) {
      return NextResponse.json({ error: 'No storyboards found' }, { status: 400 })
    }

    // 获取角色信息
    const { data: character } = await supabase
      .from('characters')
      .select('images')
      .eq('project_id', id)
      .single()

    // 更新项目状态为生成中
    await supabase
      .from('projects')
      .update({ status: 'generating' })
      .eq('id', id)

    // 创建页面记录
    const pagesToCreate = storyboards.map((storyboard) => ({
      project_id: id,
      page_index: storyboard.page_index,
      status: 'generating'
    }))

    // 先删除现有的页面
    await supabase
      .from('pages')
      .delete()
      .eq('project_id', id)

    // 插入新的页面记录
    const { data: pages, error: insertError } = await supabase
      .from('pages')
      .insert(pagesToCreate)
      .select('*')
      .order('page_index', { ascending: true })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // 使用Gemini Imagen API生成绘本
    try {
      console.log('🎨 开始生成绘本页面图片，页面数量:', storyboards.length)
      console.log('🤖 尝试使用Gemini Imagen API生成绘本')

      let generatedImages: string[]

      try {
        // 尝试使用Gemini Imagen生成图片
        generatedImages = await generatePageImages(storyboards)
        console.log('🎉 Gemini生成的绘本图片:', generatedImages.map((url, i) => `第${i+1}页: ${url.substring(0, 50)}...`))
      } catch (apiError) {
        console.error('❌ Gemini Imagen API调用失败:', apiError)
        console.log('🔄 降级为案例图片模式')

        // 如果API调用失败，为每个页面匹配最合适的案例图片
        generatedImages = storyboards.map((storyboard, index) => {
          const sampleImageUrl = getSampleImageForDescription(storyboard.description, index)
          console.log(`📖 第${index + 1}页: ${storyboard.description.substring(0, 30)}... → ${sampleImageUrl.substring(0, 50)}...`)
          return sampleImageUrl
        })
      }

      // 更新页面记录，保存图片URL
      for (let i = 0; i < pages.length; i++) {
        await supabase
          .from('pages')
          .update({
            image_url: generatedImages[i],
            status: 'done'
          })
          .eq('id', pages[i].id)
      }

      // 更新项目状态为完成
      await supabase
        .from('projects')
        .update({ status: 'done' })
        .eq('id', id)

      console.log('✅ 绘本页面图片生成完成，数量:', generatedImages.length)
      console.log('🎉 成功创建绘本！')

      return NextResponse.json({
        pages: pages.map((page, index) => ({
          pageIndex: page.page_index,
          status: 'done',
          imageUrl: generatedImages[index]
        })),
        source: generatedImages.some(img => img.startsWith('data:')) ? 'gemini' : 'samples'
      })

    } catch (generationError) {
      console.error('❌ 绘本页面生成失败:', generationError)

      // 如果生成失败，更新状态为错误并提供占位符图片
      const fallbackImages = storyboards.map((_, index) =>
        `https://picsum.photos/800/600?random=${index + 100}`
      )

      for (let i = 0; i < pages.length; i++) {
        await supabase
          .from('pages')
          .update({
            image_url: fallbackImages[i],
            status: 'error'
          })
          .eq('id', pages[i].id)
      }

      await supabase
        .from('projects')
        .update({ status: 'error' })
        .eq('id', id)

      return NextResponse.json({
        error: '绘本生成失败，请稍后重试',
        pages: pages.map((page, index) => ({
          pageIndex: page.page_index,
          status: 'error',
          imageUrl: fallbackImages[index]
        }))
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error generating pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}