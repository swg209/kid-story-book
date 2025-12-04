import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// 生成HTML内容用于PDF导出
function generatePDFHTML(title: string, pages: any[]): string {
  // HTML转义函数，确保特殊字符正确显示
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  // 确保标题和描述中的特殊字符能正确编码
  const safeTitle = escapeHtml(title)
  const safePages = pages.map(page => ({
    ...page,
    description: escapeHtml(page.description || '')
  }))

  // 创建CSS样式 - 优化用于PDF打印
  const cssStyles = `
    @page {
      size: A4;
      margin: 2cm;
    }

    body {
      font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .storybook {
      max-width: 100%;
      margin: 0 auto;
    }

    .title-page {
      text-align: center;
      page-break-after: always;
      padding: 100px 0;
    }

    .title-page h1 {
      font-size: 36px;
      color: #333;
      margin-bottom: 20px;
      font-weight: bold;
    }

    .content-page {
      page-break-after: always;
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .page-number {
      font-size: 14px;
      color: #666;
      font-weight: bold;
    }

    .image-container {
      width: 100%;
      height: 350px;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20px 0 30px 0;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .image-placeholder {
      color: #999;
      font-size: 18px;
      text-align: center;
    }

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }

    .description {
      text-align: center;
      font-size: 18px;
      color: #333;
      line-height: 1.8;
      margin: 30px 0;
      font-weight: 500;
    }

    .page-footer {
      text-align: center;
      margin-top: auto;
      padding-top: 20px;
    }

    /* 打印时隐藏不需要的元素 */
    @media print {
      .no-print {
        display: none !important;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .content-page {
        page-break-after: always;
        page-break-inside: avoid;
      }
    }
  `

  // 创建标题页
  const titlePage = `<div class="title-page">
    <h1>${safeTitle}</h1>
    <div class="page-number">绘本故事</div>
  </div>`

  // 创建内容页面
  const contentPages = safePages.map((page, index) => {
    const imageContent = page.imageUrl ?
      `<img src="${page.imageUrl}" alt="第 ${page.pageIndex + 1} 页插图" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>第 ${page.pageIndex + 1} 页插图</div>'" />` :
      `<div class="image-placeholder">第 ${page.pageIndex + 1} 页插图</div>`

    return `<div class="content-page">
      <div class="page-header">
        <div class="page-number">第 ${page.pageIndex + 1} 页</div>
      </div>

      <div class="image-container">
        ${imageContent}
      </div>

      <div class="description">${page.description}</div>

      <div class="page-footer">
        <div class="page-number">第 ${page.pageIndex + 1} 页</div>
      </div>
    </div>`
  }).join('')

  // 组合完整的HTML
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>${cssStyles}</style>
</head>
<body>
  <div class="storybook">
    ${titlePage}
    ${contentPages}
  </div>

  <script>
    // 自动打印对话框，方便用户保存为PDF
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 1000);
    };

    // 监听打印完成事件
    window.addEventListener('afterprint', function() {
      // 打印完成后可以给用户一个提示
      document.body.innerHTML += '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#28a745;color:white;padding:20px;border-radius:8px;z-index:9999;">PDF生成完成！请查看您的下载文件夹。</div>';
    });
  </script>
</body>
</html>`
}

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
    const pdfData = pages.map((page) => {
      const storyboard = storyboards?.find(sb => sb.page_index === page.page_index)
      return {
        pageIndex: page.page_index,
        imageUrl: page.image_url,
        description: storyboard?.description || ''
      }
    })

    // 生成优化的HTML内容用于PDF打印
    const htmlContent = generatePDFHTML(project.title || '绘本', pdfData)

    // 使用Buffer确保正确的UTF-8编码
    const htmlBuffer = Buffer.from(htmlContent, 'utf-8')

    return new Response(htmlBuffer, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${encodeURIComponent(project.title || '绘本')}.pdf"`,
        'Content-Length': htmlBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}