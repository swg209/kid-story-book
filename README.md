# 儿童绘本生成器

一个让不会画画的家长/老师，也能用 AI 一键生成 角色一致 + 故事连贯 + 10 页成套插图 的儿童绘本生成网站。

## 功能特点

- 🎨 **角色一致性**: AI 确保主角在整个绘本中保持一致的外观
- 📖 **故事连贯性**: 自动拆分故事为 10 页连贯的分镜
- ⚡ **一键生成**: 完整的绘本插图，支持导出 PNG 和 PDF
- 🔐 **用户认证**: 基于 Supabase Auth 的安全认证系统
- 💾 **云端存储**: 项目和图片安全存储在 Supabase

## 技术栈

- **前端**: Next.js 14 + TypeScript + TailwindCSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **AI 集成**: 准备接入真实 AI 图像和文本生成 API

## 快速开始

### 环境准备

1. 安装依赖：
\`\`\`bash
npm install
\`\`\`

2. 配置环境变量：
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

编辑 \`.env.local\` 文件，填入您的 Supabase 配置：
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
\`\`\`

### 开发

运行开发服务器：
\`\`\`bash
npm run dev
\`\`\`

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建

构建生产版本：
\`\`\`bash
npm run build
npm run start
\`\`\`

## 数据库设置

在 Supabase 中创建以下表：

### projects
\`\`\`sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null,
  status text default 'editing', -- editing / generating / done
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
\`\`\`

### characters
\`\`\`sql
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  description text not null,
  reference_image_url text,
  images jsonb,
  created_at timestamptz default now()
);
\`\`\`

### storyboards
\`\`\`sql
create table public.storyboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  page_index int not null,
  description text not null,
  created_at timestamptz default now()
);
\`\`\`

### pages
\`\`\`sql
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  page_index int not null,
  image_url text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
\`\`\`

## 页面路由

| 路由 | 描述 |
|------|------|
| `/` | Landing 页面 |
| `/auth/login` | 登录页 |
| `/auth/signup` | 注册页 |
| `/dashboard` | 项目列表页 |
| `/projects/new` | 新建绘本向导 |
| `/projects/[id]` | 项目概览 |
| `/projects/[id]/character` | 角色生成与管理 |
| `/projects/[id]/story` | 故事输入与分镜 |
| `/projects/[id]/pages` | 绘本插图预览与重生成 |
| `/projects/[id]/export` | 导出页（PNG/PDF） |

## 开发状态

### ✅ 已完成
- [x] 项目初始化和基础架构
- [x] 用户认证系统（登录/注册）
- [x] Dashboard 和项目管理
- [x] 角色生成模块（Mock）
- [x] 故事分镜模块（Mock）
- [x] 绘本页面生成模块（Mock）
- [x] 导出功能（基础）
- [x] 响应式布局和路由保护

### 🚧 待开发
- [ ] 真实 AI 图像生成 API 集成
- [ ] 真实 LLM 故事分析 API 集成
- [ ] Supabase Storage 图片上传
- [ ] 真实 ZIP/PDF 打包功能
- [ ] 移动端优化
- [ ] 错误处理和加载状态优化

## 贡献

1. Fork 本仓库
2. 创建您的功能分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交您的更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。