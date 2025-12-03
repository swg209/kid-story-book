import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseSimple'

const supabase = createClient()

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

    // 获取项目详情
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 获取角色信息
    const { data: character } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', id)
      .single()

    // 获取分镜信息
    const { data: storyboards } = await supabase
      .from('storyboards')
      .select('*')
      .eq('project_id', id)
      .order('page_index', { ascending: true })

    // 获取页面信息
    const { data: pages } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', id)
      .order('page_index', { ascending: true })

    return NextResponse.json({
      project,
      character,
      storyboards: storyboards || [],
      pages: pages || []
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}