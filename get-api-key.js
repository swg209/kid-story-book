#!/usr/bin/env node

/**
 * 大香蕉API密钥获取指南脚本
 * 运行这个脚本来获取正确的API密钥配置
 */

console.log('🔑 大香蕉API密钥配置指南');
console.log('='.repeat(50));

console.log('\n📋 步骤1: 访问API密钥管理页面');
console.log('URL: https://docs.nanobananaapi.ai/nanobanana-api/generate-image-pro');

console.log('\n📋 步骤2: 注册账户并获取API密钥');
console.log('1. 点击 "Get API Key" 按钮');
console.log('2. 注册账户或登录');
console.log('3. 生成新的API密钥');

console.log('\n📋 步骤3: 配置环境变量');
console.log('复制以下命令，替换 YOUR_ACTUAL_API_KEY 为你的真实密钥:');
console.log('\necho "NANO_BANANA_API_KEY=YOUR_ACTUAL_API_KEY" >> .env.local\n');

console.log('\n📋 步骤4: 重启开发服务器');
console.log('npm run dev\n');

console.log('\n📋 步骤5: 测试API连接');
console.log('node test-nanobanana.js\n');

console.log('\n🔍 当前配置检查:');
console.log('API密钥长度:', process.env.NANO_BANANA_API_KEY?.length || 0, '字符');
console.log('API密钥前缀:', process.env.NANO_BANANA_API_KEY?.substring(0, 8) || '未设置');

console.log('\n💡 如果问题仍然存在，可能的原因:');
console.log('1. API密钥格式不正确');
console.log('2. 账户需要激活或充值');
console.log('3. 模型名称需要调整');
console.log('4. API端点地址可能有变化');

console.log('\n🆘 获取支持:');
console.log('- 官方文档: https://docs.nanobananaapi.ai');
console.log('- API密钥管理: 查看官方文档中的 "API Key Management Page"');
console.log('- 技术支持: 在API文档页面寻找联系方式');

console.log('\n✨ 系统已配置智能降级，即使API暂时不可用，也能使用占位符图片继续测试!');