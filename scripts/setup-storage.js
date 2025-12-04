#!/usr/bin/env node

/**
 * Supabase Storage 初始化脚本
 * 用于创建和配置图片存储桶
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// 存储桶配置
const BUCKET_NAME = 'story-images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

async function setupStorage() {
  console.log('🚀 开始初始化 Supabase Storage...')

  // 检查环境变量
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ 缺少必要的环境变量:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('请确保在 .env.local 文件中正确配置这些变量。')
    process.exit(1)
  }

  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    // 1. 检查现有的存储桶
    console.log('📋 检查现有存储桶...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ 获取存储桶列表失败:', listError)
      throw listError
    }

    const existingBucket = buckets?.find(bucket => bucket.name === BUCKET_NAME)

    if (existingBucket) {
      console.log(`✅ 存储桶 "${BUCKET_NAME}" 已存在`)
      console.log(`   - ID: ${existingBucket.id}`)
      console.log(`   - 公开访问: ${existingBucket.public}`)
      console.log(`   - 文件大小限制: ${existingBucket.file_size_limit} bytes`)
    } else {
      // 2. 创建新的存储桶
      console.log(`📦 创建存储桶 "${BUCKET_NAME}"...`)
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(
        BUCKET_NAME,
        {
          public: true, // 允许公开访问
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: MAX_FILE_SIZE
        }
      )

      if (createError) {
        console.error('❌ 创建存储桶失败:', createError)
        throw createError
      }

      console.log(`✅ 存储桶创建成功!`)
      console.log(`   - 名称: ${newBucket?.name || BUCKET_NAME}`)
      console.log(`   - 公开访问: 是`)
      console.log(`   - 文件大小限制: ${MAX_FILE_SIZE} bytes (${MAX_FILE_SIZE / 1024 / 1024}MB)`)
    }

    // 3. 创建存储桶策略（如果需要）
    console.log('🔐 配置存储桶访问策略...')
    try {
      // 尝试创建一个测试文件来验证公共访问权限
      const testFileName = 'setup-test.txt'
      const testContent = 'This is a test file to verify public access.'

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(testFileName, new TextEncoder().encode(testContent), {
          upsert: true
        })

      if (uploadError) {
        console.warn('⚠️ 测试文件上传失败:', uploadError.message)
      } else {
        // 获取公共 URL 来验证访问权限
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(testFileName)

        console.log(`✅ 公共访问验证成功`)
        console.log(`   - 测试文件URL: ${publicUrl}`)

        // 清理测试文件
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([testFileName])

        console.log('🧹 清理测试文件完成')
      }
    } catch (policyError) {
      console.warn('⚠️ 配置访问策略时出现警告:', policyError.message)
      console.log('   请手动在 Supabase Dashboard 中配置存储桶的公共访问权限')
    }

    // 4. 创建目录结构
    console.log('📁 创建目录结构...')
    const directories = [
      'generated',
      'characters',
      'story-pages',
      'exports',
      'temp'
    ]

    for (const dir of directories) {
      try {
        // 创建一个空的 .gitkeep 文件来初始化目录
        const { error: dirError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(`${dir}/.gitkeep`, new TextEncoder().encode(''), {
            upsert: true
          })

        if (dirError) {
          console.warn(`⚠️ 创建目录 ${dir} 失败:`, dirError.message)
        } else {
          console.log(`✅ 目录 ${dir}/ 创建成功`)
        }
      } catch (dirError) {
        console.warn(`⚠️ 创建目录 ${dir} 时出现异常:`, dirError.message)
      }
    }

    // 5. 显示存储桶信息
    console.log('\n📊 存储桶配置信息:')
    console.log('='.repeat(50))
    console.log(`🪣 存储桶名称: ${BUCKET_NAME}`)
    console.log(`🌐 公开访问: 是`)
    console.log(`📏 文件大小限制: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    console.log(`📂 目录结构:`)
    directories.forEach(dir => {
      console.log(`   - ${dir}/`)
    })
    console.log('\n🔗 存储桶URL格式:')
    console.log(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/[文件路径]`)

    console.log('\n✅ Supabase Storage 初始化完成!')
    console.log('🎉 你现在可以使用图片上传和存储功能了。')

  } catch (error) {
    console.error('\n❌ 初始化过程中发生错误:')
    console.error(error.message || error)

    console.log('\n🔧 故障排除建议:')
    console.log('1. 检查 Supabase URL 和 API 密钥是否正确')
    console.log('2. 确认你的 Supabase 账户有创建存储桶的权限')
    console.log('3. 检查网络连接是否正常')
    console.log('4. 手动在 Supabase Dashboard 中创建存储桶')

    process.exit(1)
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
📚 Supabase Storage 初始化脚本

用法:
  node scripts/setup-storage.js [选项]

选项:
  --help, -h     显示帮助信息

功能:
  - 自动创建故事图片存储桶 (${BUCKET_NAME})
  - 配置公共访问权限
  - 创建目录结构
  - 验证访问权限

环境变量:
  - NEXT_PUBLIC_SUPABASE_URL: Supabase 项目 URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase 匿名访问密钥

注意:
  - 确保在 .env.local 文件中配置了正确的环境变量
  - 确保 Supabase 账户有创建存储桶的权限
  - 如果创建失败，可以手动在 Supabase Dashboard 中创建存储桶
`)
}

// 解析命令行参数
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  showHelp()
  process.exit(0)
}

// 运行初始化
setupStorage().catch(error => {
  console.error('💥 脚本执行失败:', error)
  process.exit(1)
})