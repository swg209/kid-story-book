# Supabase Storage 图片存储指南

本指南介绍如何使用和配置项目中的 Supabase Storage 图片存储功能。

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [API 接口](#api-接口)
- [存储结构](#存储结构)
- [故障排除](#故障排除)

## 🎯 概述

本项目使用 Supabase Storage 来替代之前的 Base64 图片存储方式，提供更高效、可扩展的图片管理解决方案。

### 优势对比

| 特性 | Base64 存储 | Supabase Storage |
|------|-------------|-----------------|
| 存储效率 | 低 (增加 33% 大小) | 高 (原生文件) |
| 数据库性能 | 差 (查询缓慢) | 好 (仅存储 URL) |
| 缓存支持 | 无 | 支持 (HTTP 缓存) |
| 文件大小限制 | 严格 | 灵活 (10MB) |
| CDN 支持 | 无 | 支持 |
| 成本 | 数据库成本高 | 存储成本低 |

## ⚡ 功能特性

### 🎨 图片生成与上传
- **自动上传**: 生成的图片自动上传到 Supabase Storage
- **批量处理**: 支持批量生成和上传多张图片
- **智能回退**: 上传失败时自动使用备用方案

### 📁 目录管理
- **分类存储**: 按用途分类存储图片
- **智能命名**: 自动生成唯一文件名
- **路径管理**: 灵活的路径配置

### 🔧 存储桶功能
- **自动创建**: 首次使用时自动创建存储桶
- **权限配置**: 自动配置公共访问权限
- **安全策略**: 支持文件类型和大小限制

## 🚀 快速开始

### 1. 环境配置

在 `.env.local` 文件中配置必要的环境变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 图像生成 API
GEMINI_API_KEY=your-gemini-key-here
```

### 2. 初始化存储

运行存储初始化脚本：

```bash
# 方法 1: 使用 npm 脚本
npm run setup-storage

# 方法 2: 直接运行脚本
node scripts/setup-storage.js
```

### 3. 验证配置

检查存储状态：

```bash
curl "http://localhost:3000/api/storage/status"
```

## 🔌 API 接口

### 1. 图片生成接口

#### 生成单张图片
```typescript
import { generateImage } from '@/lib/imageGeneration'

const images = await generateImage({
  prompt: '可爱的小兔子在花园里玩耍',
  width: 1024,
  height: 1024,
  count: 1
})

console.log(images[0]) // 返回 Supabase Storage 的公共 URL
```

#### 生成角色图片
```typescript
import { generateCharacterImage } from '@/lib/imageGeneration'

const characterImages = await generateCharacterImage(
  '一只穿着蓝色背带裤的小熊'
)
```

#### 生成故事页面图片
```typescript
import { generatePageImages } from '@/lib/imageGeneration'

const storyboards = [
  { description: '小兔子在森林里迷路了', page_index: 0 },
  { description: '小兔子遇到了聪明的猫头鹰', page_index: 1 }
]

const pageImages = await generatePageImages(storyboards)
```

### 2. 存储管理接口

#### 检查存储状态
```bash
GET /api/storage/status
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "configured": true,
    "bucketCreated": true,
    "bucketName": "story-images",
    "bucketExists": true,
    "bucketDetails": {
      "id": "bucket-uuid",
      "name": "story-images",
      "public": true,
      "fileSizeLimit": 10485760
    }
  }
}
```

#### 删除图片
```bash
POST /api/storage/delete
Content-Type: application/json

{
  "imageUrl": "https://your-project.supabase.co/storage/v1/object/public/story-images/generated/image.jpg"
}
```

### 3. 存储工具函数

#### 手动上传图片
```typescript
import { uploadImageFromBase64 } from '@/lib/storage'

const result = await uploadImageFromBase64(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  'my-image.png',
  'custom-folder'
)

if (result.success) {
  console.log('图片URL:', result.data)
}
```

#### 删除图片
```typescript
import { deleteImage } from '@/lib/storage'

const result = await deleteImage(
  'https://your-project.supabase.co/storage/v1/object/public/story-images/generated/image.jpg'
)
```

#### 批量上传
```typescript
import { uploadMultipleImages } from '@/lib/storage'

const images = [
  'data:image/png;base64,image1...',
  'data:image/png;base64,image2...'
]

const results = await uploadMultipleImages(
  images,
  'batch-upload',
  'temp'
)
```

## 📂 存储结构

### 目录组织

```
story-images/
├── generated/          # 通用生成的图片
│   ├── 1699999999_abc123_prompt.png
│   └── 1700000000_def456_character.png
├── characters/         # 角色图片
│   ├── character_angle_1.jpg
│   ├── character_angle_2.jpg
│   └── ...
├── story-pages/        # 故事页面插图
│   ├── page_1.jpg
│   ├── page_2.jpg
│   └── ...
├── exports/           # 导出的图片
│   ├── story_export.pdf
│   └── album_export.zip
└── temp/              # 临时图片文件
    └── .gitkeep
```

### 文件命名规则

- **格式**: `{timestamp}_{randomSuffix}_{originalName}`
- **示例**: `1700000000_abc123_cute_rabbit.png`
- **唯一性**: 时间戳 + 随机后缀确保文件名唯一
- **可读性**: 保留原始名称的可读部分

### URL 格式

```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/story-images/[PATH]/[FILENAME]
```

**示例:**
```
https://your-project.supabase.co/storage/v1/object/public/story-images/characters/1700000000_abc123_character_angle_1.jpg
```

## 🔧 故障排除

### 常见问题

#### 1. 存储桶创建失败

**错误信息:**
```
❌ 创建存储桶失败: insufficient_permission
```

**解决方案:**
- 检查 Supabase 账户权限
- 手动在 Supabase Dashboard 中创建存储桶
- 确认 API 密钥具有足够的权限

#### 2. 图片上传失败

**错误信息:**
```
❌ 图片上传失败: File size exceeds limit
```

**解决方案:**
- 检查图片文件大小 (限制: 10MB)
- 压缩图片后再上传
- 调整存储桶的文件大小限制

#### 3. 公共访问权限问题

**错误信息:**
```
403 Forbidden: Public access disabled
```

**解决方案:**
- 在 Supabase Dashboard 中设置存储桶为公开
- 运行 `npm run setup-storage` 重新配置
- 检查存储桶的访问策略

#### 4. API 密钥配置错误

**错误信息:**
```
❌ 获取存储桶列表失败: Invalid API key
```

**解决方案:**
- 检查 `.env.local` 文件中的配置
- 确认 Supabase URL 和密钥正确
- 重新生成 API 密钥

### 调试技巧

#### 1. 检查环境变量
```bash
# 检查当前配置
echo "SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "SUPABASE_KEY: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

#### 2. 测试存储连接
```javascript
// 在浏览器控制台中测试
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(url, key)

supabase.storage.listBuckets().then(console.log)
```

#### 3. 查看详细日志
```bash
# 启动开发服务器并查看日志
npm run dev

# 查看存储相关日志
grep "storage" .next/server.log
```

### 性能优化

#### 1. 图片压缩
```typescript
// 在上传前压缩图片
function compressImage(base64String: string, quality: number = 0.8): string {
  // 实现图片压缩逻辑
  return compressedBase64
}
```

#### 2. 缓存策略
```typescript
// 设置缓存头
const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}?t=${timestamp}`
```

#### 3. CDN 配置
```typescript
// 使用 CDN 加速图片访问
const cdnUrl = imageUrl.replace(
  'supabase.co/storage/v1/object/public',
  'your-cdn-domain.com'
)
```

## 📚 参考资料

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Gemini Imagen API 文档](https://ai.google.dev/gemini-api/docs/vision#imagen)
- [Next.js 文件上传指南](https://nextjs.org/docs/api-routes/file-uploads)

## 🆘 获取帮助

如果遇到问题：

1. 查看 [GitHub Issues](https://github.com/your-repo/issues)
2. 阅读 [Supabase 文档](https://supabase.com/docs)
3. 联系项目维护者

---

**最后更新**: 2024年12月
**版本**: 1.0.0