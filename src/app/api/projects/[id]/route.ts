import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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