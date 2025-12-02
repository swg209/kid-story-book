一、产品功能范围（精简版 PRD）
1. 产品一句话

一个让不会画画的家长/老师，也能用 AI 一键生成 角色一致 + 故事连贯 + 10 页成套插图 的儿童绘本生成网站。

2. 用户角色

普通用户（登录后）：

创建绘本项目

定义角色

输入故事 → 自动分镜

生成整套绘本插图

单页重生成

导出 PNG / PDF

不做多角色/多权限，简单 MVP。

3. 核心用户流程

注册 / 登录

进入「我的绘本」列表

新建项目：

填写项目名

填写角色描述（+ 可选上传参考图）

生成角色卡（多张角色姿态）

输入故事文本

AI 自动拆成 10 页分镜

一键生成 10 页插图

在预览页：

查看每一页

单页重生成

导出 PNG / PDF

二、前端路由 & 页面结构（Next.js App Router）

假设项目在 app/ 目录下使用 App Router。

路由 Path	描述
/	Landing / 简介 / CTA
/auth/login	登录页
/auth/signup	注册页
/dashboard	项目列表页
/projects/new	新建绘本向导（角色 + 故事）
/projects/[id]	项目概览（步骤导航）
/projects/[id]/character	角色生成与管理页
/projects/[id]/story	故事输入与分镜页
/projects/[id]/pages	绘本插图预览与重生成页
/projects/[id]/export	导出页（PNG/PDF）
页面简要说明（重点给 AI 工具看）
/ Landing

主要组件：功能介绍 + “开始创作”按钮

如果已登录：跳转 /dashboard

如果未登录：点击按钮 → /auth/signup

/auth/login & /auth/signup

使用 Supabase Auth

提交成功后 → 重定向 /dashboard

/dashboard

显示当前用户所有 projects

卡片：项目标题 / 创建时间 / 进入按钮

Button：”新建绘本“ → /projects/new

/projects/new

向导式表单：

填写项目标题

输入角色描述（文本 + 可选图片上传）

提交 → 创建 project + character → 跳到 /projects/[id]/character

/projects/[id]/character

显示角色描述

按钮：“生成角色卡”

调用后端 /api/projects/[id]/character/generate

生成后展示 4–6 张角色图（存 Supabase Storage）

提供 “下一步：编写故事” 按钮 → /projects/[id]/story

/projects/[id]/story

文本区域：输入完整故事

按钮：“生成 10 页分镜”

调用 /api/projects/[id]/story/generate-storyboard

下方列表展示 10 条分镜，每条可手动微调文本

“下一步：生成绘本插图” → /projects/[id]/pages

/projects/[id]/pages

左侧：10 页缩略图列表

右侧：当前页大图预览 + 文案

若该页未生成：

显示 “生成整套绘本”按钮

调用 /api/projects/[id]/pages/generate-all

单页卡片上提供：

“重生成此页”按钮 /api/projects/[id]/pages/[pageIndex]/regenerate

/projects/[id]/export

预览：10 张小图 + 文案

按钮：

生成 PNG ZIP → /api/projects/[id]/export/png

生成 PDF → /api/projects/[id]/export/pdf

三、数据模型 & Supabase Schema

提供 SQL，方便你直接让 AI 工具生成 migration。

1. users（Supabase Auth 自带，可不单独建）
2. projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null,
  status text default 'editing', -- editing / generating / done
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

3. characters
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  description text not null,
  reference_image_url text, -- 用户上传原始参考
  images jsonb, -- 保存角色卡各姿态URL数组
  created_at timestamptz default now()
);

4. storyboards
create table public.storyboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  page_index int not null, -- 0-9
  description text not null, -- 每页分镜文字
  created_at timestamptz default now()
);

5. pages
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  page_index int not null,
  image_url text,
  status text default 'pending', -- pending / generating / done / error
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


可以加 RLS：project.user_id = auth.uid() 保证用户只能访问自己的项目。

四、API 设计（Next.js app/api）

这是给 AI 写接口/服务端代码用的“接口清单”，你只要把每个接口丢给工具，让它照着写即可。

1. 项目
POST /api/projects

入参：{ title: string, characterDescription: string, referenceImageUrl?: string }

出参：{ projectId: string }

功能：

创建 project

创建初始 character 记录（尚未生成角色卡）

GET /api/projects

返回当前用户所有项目列表

GET /api/projects/[id]

返回项目详情 + 角色 + storyboards 简要状态

2. 角色生成
POST /api/projects/[id]/character/generate

入参：无（后端读取 characters.description + reference_image_url）

后端逻辑：

调用 AI 图像模型：生成 4–6 张角色姿态图

上传到 Supabase Storage

更新 characters.images

出参：{ images: string[] }

3. 故事 & 分镜
POST /api/projects/[id]/story/generate-storyboard

入参：{ story: string }

后端逻辑：

调用 LLM：将故事拆成 10 条 JSON 分镜

写入/覆盖 storyboards 表

出参：

{
  "storyboards": [
    { "pageIndex": 0, "description": "..." },
    ...
  ]
}

PUT /api/projects/[id]/storyboards/[storyboardId]

用于用户手动修改某页分镜文本

4. 绘本页面生成
POST /api/projects/[id]/pages/generate-all

入参：无

后端逻辑：

查询 10 条 storyboards

对每条调用图像生成 API（内部可以并发队列）

上传图片到 Storage

更新 pages 表中 image_url + status

出参：10 页的状态

POST /api/projects/[id]/pages/[pageIndex]/regenerate

入参：无

后端逻辑：重新根据对应分镜生成该页图片

GET /api/projects/[id]/pages

返回 10 页 pages + storyboards 合并后的数据结构，给前端展示：

[
  { "pageIndex": 0, "imageUrl": "...", "description": "..." },
  ...
]

5. 导出
GET /api/projects/[id]/export/png

后端逻辑：

打包 /pages 中已生成的图片 URL → 下载 zip（或返回打包后的 URL）

GET /api/projects/[id]/export/pdf

后端逻辑：

使用 pdf-lib 或类似库，将 10 张图片 + 文案排版成 PDF

返回 application/pdf 流或下载链接

五、前端组件拆分

建议组件目录结构（app/components/...）：

components/layout/

AppLayout.tsx（带顶部导航、主内容区域）

AuthLayout.tsx

components/ui/

Button.tsx

Input.tsx

Textarea.tsx

Card.tsx

PageSpinner.tsx

StepIndicator.tsx（多步骤引导）

components/projects/

ProjectCard.tsx

ProjectList.tsx

components/character/

CharacterForm.tsx

CharacterPreviewGrid.tsx

components/story/

StoryInputForm.tsx

StoryboardList.tsx

components/pages/

PageThumbnail.tsx

PagePreview.tsx

PageGrid.tsx

六、开发节点 / 任务拆解（给 AI 工具执行用）
🧩 节点 0：项目初始化

任务（可给 AI）：

使用 create-next-app 创建 Next.js 14 + TypeScript 项目

安装 TailwindCSS 并配置

安装 @supabase/supabase-js

创建 .env 读取 Supabase URL & KEY

建立 lib/supabaseClient.ts

🧩 节点 1：Auth & Layout

任务：

配置 Supabase Auth（邮件 + 密码）

建立 auth context / hooks（例如 useSupabaseAuth）

实现：

/auth/login

/auth/signup

成功后重定向 /dashboard

建立通用布局：

AppLayout（导航栏：logo + “我的绘本” + 用户信息）

未登录访问受保护页 → 重定向 /auth/login

🧩 节点 2：Dashboard & 创建项目

任务：

/dashboard 页面：

拉取用户 projects

显示项目卡片

POST /api/projects 接口实现：

创建 project

创建初始 character 记录

/projects/new：

表单：项目标题 + 角色描述 + 可选图片上传

提交调用 /api/projects

跳转到 /projects/[id]/character

🧩 节点 3：角色生成模块

任务：

搭 /projects/[id]/character 页面：

显示角色描述

按钮「生成角色卡」

调用 /api/projects/[id]/character/generate

在接口中：

虚拟/占位调用 AI（先返回几张固定占位图 URL，后续替换为真实调用）

把 URL 存到 characters.images

前端展示角色卡 CharacterPreviewGrid

🧩 节点 4：故事与分镜模块

任务：

/projects/[id]/story 页面：

文本框输入故事

按钮「生成 10 页分镜」

接口 /api/projects/[id]/story/generate-storyboard：

先 mock：用固定模板拆 10 条（之后换 LLM 调用）

写入 storyboards

前端 StoryboardList：

显示 10 条分镜

每一条可编辑 + 保存（调用 PUT /api/...）

🧩 节点 5：绘本页面生成模块

任务：

/projects/[id]/pages 页面：

左侧：页码列表

右侧：当前页大图 + 描述

接口 /api/projects/[id]/pages/generate-all：

遍历 10 条 storyboards

生成图片（可先 mock）

存至 pages 表 + Storage

单页重生成：

POST /api/projects/[id]/pages/[pageIndex]/regenerate

加 loading & 状态提示

🧩 节点 6：导出模块

任务：

/projects/[id]/export 页面

显示缩略图 + 描述

按钮：导出 PNG / 导出 PDF

/api/projects/[id]/export/png

从 Storage 拉取所有图片 URL

打包 zip（可以先返回图片数组，后续再真打包）

/api/projects/[id]/export/pdf

读取图片、文字

使用 PDF 库生成简单排版 PDF

🧩 节点 7：样式与体验优化

任务：

应用 Tailwind 设计：

宽屏三栏 / 双栏布局

卡片式 UI

步骤指示器（角色 → 故事 → 页面 → 导出）

添加 Loading 状态、错误提示、空状态

手机端基础适配

