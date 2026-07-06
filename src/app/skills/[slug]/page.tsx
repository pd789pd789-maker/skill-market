import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Download, GitBranch, Star } from "lucide-react";
import { AppHeader } from "@/components/catalog/app-header";
import { PlatformBadge } from "@/components/catalog/platform-badge";
import { StaleBanner } from "@/components/catalog/stale-banner";
import {
  INSTALL_METHOD_LABELS,
  OFFICIAL_STATUS_LABELS,
} from "@/lib/catalog/constants";
import {
  getCatalog,
  getCatalogMeta,
  getEntry,
  getRelatedEntries,
} from "@/lib/catalog/load-catalog";
import { formatCompactNumber, formatRelativeDate, mapTagToCategory } from "@/lib/catalog/normalize";

export function generateStaticParams() {
  return getCatalog()
    .filter((entry) => entry.kind !== "collection")
    .map((entry) => ({ slug: entry.slug }));
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry || entry.kind === "collection") {
    notFound();
  }

  const related = getRelatedEntries(entry);
  const meta = getCatalogMeta();

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {meta.stale && meta.warning ? <StaleBanner message={meta.warning} /> : null}

          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.16)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-5">
                <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {OFFICIAL_STATUS_LABELS[entry.officialStatus]}
                </div>
                <div className="space-y-3">
                  <h1 className="text-4xl font-black tracking-tight text-slate-950">
                    {entry.title}
                  </h1>
                  {entry.originalTitle ? (
                    <p className="text-sm font-medium text-slate-400">
                      原始名称: {entry.originalTitle}
                    </p>
                  ) : null}
                  <p className="text-lg leading-8 text-slate-600">{entry.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.platforms.map((platform) => (
                    <PlatformBadge key={platform} platform={platform} />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 lg:min-w-[360px] lg:grid-cols-1">
                <Metric title="来源仓库" value={entry.sourceRepo} />
                <Metric title="仓库热度" value={formatCompactNumber(entry.stars)} />
                <Metric title="最近更新" value={formatRelativeDate(entry.updatedAt)} />
                <Metric title="安装方式" value={entry.installMethods.length.toString()} />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={entry.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
              >
                <Download className="h-4 w-4" />
                下载 / 打开来源
              </a>
              <a
                href={entry.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                查看 GitHub
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <section className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">功能说明</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      这个 Skill 能做什么
                    </h2>
                  </div>
                </div>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  {entry.description ?? entry.summary}
                </p>
              </section>

              <section className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">安装方式</p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      如何使用
                    </h2>
                  </div>
                  <GitBranch className="h-5 w-5 text-slate-400" />
                </div>

                <div className="mt-5 space-y-4">
                  {entry.installMethods.map((method) => (
                    <div
                      key={method}
                      className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {INSTALL_METHOD_LABELS[method]}
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-[18px] bg-white p-4 text-sm leading-7 text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
                        <code>{exampleInstallSnippet(entry.slug, method)}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="space-y-6">
              <div className="rounded-[30px] border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">标签</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600"
                    >
                      {mapTagToCategory(tag)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Star className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-semibold">相关推荐</p>
                </div>
                <div className="mt-4 space-y-3">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/skills/${item.slug}`}
                      className="block rounded-[22px] border border-slate-200 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.summary}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function exampleInstallSnippet(slug: string, method: string) {
  switch (method) {
    case "plugin-marketplace":
      return `# 在 Codex 插件市场或本地插件目录中启用\ncodex plugins add ${slug}`;
    case "installer-script":
      return `npx ai-skill-hub@latest install ${slug}`;
    case "github-release":
      return `# 从 GitHub Release 下载归档包\nopen <release-url>`;
    default:
      return `mkdir -p "$CODEX_HOME/skills"\ncp -R ./${slug} "$CODEX_HOME/skills/${slug}"`;
  }
}
