import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { story } = await request.json()
    
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

    // 删除现有的分镜（如果有）
    await supabase
      .from('storyboards')
      .delete()
      .eq('project_id', id)

    // TODO: 这里应该调用真实的LLM API来分析故事并生成分镜
    // 目前先返回一些模拟的分镜数据
    const mockStoryboards = [
      "从前，有一个小女孩住在森林边的小屋里",
      "她决定去奶奶家探望，带了一篮子好吃的",
      "森林里的小鸟为她指引方向",
      "突然，一只大灰狼跳了出来",
      "小女孩很害怕，但她很勇敢",
      "她想出了聪明的办法对付大灰狼",
      "大灰狼被她的智慧打败了",
      "小女孩继续前往奶奶家",
      "奶奶见到她非常开心",
      "她们一起享用了美味的点心"
    ]

    // 插入新的分镜
    const storyboardsToInsert = mockStoryboards.map((description, index) => ({
      project_id: id,
      page_index: index,
      description
    }))

    const { data: storyboards, error: insertError } = await supabase
      .from('storyboards')
      .insert(storyboardsToInsert)
      .select('*')
      .order('page_index', { ascending: true })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      storyboards: storyboards.map((sb, index) => ({
        pageIndex: sb.page_index,
        description: sb.description
      }))
    })
  } catch (error) {
    console.error('Error generating storyboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}