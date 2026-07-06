import Link from "next/link";
import { AppHeader } from "@/components/catalog/app-header";

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.16)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            Skill Atlas
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
            没找到这个页面
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            这个 skill 或合集可能已经下线，或者 slug 已变化。
          </p>
          <Link
            href="/skills"
            className="mt-8 inline-flex items-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            回到技能目录
          </Link>
        </div>
      </main>
    </>
  );
}
