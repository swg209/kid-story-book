# 大香蕉(Nano Banana) API 配置指南

## 🔧 当前问题诊断

根据测试结果，出现了 `401 Unauthorized` 错误，表明API认证失败。可能的原因：

1. **API密钥无效或过期**
2. **API端点地址不正确**
3. **模型名称或权限配置问题**

## 🛠️ 解决方案

### 方案1: 获取有效的API密钥

1. **访问官方文档**：
   - 打开：https://docs.nanobananaapi.ai/nanobanana-api/generate-image-pro
   - 注册账户并获取API密钥

2. **更新环境变量**：
   ```bash
   # 编辑 .env.local 文件
   NANO_BANANA_API_KEY=你的新密钥
   ```

### 方案2: 使用其他生图API

如果大香蕉API暂时不可用，可以考虑其他选择：

#### 选项A: 使用 fal.ai 官方API
```bash
# 在 .env.local 中设置
FAL_KEY=你的fal_ai密钥
```

#### 选项B: 使用 OpenAI DALL-E
```bash
# 在 .env.local 中设置
OPENAI_API_KEY=你的openai密钥
```

## 🔍 当前状态

### ✅ 已完成
- API调用代码已正确实现
- 错误处理和降级机制已配置
- 多端点尝试逻辑已添加
- 占位符图片生成已实现

### ⚠️ 需要配置
- 有效的API密钥（当前密钥返回401错误）
- 可能需要更新API端点或模型名称

## 🚀 测试步骤

1. **获取API密钥**：
   ```bash
   # 设置新的API密钥
   echo "NANO_BANANA_API_KEY=你的新密钥" >> .env.local
   ```

2. **重启开发服务器**：
   ```bash
   npm run dev
   ```

3. **测试生图功能**：
   - 创建新项目
   - 添加角色描述
   - 点击生成角色卡
   - 查看控制台日志

## 📋 调试信息

### 当前配置检查
```bash
# 查看当前环境变量
cat .env.local | grep NANO_BANANA

# 测试API连接
node test-nanobanana.js
```

### 日志输出说明
- `🎨 尝试调用大香蕉生图API` - 开始调用
- `⚠️ 端点调用失败` - 特定端点失败
- `🔄 降级为占位符图片模式` - 使用占位符图片
- `✅ 大香蕉生图API调用成功` - 成功生成图片

## 🆘 故障排除

### 如果仍然出现401错误：
1. **确认API密钥格式**：确保没有多余的空格或引号
2. **检查账户状态**：确认账户余额和权限
3. **验证模型可用性**：确认模型在您的地区可用

### 临时解决方案：
- 系统已配置自动降级到占位符图片
- 可以继续使用其他功能进行测试
- 生图功能会在API密钥修复后自动恢复

## 📞 支持资源

- **大香蕉API文档**：https://docs.nanobananaapi.ai/cn/nanobanana-api/generate-image-pro
- **fal.ai文档**：https://fal.ai/docs
- **项目Issues**：在项目仓库中报告问题