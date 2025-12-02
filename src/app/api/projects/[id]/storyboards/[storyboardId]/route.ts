import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; storyboardId: string }> }) {
  try {
    const { id, storyboardId } = await params
    const { description } = await request.json()
    
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

    // 更新分镜
    const { data: storyboard, error: updateError } = await supabase
      .from('storyboards')
      .update({ description })
      .eq('id', storyboardId)
      .eq('project_id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(storyboard)
  } catch (error) {
    console.error('Error updating storyboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}