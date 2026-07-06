import Link from "next/link";
import { ArrowUpRight, Boxes } from "lucide-react";
import { HOME_NAV_ITEMS } from "@/lib/catalog/constants";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#7dd3fc)] text-white shadow-[0_18px_40px_-28px_rgba(37,99,235,0.9)]">
            <Boxes className="h-5 w-5" />
          </span>
          <span className="space-y-0.5">
            <span className="block text-lg font-black tracking-tight text-slate-950">
              AI Skill Hub
            </span>
            <span className="block text-xs text-slate-500">
              精选高质量 AI Agent 技能目录
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {HOME_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://github.com/sickn33/antigravity-awesome-skills"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          GitHub 热门来源
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
