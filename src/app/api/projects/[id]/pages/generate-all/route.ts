import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // TODO: 这里应该调用真实的AI图像生成API
    // 目前先模拟生成过程，使用随机图片
    setTimeout(async () => {
      const mockImages = storyboards.map((_, index) => 
        `https://picsum.photos/800/600?random=${index + 100}`
      )

      // 更新页面记录，保存生成的图片URL
      for (let i = 0; i < pages.length; i++) {
        await supabase
          .from('pages')
          .update({
            image_url: mockImages[i],
            status: 'done'
          })
          .eq('id', pages[i].id)
      }

      // 更新项目状态为完成
      await supabase
        .from('projects')
        .update({ status: 'done' })
        .eq('id', id)
    }, 2000) // 模拟2秒生成时间

    return NextResponse.json({ 
      pages: pages.map((page, index) => ({
        pageIndex: page.page_index,
        status: page.status,
        imageUrl: null
      }))
    })
  } catch (error) {
    console.error('Error generating pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}