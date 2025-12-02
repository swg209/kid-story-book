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

    // 合并页面和分镜数据
    const combinedData = storyboards.map((storyboard) => {
      const page = pages?.find(p => p.page_index === storyboard.page_index)
      return {
        pageIndex: storyboard.page_index,
        description: storyboard.description,
        imageUrl: page?.image_url || null,
        status: page?.status || 'pending'
      }
    })

    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}