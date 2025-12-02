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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // 获取页面信息和分镜信息
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', id)
      .eq('status', 'done')
      .order('page_index', { ascending: true })

    const { data: storyboards, error: storyboardError } = await supabase
      .from('storyboards')
      .select('*')
      .eq('project_id', id)
      .order('page_index', { ascending: true })

    if (pagesError) {
      return NextResponse.json({ error: pagesError.message }, { status: 500 })
    }

    if (storyboardError) {
      return NextResponse.json({ error: storyboardError.message }, { status: 500 })
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'No completed pages found' }, { status: 400 })
    }

    // 合并数据
    const exportData = pages.map((page) => {
      const storyboard = storyboards?.find(sb => sb.page_index === page.page_index)
      return {
        pageIndex: page.page_index,
        imageUrl: page.image_url,
        description: storyboard?.description || ''
      }
    })

    // TODO: 实际应该是打包成ZIP文件
    // 目前先返回图片URL数组
    return NextResponse.json({ 
      images: exportData.map(item => item.imageUrl),
      title: project.title
    })
  } catch (error) {
    console.error('Error exporting PNG:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}