import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Layers3, Star } from "lucide-react";
import { AppHeader } from "@/components/catalog/app-header";
import { PlatformBadge } from "@/components/catalog/platform-badge";
import { StaleBanner } from "@/components/catalog/stale-banner";
import {
  getCatalog,
  getCatalogMeta,
  getCollectionEntry,
  getCollectionMembers,
} from "@/lib/catalog/load-catalog";
import { formatCompactNumber, formatRelativeDate } from "@/lib/catalog/normalize";

export function generateStaticParams() {
  return getCatalog()
    .filter((entry) => entry.kind === "collection")
    .map((entry) => ({ slug: entry.slug }));
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionEntry(slug);
  if (!collection) {
    notFound();
  }

  const members = getCollectionMembers(collection.sourceRepo);
  const meta = getCatalogMeta();

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {meta.stale && meta.warning ? <StaleBanner message={meta.warning} /> : null}

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.16)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  <Layers3 className="h-3.5 w-3.5" />
                  合集 / 来源仓库
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950">
                  {collection.title}
                </h1>
                <p className="text-lg leading-8 text-slate-600">
                  {collection.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {collection.platforms.map((platform) => (
                    <PlatformBadge key={platform} platform={platform} />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-500">合集概览</p>
                <div className="mt-4 grid gap-3 text-sm">
                  <p className="font-semibold text-slate-900">
                    收录条目 {members.length.toLocaleString("zh-CN")}
                  </p>
                  <p className="font-semibold text-slate-900">
                    仓库热度 {formatCompactNumber(collection.stars)}
                  </p>
                  <p className="font-semibold text-slate-900">
                    最近更新 {formatRelativeDate(collection.updatedAt)}
                  </p>
                </div>
                <a
                  href={collection.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                >
                  查看 GitHub
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">收录条目</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  来自 {collection.sourceRepo}
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                <Star className="h-4 w-4 text-amber-500" />
                {formatCompactNumber(collection.stars)}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {members.slice(0, 18).map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/skills/${entry.slug}`}
                  className="rounded-[26px] border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_40px_-30px_rgba(37,99,235,0.6)]"
                >
                  <p className="text-xl font-bold tracking-tight text-slate-950">
                    {entry.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {entry.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.platforms.slice(0, 4).map((platform) => (
                      <PlatformBadge key={platform} platform={platform} muted />
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
