import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; pageIndex: string }> }) {
  try {
    const { id, pageIndex } = await params
    const page_index = parseInt(pageIndex)

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

    // 获取页面信息
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', id)
      .eq('page_index', page_index)
      .single()

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // 获取对应的分镜信息
    const { data: storyboard, error: storyboardError } = await supabase
      .from('storyboards')
      .select('*')
      .eq('project_id', id)
      .eq('page_index', page_index)
      .single()

    if (storyboardError || !storyboard) {
      return NextResponse.json({ error: 'Storyboard not found' }, { status: 404 })
    }

    // 更新页面状态为生成中
    await supabase
      .from('pages')
      .update({ status: 'generating' })
      .eq('id', page.id)

    // TODO: 这里应该调用真实的AI图像生成API
    // 目前先模拟生成过程，使用新的随机图片
    setTimeout(async () => {
      const newImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`
      
      // 更新页面记录
      await supabase
        .from('pages')
        .update({
          image_url: newImageUrl,
          status: 'done',
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id)

      // 检查是否所有页面都完成
      const { data: allPages } = await supabase
        .from('pages')
        .select('status')
        .eq('project_id', id)

      if (allPages && allPages.every(p => p.status === 'done')) {
        await supabase
          .from('projects')
          .update({ status: 'done' })
          .eq('id', id)
      }
    }, 1500) // 模拟1.5秒生成时间

    return NextResponse.json({ 
      pageIndex: page_index,
      status: 'generating'
    })
  } catch (error) {
    console.error('Error regenerating page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}