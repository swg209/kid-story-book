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

    // 获取角色信息
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', id)
      .single()

    if (characterError || !character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // TODO: 这里应该调用真实的AI图像生成API
    // 目前先返回一些模拟的图片URL
    const mockImages = [
      'https://picsum.photos/400/600?random=1',
      'https://picsum.photos/400/600?random=2',
      'https://picsum.photos/400/600?random=3',
      'https://picsum.photos/400/600?random=4',
      'https://picsum.photos/400/600?random=5',
      'https://picsum.photos/400/600?random=6'
    ]

    // 更新角色记录，保存生成的图片
    const { data: updatedCharacter, error: updateError } = await supabase
      .from('characters')
      .update({
        images: mockImages
      })
      .eq('project_id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ images: mockImages })
  } catch (error) {
    console.error('Error generating character:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}