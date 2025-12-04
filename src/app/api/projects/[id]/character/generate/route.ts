import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseSimple'
import { generateCharacterImage } from '@/lib/imageGeneration'
import { sampleCharacterImages } from '@/lib/sampleImages'

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

    // 获取角色信息
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', id)
      .single()

    if (characterError || !character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 使用Gemini Imagen API生成角色卡
    try {
      console.log('🎨 开始生成角色卡图片，角色描述:', character.description)
      console.log('🤖 使用Gemini Imagen API生成角色卡')

      // 尝试使用Gemini Imagen生成角色图片
      let finalImages: string[]

      try {
        finalImages = await generateCharacterImage(character.description)
        console.log('📷 Gemini生成的角色卡图片:', finalImages.map((url, i) => `姿态${i+1}: ${url.substring(0, 50)}...`))
      } catch (apiError) {
        console.error('❌ Gemini Imagen API调用失败:', apiError)
        console.log('🔄 降级为案例图片模式')

        // 如果API调用失败，使用案例角色图片
        finalImages = sampleCharacterImages.slice(0, 6)
        console.log('📷 案例角色卡图片:', finalImages.map((url, i) => `姿态${i+1}: ${url.substring(0, 50)}...`))
      }

      // 更新角色记录，保存生成的图片
      const { data: updatedCharacter, error: updateError } = await supabase
        .from('characters')
        .update({
          images: finalImages
        })
        .eq('project_id', id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      console.log('✅ 角色卡图片生成成功，数量:', finalImages.length)
      console.log('🎉 成功创建角色卡！')

      return NextResponse.json({
        images: finalImages,
        source: finalImages.some(img => img.startsWith('data:')) ? 'gemini' : 'samples'
      })

    } catch (generationError) {
      console.error('❌ 角色图片生成失败:', generationError)

      // 如果生成失败，返回占位符图片
      const fallbackImages = [
        'https://picsum.photos/400/600?random=1',
        'https://picsum.photos/400/600?random=2',
        'https://picsum.photos/400/600?random=3',
        'https://picsum.photos/400/600?random=4',
        'https://picsum.photos/400/600?random=5',
        'https://picsum.photos/400/600?random=6'
      ]

      return NextResponse.json({
        images: fallbackImages,
        warning: '角色卡生成失败，显示占位符图片'
      })
    }
  } catch (error) {
    console.error('Error generating character:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}