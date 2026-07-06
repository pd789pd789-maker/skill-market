import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Skill Hub",
  description:
    "中文优先的 AI Agent Skill 精选目录站，聚合 Codex、Claude、Cursor、Gemini 的高质量可下载技能。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
