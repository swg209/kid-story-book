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

## 📚 样例绘本：《不要乱扔东西》

### 主题：生活习惯教育（适合3岁儿童）

**故事目标**：培养小朋友养成不乱扔东西，物归原处的好习惯。

#### 角色设计

**小兔子奇奇**：
- 一只活泼可爱的白色小兔子，有着长长的耳朵
- 穿着红色的小背心，蓝色短裤
- 性格：活泼但有点小马虎，喜欢玩玩具但经常忘记收拾

#### 完整故事文本

```
小兔子奇奇有一个漂亮的房间，里面有各种各样的玩具。
奇奇最喜欢玩他的积木和汽车，每天都玩得特别开心。
玩完玩具后，奇奇就把积木扔在地板上，汽车推到床底下。
房间越来越乱，妈妈看到后皱起了眉头。
妈妈温柔地对奇奇说："宝贝，玩具们也要回家睡觉哦。"
奇奇问妈妈："玩具的家在哪里呢？"
妈妈指着玩具箱说："看，那就是玩具们的温暖小家。"
奇奇听了妈妈的话，开始认真地收拾玩具。
把积木一块一块放回玩具箱，汽车也整齐地排好队。
奇奇的房间变得又干净又整齐，玩具们都很开心。
从那天起，奇奇每天都会把玩具送回它们的家。
妈妈抱着奇奇说："你真是妈妈的好孩子！"
奇奇开心地笑了，现在他特别喜欢整洁的房间。
```

#### 10页分镜内容

1. **第1页**：小兔子奇奇坐在地板上，周围堆满了各种玩具（积木、汽车、娃娃），他开心地笑着
2. **第2页**：奇奇正在专注地搭建积木，表情认真又快乐，房间背景整洁明亮
3. **第3页**：奇奇把玩完的积木随手扔在地板上，玩具汽车被推到床底下，房间开始变乱
4. **第4页**：奇奇躺在地板上，周围散落着各种玩具，他玩累了在打哈欠
5. **第5页**：兔妈妈走进房间，看到满地玩具，温柔但略带担忧地看着奇奇
6. **第6页**：兔妈妈蹲下来，指着房间角落的彩色玩具箱，对奇奇说着什么
7. **第7页**：奇奇好奇地看着玩具箱，耳朵竖起来认真听妈妈解释
8. **第8页**：奇奇开始收拾玩具，把积木小心地放回玩具箱，动作认真
9. **第9页**：整洁的房间，所有玩具都在玩具箱里整齐排列，奇奇站在一旁拍手
10. **第10页**：兔妈妈抱着奇奇，两人一起看着干净的房间，奇奇脸上露出自豪的笑容

#### 生图提示词优化

每页的AI生图提示词会结合：
- 角色特征：白色小兔子，红色小背心，蓝色短裤，长耳朵
- 场景描述：明亮温馨的儿童房间，彩色玩具，暖色调
- 情感表达：根据每页故事情节调整角色表情和动作
- 绘本风格：适合3岁儿童的简洁色彩，线条圆润，画面温馨

#### 教育重点

- **行为示范**：展示从乱扔玩具到主动收拾的转变过程
- **情感引导**：通过妈妈的温柔引导，而非责备
- **成就感培养**：收拾整洁后的满足感和自豪感
- **习惯养成**：强调"物归原处"的日常习惯

#### 适合年龄特点

- **语言简单**：短句结构，重复词汇，便于理解
- **画面清晰**：主体明确，背景不复杂，颜色鲜明
- **情节连贯**：线性叙事，因果明确
- **情感积极**：温馨鼓励，避免负面情绪

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

---

## 七、用户使用手册

### 🎯 产品概述
AI儿童绘本生成器是一个让不会画画的家长/老师，也能用AI一键生成角色一致+故事连贯+10页成套插图的儿童绘本生成工具。

### 👨‍👩‍👧‍👦 目标用户
- **家长**：为孩子创作个性化故事绘本
- **老师**：制作教学辅助材料
- **教育工作者**：创作定制化教学资源

### 🚀 快速开始指南

#### 步骤1：注册/登录账户
1. 访问网站首页：`http://localhost:3000`
2. 点击"开始创作 ✨"按钮
3. 填写邮箱地址和密码进行注册
4. 注册成功后会自动登录并跳转到仪表板

**登录方式**：
- 使用邮箱和密码登录
- 系统会记住登录状态，下次访问无需重新登录

#### 步骤2：创建第一个绘本项目
1. 在仪表板中点击"新建绘本"按钮
2. 填写**项目标题**：例如"小兔子的冒险故事"
3. 填写**角色描述**：详细描述主角的特征
   ```
   示例：一只可爱的小兔子，有着长长的耳朵，穿着蓝色的小背心，性格勇敢善良
   ```
4. （可选）上传**参考图片**：帮助AI更好地理解角色外观
5. 点击"🎉 注册"完成项目创建

#### 步骤3：生成角色设计
1. 系统会自动跳转到角色生成页面
2. 查看自动生成的角色描述
3. 点击"生成角色卡"按钮
4. 等待AI生成4-6张不同姿势的角色图片
5. 查看生成结果，如不满意可重新生成
6. 点击"下一步：编写故事"继续

#### 步骤4：编写故事和分镜
1. 在故事页面输入完整的故事内容
   ```
   示例：从前有只小兔子，它住在大森林里。有一天，小兔子决定去探险...
   ```
2. 点击"生成10页分镜"按钮
3. AI会自动将故事拆分成10个连贯的场景
4. 查看生成的分镜，可以对每页文案进行微调
5. 调整完成后点击"下一步：生成绘本插图"

#### 步骤5：生成绘本插图
1. 进入插图生成页面
2. 点击"生成整套绘本"按钮开始生成10页插图
3. 等待AI根据分镜内容生成对应的图片
4. 查看生成的10页绘本插图
5. 如某页不满意，可以点击"重生成此页"单独修改
6. 所有页面满意后，进入下一步导出

#### 步骤6：导出绘本
1. 在导出页面预览完整的10页绘本
2. 选择导出格式：
   - **PNG格式**：适合打印或单独使用图片
   - **PDF格式**：完整的电子绘本，方便分享
3. 点击对应按钮开始导出
4. 等待下载完成，保存到本地设备

### 📋 详细功能说明

#### 项目管理
- **我的绘本列表**：在仪表板查看所有创建的绘本项目
- **项目状态**：显示每个项目的创建时间和当前进度
- **快速访问**：点击项目卡片直接进入编辑

#### 角色设计
- **智能角色生成**：基于文字描述生成一致的角色形象
- **多姿态展示**：生成4-6张不同动作和表情的角色图片
- **参考图片上传**：支持上传参考图提高生成准确性
- **重新生成**：不满意可以无限次重新生成

#### 故事创作
- **智能分镜**：AI自动将长故事拆分成10个合理场景
- **文案编辑**：支持手动修改每页的分镜描述
- **连贯性保证**：确保故事前后逻辑连贯

#### 插图生成
- **批量生成**：一键生成全套10页插图
- **单页重生成**：支持对特定页面单独重新生成
- **风格一致**：保证所有插图的风格和角色一致性

#### 导出功能
- **PNG格式**：高质量图片，适合打印
- **PDF格式**：完整的绘本文件，包含图片和文字
- **分享便利**：生成的文件可以轻松分享给家人朋友

### 💡 使用技巧

#### 角色描述写作建议
- **详细具体**：描述角色的外貌特征、性格特点
- **包含细节**：服装、配饰、动作姿态等
- **情感特征**：描述角色的性格和表情特点

#### 故事创作建议
- **适合儿童**：内容积极向上，语言简单易懂
- **情节完整**：有开始、发展、高潮、结局
- **教育意义**：包含正面价值观和人生道理

#### 获得最佳效果
- **角色一致性**：在分镜中保持角色特征描述一致
- **场景丰富**：提供多样化的场景描述
- **情感表达**：描述角色的情感变化和表情

### ⚠️ 注意事项

#### 数据安全
- 所有绘本项目保存在个人账户中
- 请勿忘记密码，系统暂不支持密码找回
- 建议定期导出重要的作品到本地

#### 使用限制
- 需要网络连接才能使用AI生成功能
- 大量图片生成可能需要等待较长时间
- 建议在稳定网络环境下使用

#### 内容规范
- 请创作适合儿童的积极内容
- 避免包含暴力、恐怖等不当内容
- 尊重知识产权，避免抄袭他人作品

### 🔧 常见问题解答

**Q: 如何修改已创建的角色？**
A: 在项目详情页面的角色设计页面，可以重新生成角色卡，或修改角色描述后重新生成。

**Q: 生成的图片不满意怎么办？**
A: 可以单独点击"重生成此页"按钮重新生成特定页面，也可以修改分镜描述后再生成。

**Q: 如何删除不需要的项目？**
A: 目前删除功能正在开发中，可以通过创建新项目的方式进行管理。

**Q: 可以将绘本分享给其他人吗？**
A: 可以通过导出PDF或PNG文件，将生成的绘本分享给家人朋友。

**Q: 系统支持哪些浏览器？**
A: 推荐使用Chrome、Firefox、Safari等现代浏览器，获得最佳使用体验。

### 📞 技术支持

如遇到技术问题或使用疑问，请：
1. 检查网络连接是否正常
2. 尝试刷新页面重新操作
3. 清除浏览器缓存后重试
4. 联系技术支持团队

---

*本用户手册将随着产品功能更新持续完善，请关注最新版本。*

