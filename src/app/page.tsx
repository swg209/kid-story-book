"use client";

import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";

export default function HomePage() {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fairytale-background">
        <div className="text-fairytale-primary text-3xl font-cartoon animate-bounce-cartoon">
          🎨 加载中... 🎨
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* === 装饰背景元素 (已在 globals.css 修复动画和形状) === */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-fairytale-secondary/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-fairytale-primary/40 rounded-full blur-3xl animate-float delay-700"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-fairytale-accent/30 rounded-blob animate-wiggle"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-fairytale-warning/30 rounded-bubble animate-pulse-cartoon"></div>

        <div className="text-center max-w-5xl relative z-10">
          {/* 大标题：使用 standard tailwind text classes 代替 custom classes */}
          <h1 className="text-5xl md:text-7xl font-cartoon text-fairytale-text mb-8 rainbow-text animate-float leading-tight p-2">
            ✨ AI{" "}
            <span className="text-fairytale-primary inline-block transform hover:scale-110 transition-transform">
              儿童绘本
            </span>{" "}
            生成器 ✨
          </h1>

          <div className="text-xl md:text-2xl text-gray-700 mb-12 font-playful leading-loose">
            🎨 让不会画画的家长/老师，也能用 AI 一键生成 🎨
            <br />
            {/* 标签组：增加间距，手机端自动换行 */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <span className="bg-fairytale-secondary/40 px-4 py-2 rounded-full text-fairytale-text font-cartoon shadow-sm transform hover:rotate-2 transition-transform">
                🌟 角色一致 🌟
              </span>
              <span className="bg-fairytale-accent/40 px-4 py-2 rounded-full text-fairytale-text font-cartoon shadow-sm transform hover:-rotate-2 transition-transform">
                📖 故事连贯 📖
              </span>
              <span className="bg-fairytale-primary/40 px-4 py-2 rounded-full text-white font-cartoon shadow-sm transform hover:rotate-1 transition-transform">
                📚 10页成套插图 📚
              </span>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-0 sm:space-x-8 sm:flex sm:justify-center">
            {user ? (
              <Link
                href="/dashboard"
                // 这里的类名已经在 globals.css 定义好了
                className="cartoon-button bg-linear-to-r from-fairytale-primary to-fairytale-purple"
              >
                📚 我的绘本 📚
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="cartoon-button bg-linear-to-r from-fairytale-primary to-fairytale-orange"
                >
                  ✨ 开始创作 ✨
                </Link>
                <Link
                  href="/auth/login"
                  // 这里的类名已经在 globals.css 定义好了
                  className="cartoon-button-white"
                >
                  🔑 登录 🔑
                </Link>
              </>
            )}
          </div>
        </div>

        {/* === 功能卡片区 === */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full pb-20">
          {/* 卡片 1 */}
          <div className="cartoon-card text-center p-10 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:-rotate-1">
            <div className="text-6xl mb-6 animate-wiggle">🎨</div>
            <h3 className="text-2xl font-cartoon mb-4 text-fairytale-text font-bold">
              🌈 角色一致 🌈
            </h3>
            <p className="text-lg text-gray-600 font-playful leading-relaxed">
              AI 确保主角在整个绘本中保持一致的外观，就像魔法一样！✨
            </p>
          </div>

          {/* 卡片 2 */}
          <div className="cartoon-card text-center p-10 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:rotate-1 border-fairytale-accent">
            <div className="text-6xl mb-6 animate-bounce-cartoon">📖</div>
            <h3 className="text-2xl font-cartoon mb-4 text-fairytale-text font-bold">
              📚 故事连贯 📚
            </h3>
            <p className="text-lg text-gray-600 font-playful leading-relaxed">
              自动拆分故事为 10 页连贯的分镜，让故事娓娓道来。🎭
            </p>
          </div>

          {/* 卡片 3 */}
          <div className="cartoon-card text-center p-10 bg-white/80 backdrop-blur-sm transform hover:scale-105 hover:rotate-1 border-fairytale-primary">
            <div className="text-6xl mb-6 animate-pulse-cartoon">⚡</div>
            <h3 className="text-2xl font-cartoon mb-4 text-fairytale-text font-bold">
              🚀 一键生成 🚀
            </h3>
            <p className="text-lg text-gray-600 font-playful leading-relaxed">
              完整的绘本插图，支持导出 PNG 和 PDF，分享你的创作！🎉
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
