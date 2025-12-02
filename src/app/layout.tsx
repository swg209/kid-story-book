import type { Metadata } from "next";
// 1. 从 next/font 引入需要的字体
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";

// 2. 配置字体
// Nunito: 圆润清晰，适合正文阅读
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito", // 对应 globals.css 里的 var(--font-nunito)
  display: "swap",
});

// Fredoka: 胖乎乎的艺术字，适合标题和按钮
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka", // 对应 globals.css 里的 var(--font-fredoka)
  display: "swap",
});

export const metadata: Metadata = {
  title: "儿童绘本生成",
  description:
    "让不会画画的家长/老师，也能用 AI 一键生成角色一致 + 故事连贯的儿童绘本",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      {/* 3. 将字体变量添加到 body 的 className 中 */}
      <body className={`${nunito.variable} ${fredoka.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
