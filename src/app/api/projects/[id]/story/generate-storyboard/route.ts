import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseSimple'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { SYSTEM_PROMPT_STORYBOARD, API_CONFIG_TIPS } from '@/lib/prompts'

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
    const { story } = await request.json()

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

    // 删除现有的分镜（如果有）
    await supabase
      .from('storyboards')
      .delete()
      .eq('project_id', id)

    console.log('🎬 开始使用 Gemini 生成故事分镜...')
    console.log('📖 故事内容:', story)

    // 使用 Gemini 1.5 Flash 生成故事分镜
    let storyboards: any[] = []

    try {
      const geminiApiKey = process.env.GEMINI_API_KEY

      if (!geminiApiKey) {
        console.warn('⚠️ Gemini API key not configured, using mock data')
        throw new Error('GEMINI_API_KEY not configured')
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey)

      // 🔥 关键优化：开启 JSON 模式
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json", // 强制输出 JSON
          temperature: 0.7, // 适中的创造性
          topP: 0.8,
          topK: 40
        }
      })

      // 拼接提示词
      const finalPrompt = `${SYSTEM_PROMPT_STORYBOARD}

故事全文：
${story}`

      console.log('📤 发送请求到 Gemini API...')
      const result = await model.generateContent(finalPrompt)
      const response = result.response
      const jsonString = response.text()

      console.log('📥 Gemini API 响应:', jsonString)

      // 解析 JSON 响应
      const parsedStoryboards = JSON.parse(jsonString)

      // 验证数据格式
      if (!Array.isArray(parsedStoryboards)) {
        throw new Error('Invalid response format: expected array')
      }

      // 标准化数据格式
      storyboards = parsedStoryboards.map((item: any, index: number) => ({
        project_id: id,
        page_index: index,
        description: item.scene_description || item.description || `第 ${index + 1} 页场景`,
        text: item.text || '',
        created_at: new Date().toISOString()
      }))

      console.log(`✅ Gemini 成功生成 ${storyboards.length} 个分镜`)

    } catch (geminiError) {
      console.error('❌ Gemini 生成失败:', geminiError)

      // 降级处理：使用模拟数据
      console.log('🔄 使用备用分镜数据')

      const mockStoryboards = [
        { scene_description: "从前，有一个小女孩住在森林边的小屋里", text: "从前，有一个小女孩住在森林边的小屋里" },
        { scene_description: "她决定去奶奶家探望，带了一篮子好吃的", text: "她决定去奶奶家探望" },
        { scene_description: "森林里的小鸟为她指引方向", text: "森林里的小鸟为她指引方向" },
        { scene_description: "突然，一只大灰狼跳了出来", text: "突然，一只大灰狼跳了出来" },
        { scene_description: "小女孩很害怕，但她很勇敢", text: "小女孩很害怕，但她很勇敢" },
        { scene_description: "她想出了聪明的办法对付大灰狼", text: "她想出了聪明的办法" },
        { scene_description: "大灰狼被她的智慧打败了", text: "大灰狼被她的智慧打败了" },
        { scene_description: "小女孩继续前往奶奶家", text: "小女孩继续前往奶奶家" },
        { scene_description: "奶奶见到她非常开心", text: "奶奶见到她非常开心" },
        { scene_description: "她们一起享用了美味的点心", text: "她们一起享用了美味的点心" }
      ]

      storyboards = mockStoryboards.map((item, index) => ({
        project_id: id,
        page_index: index,
        description: item.scene_description,
        text: item.text,
        created_at: new Date().toISOString()
      }))
    }

    console.log('📊 准备插入的分镜数据:', storyboards.map((sb, i) => ({
      page: i + 1,
      description: sb.description.substring(0, 50) + '...'
    })))

    const { data: insertedStoryboards, error: insertError } = await supabase
      .from('storyboards')
      .insert(storyboards)
      .select('*')
      .order('page_index', { ascending: true })

    if (insertError) {
      console.error('分镜插入失败:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log('✅ 分镜生成成功:', {
      projectId: id,
      storyboardCount: insertedStoryboards?.length || 0,
      storyboards: insertedStoryboards?.map(sb => ({ id: sb.id, page_index: sb.page_index, description: sb.description.substring(0, 30) + '...' }))
    })

    return NextResponse.json({
      storyboards: insertedStoryboards?.map((sb) => ({
        id: sb.id, // 返回数据库中的真实ID
        project_id: sb.project_id,
        page_index: sb.page_index, // 保持字段名称一致
        description: sb.description,
        text: sb.text, // 包含文本配文
        created_at: sb.created_at
      })) || []
    })
  } catch (error) {
    console.error('Error generating storyboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}