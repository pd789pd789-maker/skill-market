"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Filter,
  Flame,
  Layers3,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import {
  DEFAULT_FILTERS,
  FEATURED_SOURCE_REPO,
  INSTALL_METHOD_DESCRIPTIONS,
  INSTALL_METHOD_LABELS,
  KIND_LABELS,
  OFFICIAL_STATUS_LABELS,
  PLATFORM_LABELS,
  SOURCE_ACCENT,
} from "@/lib/catalog/constants";
import {
  filterSearchEntries,
  formatCompactNumber,
  formatRelativeDate,
  getPrimaryCategory,
  getFacetSummary,
  mapTagToCategory,
} from "@/lib/catalog/normalize";
import type {
  BrowseFilters,
  CatalogEntry,
  CatalogMeta,
  Platform,
  SearchEntry,
} from "@/lib/catalog/types";
import { PlatformBadge, PlatformMark } from "@/components/catalog/platform-badge";
import { StaleBanner } from "@/components/catalog/stale-banner";

type SortMode = "stars" | "updated" | "official";

function sortEntries(entries: SearchEntry[], mode: SortMode): SearchEntry[] {
  return [...entries].sort((left, right) => {
    if (mode === "updated") {
      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    }

    if (mode === "official") {
      const officialGap =
        Number(right.officialStatus === "official") -
        Number(left.officialStatus === "official");
      if (officialGap !== 0) {
        return officialGap;
      }
    }

    if ((right.stars ?? 0) !== (left.stars ?? 0)) {
      return (right.stars ?? 0) - (left.stars ?? 0);
    }

    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

function compatibilityCount(entries: SearchEntry[], platform: Platform) {
  return entries.filter((entry) => entry.platforms.includes(platform)).length;
}

function getCompatibilityRows(entries: SearchEntry[]) {
  return [
    {
      label: "完全兼容",
      accent: "bg-emerald-500",
      resolve: (platform: Platform) => compatibilityCount(entries, platform),
      note: "明确声明支持该平台",
    },
    {
      label: "跨平台代理",
      accent: "bg-blue-500",
      resolve: () => compatibilityCount(entries, "multi-agent"),
      note: "可在多个代理环境复用",
    },
    {
      label: "官方来源",
      accent: "bg-amber-500",
      resolve: (platform: Platform) =>
        entries.filter(
          (entry) =>
            entry.platforms.includes(platform) &&
            entry.officialStatus === "official",
        ).length,
      note: "由平台或团队官方维护",
    },
    {
      label: "已弃用",
      accent: "bg-rose-500",
      resolve: (platform: Platform) =>
        entries.filter(
          (entry) => entry.platforms.includes(platform) && entry.deprecated,
        ).length,
      note: "保留作历史资料，不进主榜",
    },
  ];
}

function getPrimaryTag(entry: SearchEntry) {
  return entry.category ?? getPrimaryCategory(entry.tags);
}

export function CatalogShell({
  variant,
  entries,
  collections,
  meta,
}: {
  variant: "home" | "catalog";
  entries: SearchEntry[];
  collections: CatalogEntry[];
  meta: CatalogMeta;
}) {
  const [filters, setFilters] = useState<BrowseFilters>(DEFAULT_FILTERS);
  const [sortMode, setSortMode] = useState<SortMode>("stars");
  const deferredQuery = useDeferredValue(filters.query);
  const filtered = sortEntries(
    filterSearchEntries(entries, { ...filters, query: deferredQuery }),
    sortMode,
  );
  const facets = getFacetSummary(entries);
  const topTags = [...facets.byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  const sidebarCategories = facets.byCategory;
  const sidebarSources = [...facets.bySource.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const hotCollection =
    collections.find((entry) => entry.sourceRepo === FEATURED_SOURCE_REPO) ??
    collections[0];
  const featured = filtered.slice(0, 4);
  const tableRows = filtered.slice(0, 6);
  const recentRows = sortEntries(filtered, "updated").slice(0, 5);
  const compatibilityRows = getCompatibilityRows(entries);
  const hotCollectionMemberCount = entries.filter(
    (entry) => (entry.sourceRepos ?? [entry.sourceRepo]).includes(hotCollection?.sourceRepo ?? ""),
  ).length;

  function updateFilters(patch: Partial<BrowseFilters>) {
    startTransition(() => {
      setFilters((current) => ({ ...current, ...patch }));
    });
  }

  function togglePlatform(platform: Platform) {
    const exists = filters.platforms.includes(platform);
    updateFilters({
      platforms: exists
        ? filters.platforms.filter((item) => item !== platform)
        : [...filters.platforms, platform],
    });
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-r border-slate-200 bg-white">
        <div className="sticky top-[88px] space-y-8 px-4 py-6 sm:px-6">
          <SidebarSection title="按平台筛选">
            <div className="space-y-3">
              {Object.entries(PLATFORM_LABELS).map(([platform, label]) => {
                const typedPlatform = platform as Platform;
                const selected = filters.platforms.includes(typedPlatform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(typedPlatform)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-4 w-4 rounded-md border ${
                          selected
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                      {label}
                    </span>
                    <span className="text-sm text-slate-400">
                      {facets.byPlatform.get(typedPlatform) ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </SidebarSection>

          <SidebarSection title="搜索关键词">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Search className="h-4 w-4" />
                <input
                  value={filters.query}
                  onChange={(event) => updateFilters({ query: event.target.value })}
                  placeholder="搜索技能名称、功能或关键词..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </SidebarSection>

          <SidebarSection title="分类">
            <div className="space-y-2">
              {[...sidebarCategories.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([category, count]) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => updateFilters({ tag: filters.tag === category ? null : category })}
                    className={`flex w-full items-center justify-between rounded-2xl px-2 py-2 text-sm transition ${
                      filters.tag === category
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{category}</span>
                    <span className="text-slate-400">{count}</span>
                  </button>
                ))}
            </div>
          </SidebarSection>

          <SidebarSection title="来源仓库">
            <div className="space-y-2">
              {sidebarSources.map(([repo, count]) => (
                <button
                  key={repo}
                  type="button"
                  onClick={() =>
                    updateFilters({
                      sourceRepo: filters.sourceRepo === repo ? null : repo,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-2xl px-2 py-2 text-sm transition ${
                    filters.sourceRepo === repo
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate pr-4">{repo}</span>
                  <span className={filters.sourceRepo === repo ? "text-white/70" : "text-slate-400"}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="最近更新">
            <div className="space-y-2 text-sm">
              {[
                ["all", "全部"],
                ["7", "过去 7 天"],
                ["30", "过去 30 天"],
                ["90", "过去 90 天"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 text-slate-600">
                  <input
                    checked={filters.freshness === value}
                    onChange={() => updateFilters({ freshness: value as BrowseFilters["freshness"] })}
                    type="radio"
                    className="h-4 w-4 accent-blue-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </SidebarSection>
        </div>
      </aside>

      <main className="min-w-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_42%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {meta.stale && meta.warning ? <StaleBanner message={meta.warning} /> : null}

          <section id="discover" className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.16)] sm:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    <Flame className="h-3.5 w-3.5" />
                    GitHub 热门来源与技能发现
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                      发现高质量 Skill
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-slate-600">
                      精选可下载的 AI Agent 技能，覆盖 Codex、Claude、Cursor、Gemini，
                      把真实 GitHub 来源、安装方式和平台兼容性放到一个工作台里。
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                    <Layers3 className="h-4 w-4" />
                    {entries.length} 个可浏览条目
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                    <Clock3 className="h-4 w-4" />
                    最近同步 {formatRelativeDate(meta.generatedAt)}
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex min-h-14 flex-1 items-center gap-3 rounded-[24px] bg-white px-4 text-slate-400 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
                    <Search className="h-5 w-5" />
                    <input
                      value={filters.query}
                      onChange={(event) => updateFilters({ query: event.target.value })}
                      placeholder="搜索技能名称、功能或关键词..."
                      className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex min-h-14 items-center justify-center rounded-[22px] bg-blue-600 px-6 text-sm font-bold text-white shadow-[0_18px_40px_-28px_rgba(37,99,235,1)] transition hover:bg-blue-500"
                  >
                    搜索
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">热门搜索：</span>
                  {topTags.map(([tag]) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => updateFilters({ tag })}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:border-blue-200 hover:text-blue-700"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {hotCollection ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                  <div
                    className={`rounded-[30px] border border-slate-200 bg-gradient-to-br ${
                      SOURCE_ACCENT[hotCollection.sourceRepo] ?? "from-blue-500/10 to-cyan-500/10"
                    } p-6`}
                  >
                    <div className="space-y-5 rounded-[26px] bg-white/90 p-6 backdrop-blur">
                      <div className="flex items-start justify-between gap-5">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            GitHub 热门
                          </div>
                          <h2 className="text-3xl font-black tracking-tight text-slate-950">
                            {hotCollection.title}
                          </h2>
                          <p className="max-w-2xl text-sm leading-7 text-slate-600">
                            {hotCollection.summary}
                          </p>
                        </div>
                        <a
                          href={hotCollection.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                        >
                          查看 GitHub
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>

                      <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-5 md:grid-cols-[96px_minmax(0,1fr)_200px]">
                        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-950 text-4xl font-black text-white">
                          AI
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-xl font-bold text-slate-950">
                              本周最受欢迎的技能合集
                            </p>
                            <p className="text-sm text-slate-500">
                              收录 {hotCollectionMemberCount} 个条目，适合从一个入口快速安装与筛选。
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {hotCollection.platforms.map((platform) => (
                              <PlatformBadge key={platform} platform={platform} muted />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              仓库热度 {formatCompactNumber(hotCollection.stars)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-slate-400" />
                              更新于 {formatRelativeDate(hotCollection.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4 border-l border-slate-200 pl-4">
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-500">
                              兼容性
                            </p>
                            <div className="flex gap-2">
                              {["codex", "claude", "cursor", "gemini"].map((platform) => (
                                <PlatformMark key={platform} platform={platform as Platform} />
                              ))}
                            </div>
                          </div>
                          <Link
                            href={`/collections/${hotCollection.slug}`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                          >
                            查看合集
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">热门仓库榜</p>
                        <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                          今日榜单
                        </h3>
                      </div>
                      <Link
                        href="/skills"
                        className="text-sm font-semibold text-blue-700 hover:text-blue-600"
                      >
                        查看全部
                      </Link>
                    </div>
                    <div className="mt-5 space-y-4">
                      {collections.slice(0, 5).map((collection, index) => (
                        <Link
                          key={collection.slug}
                          href={`/collections/${collection.slug}`}
                          className="flex items-center gap-4 rounded-3xl border border-slate-200 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/60"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900">
                              {collection.title}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {collection.sourceRepo}
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <p className="font-semibold text-slate-900">
                              {formatCompactNumber(collection.stars)}
                            </p>
                            <p>仓库热度</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {[...sidebarCategories.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([category]) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        updateFilters({
                          tag: filters.tag === category ? null : category,
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        filters.tag === category
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  <Filter className="h-4 w-4" />
                  <span>排序方式</span>
                  <select
                    value={sortMode}
                    onChange={(event) =>
                      setSortMode(event.target.value as SortMode)
                    }
                    className="bg-transparent font-semibold text-slate-900 outline-none"
                  >
                    <option value="stars">GitHub 仓库热度</option>
                    <option value="updated">最近更新</option>
                    <option value="official">官方优先</option>
                  </select>
                </label>

                <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  <span>类型</span>
                  <select
                    value={filters.kind}
                    onChange={(event) =>
                      updateFilters({
                        kind: event.target.value as BrowseFilters["kind"],
                      })
                    }
                    className="bg-transparent font-semibold text-slate-900 outline-none"
                  >
                    <option value="all">全部</option>
                    <option value="skill">Skill</option>
                    <option value="plugin">Plugin</option>
                  </select>
                  <ChevronDown className="h-4 w-4" />
                </label>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-sm font-semibold text-slate-500">全部技能</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {filtered.length.toLocaleString("zh-CN")} 个结果
                  </h3>
                </div>
                <Link
                  href="/skills"
                  className="text-sm font-semibold text-blue-700 hover:text-blue-600"
                >
                  切到目录视图
                </Link>
              </div>

              <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
                <div className="grid grid-cols-[64px_minmax(0,1.3fr)_140px_160px_140px_180px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-500 max-lg:hidden">
                  <span>排名</span>
                  <span>技能名称</span>
                  <span>分类</span>
                  <span>仓库热度</span>
                  <span>最近更新</span>
                  <span>兼容性</span>
                </div>
                <div>
                  {tableRows.map((entry, index) => (
                    <Link
                      key={entry.slug}
                      href={`/skills/${entry.slug}`}
                      className="grid gap-4 border-b border-slate-200 px-5 py-5 transition hover:bg-slate-50 max-lg:grid-cols-1 lg:grid-cols-[64px_minmax(0,1.3fr)_140px_160px_140px_180px]"
                    >
                      <div className="text-sm font-semibold text-slate-400">
                        {index + 1}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                            {entry.title.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-lg font-bold text-slate-950">
                              {entry.title}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {entry.summary}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">{getPrimaryTag(entry)}</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCompactNumber(entry.stars)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatRelativeDate(entry.updatedAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.platforms.slice(0, 4).map((platform) => (
                          <PlatformMark key={platform} platform={platform} />
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">精选技能</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      编辑精选
                    </h3>
                  </div>
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {featured.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/skills/${entry.slug}`}
                      className="rounded-[28px] border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_22px_50px_-34px_rgba(37,99,235,0.6)]"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-950 text-xl font-black text-white">
                        {entry.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xl font-bold tracking-tight text-slate-950">
                          {entry.title}
                        </h4>
                        <p className="text-sm leading-7 text-slate-600">
                          {entry.summary}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                          >
                            {mapTagToCategory(tag)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
                        <span className="inline-flex items-center gap-2 text-slate-500">
                          <Star className="h-4 w-4 text-amber-500" />
                          仓库热度 {formatCompactNumber(entry.stars)}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-100 px-3 py-2 font-semibold text-emerald-700">
                          <Download className="h-4 w-4" />
                          下载
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section id="compatibility" className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">兼容性</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      平台兼容总览
                    </h3>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
                  <div className="grid grid-cols-[170px_repeat(4,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500">
                    <span>平台</span>
                    {(["codex", "claude", "cursor", "gemini"] as Platform[]).map(
                      (platform) => (
                        <span key={platform} className="flex items-center gap-2">
                          <PlatformMark platform={platform} />
                          {PLATFORM_LABELS[platform]}
                        </span>
                      ),
                    )}
                  </div>
                  {compatibilityRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[170px_repeat(4,minmax(0,1fr))] border-b border-slate-200 px-4 py-4 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${row.accent}`} />
                        <div>
                          <p className="font-semibold text-slate-900">{row.label}</p>
                          <p className="text-slate-400">{row.note}</p>
                        </div>
                      </div>
                      {(["codex", "claude", "cursor", "gemini"] as Platform[]).map(
                        (platform) => (
                          <span key={platform} className="font-semibold text-slate-700">
                            {row.resolve(platform).toLocaleString("zh-CN")}
                          </span>
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section id="install" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">安装方式</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      快速上手
                    </h3>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {Object.entries(INSTALL_METHOD_LABELS).map(([method, label]) => (
                    <div
                      key={method}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                        {INSTALL_METHOD_DESCRIPTIONS[method as keyof typeof INSTALL_METHOD_DESCRIPTIONS]}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <CodeBlock
                    title="使用 Codex CLI 安装"
                    code={`npx ai-skill-hub@latest install ${filtered[0]?.slug ?? "skill-name"}`}
                  />
                  <CodeBlock
                    title="配置示例"
                    code={`{\n  "skills": {\n    "${filtered[0]?.slug ?? "skill-name"}": {\n      "enabled": true,\n      "targets": ["codex", "cursor"]\n    }\n  }\n}`}
                  />
                </div>
              </div>

              <section id="recent" className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">最近更新</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      新近变化
                    </h3>
                  </div>
                  <Clock3 className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-5 space-y-4">
                  {recentRows.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/skills/${entry.slug}`}
                      className="flex items-start justify-between gap-4 rounded-[24px] border border-slate-200 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{entry.title}</p>
                        <p className="text-sm text-slate-500">{entry.sourceRepo}</p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <p>{formatRelativeDate(entry.updatedAt)}</p>
                        <p>{OFFICIAL_STATUS_LABELS[entry.officialStatus]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </section>

            {variant === "catalog" ? (
              <section className="rounded-[30px] border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">浏览模式</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      目录视图
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
                    {filtered.length.toLocaleString("zh-CN")} 条
                  </span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {filtered.slice(0, 12).map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/skills/${entry.slug}`}
                      className="rounded-[28px] border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_40px_-30px_rgba(37,99,235,0.6)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            {KIND_LABELS[entry.kind]}
                          </div>
                          <p className="text-xl font-bold tracking-tight text-slate-950">
                            {entry.title}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
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
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-black tracking-tight text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <pre className="mt-4 overflow-x-auto rounded-[18px] bg-white p-4 text-sm leading-7 text-slate-700 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
