import {
  FEATURED_SOURCE_REPO,
  KNOWN_CATEGORY_LABELS,
} from "@/lib/catalog/constants";
import type {
  BrowseFilters,
  CatalogEntry,
  CatalogMeta,
  CatalogSourceStatus,
  Platform,
  SearchEntry,
} from "@/lib/catalog/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ensureSlug(value: string, fallback: string): string {
  return slugify(value) || fallback;
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function normalizeTags(tags: string[]): string[] {
  return unique(
    tags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase()),
  );
}

function entryPriority(entry: CatalogEntry): number {
  const officialWeight =
    {
      official: 4,
      curated: 3,
      community: 2,
      deprecated: 1,
    }[entry.officialStatus] ?? 0;

  return officialWeight * 100 + (entry.deprecated ? 0 : 10) + entry.summary.length;
}

function normalizeKey(entry: CatalogEntry): string {
  if (entry.canonicalId) {
    return `${entry.kind}:${entry.canonicalId.toLowerCase()}`;
  }

  const pathKey = entry.path ? `#${entry.path}` : "";
  return `${entry.kind}:${entry.downloadUrl.toLowerCase()}${pathKey}`;
}

function normalizeMirrorKey(entry: CatalogEntry): string | null {
  if (entry.kind === "collection") {
    return null;
  }

  const titleKey = ensureSlug(entry.originalTitle ?? entry.title, entry.slug);
  if (!titleKey) {
    return null;
  }

  return `${entry.kind}:${entry.slug}:${titleKey}`;
}

function mergeEntries(base: CatalogEntry, incoming: CatalogEntry): CatalogEntry {
  const primary =
    entryPriority(incoming) > entryPriority(base) ? incoming : base;
  const secondary = primary === base ? incoming : base;

  return {
    ...primary,
    category: primary.category ?? secondary.category ?? getPrimaryCategory([...base.tags, ...incoming.tags]),
    platforms: unique([...base.platforms, ...incoming.platforms]),
    tags: normalizeTags([...base.tags, ...incoming.tags]),
    installMethods: unique([...base.installMethods, ...incoming.installMethods]),
    canonicalId: primary.canonicalId ?? secondary.canonicalId,
    sourceRepos: unique([
      ...(base.sourceRepos ?? [base.sourceRepo]),
      ...(incoming.sourceRepos ?? [incoming.sourceRepo]),
    ]),
    stars: Math.max(base.stars ?? 0, incoming.stars ?? 0) || null,
    updatedAt:
      new Date(base.updatedAt) > new Date(incoming.updatedAt)
        ? base.updatedAt
        : incoming.updatedAt,
    summary:
      primary.summary.length >= secondary.summary.length
        ? primary.summary
        : secondary.summary,
    description:
      primary.description && secondary.description
        ? primary.description.length >= secondary.description.length
          ? primary.description
          : secondary.description
        : primary.description ?? secondary.description,
    originalTitle: base.originalTitle ?? incoming.originalTitle,
    originalSummary: base.originalSummary ?? incoming.originalSummary,
  };
}

export function dedupeEntries(entries: CatalogEntry[]): CatalogEntry[] {
  const map = new Map<string, CatalogEntry>();

  for (const entry of entries) {
    const key = normalizeKey(entry);
    const current = map.get(key);
    map.set(key, current ? mergeEntries(current, entry) : entry);
  }

  const mirrorMerged = new Map<string, CatalogEntry>();

  for (const entry of map.values()) {
    const mirrorKey = normalizeMirrorKey(entry);
    if (!mirrorKey) {
      mirrorMerged.set(`${entry.kind}:${entry.slug}:${entry.downloadUrl}`, entry);
      continue;
    }

    const current = mirrorMerged.get(mirrorKey);
    mirrorMerged.set(mirrorKey, current ? mergeEntries(current, entry) : entry);
  }

  return [...mirrorMerged.values()].sort((left, right) => {
    if ((right.stars ?? 0) !== (left.stars ?? 0)) {
      return (right.stars ?? 0) - (left.stars ?? 0);
    }
    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

function buildUniqueSlug(entry: CatalogEntry, taken: Set<string>): string {
  const candidates = [
    `${entry.slug}-${entry.kind}`,
    `${entry.slug}-${entry.kind}-${ensureSlug(entry.sourceRepo.split("/").pop() ?? entry.sourceRepo, entry.kind)}`,
    `${entry.slug}-${ensureSlug(entry.repoUrl.split("/").pop() ?? entry.kind, entry.kind)}`,
  ];

  for (const candidate of candidates) {
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  let counter = 2;
  while (taken.has(`${entry.slug}-${entry.kind}-${counter}`)) {
    counter += 1;
  }
  return `${entry.slug}-${entry.kind}-${counter}`;
}

export function ensureUniqueSlugs(entries: CatalogEntry[]): CatalogEntry[] {
  const groups = new Map<string, CatalogEntry[]>();

  for (const entry of entries) {
    groups.set(entry.slug, [...(groups.get(entry.slug) ?? []), entry]);
  }

  const taken = new Set<string>();

  return entries.map((entry) => {
    const group = groups.get(entry.slug) ?? [];
    if (group.length === 1 && !taken.has(entry.slug)) {
      taken.add(entry.slug);
      return entry;
    }

    const sortedGroup = [...group].sort((left, right) => entryPriority(right) - entryPriority(left));
    const preferred = sortedGroup[0];

    if (preferred === entry && !taken.has(entry.slug)) {
      taken.add(entry.slug);
      return entry;
    }

    const nextSlug = buildUniqueSlug(entry, taken);
    taken.add(nextSlug);
    return {
      ...entry,
      slug: nextSlug,
    };
  });
}

export function buildSearchIndex(entries: CatalogEntry[]): SearchEntry[] {
  return entries
    .filter((entry) => entry.kind !== "collection")
    .map((entry) => ({
      slug: entry.slug,
      kind: entry.kind,
      title: entry.title,
      summary: entry.summary,
      description: entry.description,
      category: entry.category,
      sourceRepo: entry.sourceRepo,
      sourceRepos: entry.sourceRepos,
      downloadUrl: entry.downloadUrl,
      platforms: entry.platforms,
      tags: entry.tags,
      officialStatus: entry.officialStatus,
      deprecated: entry.deprecated,
      stars: entry.stars,
      updatedAt: entry.updatedAt,
      installMethods: entry.installMethods,
      originalTitle: entry.originalTitle,
      originalSummary: entry.originalSummary,
      searchText: [
        entry.title,
        entry.summary,
        entry.description,
        entry.category,
        entry.originalTitle,
        entry.originalSummary,
        entry.sourceRepo,
        ...(entry.sourceRepos ?? []),
        ...entry.tags,
        ...entry.platforms,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
}

export function getTopCollections(entries: CatalogEntry[]): CatalogEntry[] {
  return entries
    .filter((entry) => entry.kind === "collection" && !entry.deprecated)
    .sort((left, right) => {
      if ((right.stars ?? 0) !== (left.stars ?? 0)) {
        return (right.stars ?? 0) - (left.stars ?? 0);
      }
      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    });
}

export function getFeaturedEntries(entries: CatalogEntry[]): SearchEntry[] {
  const ranked = entries
    .filter((entry) => !entry.deprecated)
    .sort((left, right) => {
      const featuredBias =
        left.sourceRepo === FEATURED_SOURCE_REPO
          ? 1
          : right.sourceRepo === FEATURED_SOURCE_REPO
            ? -1
            : 0;

      if (featuredBias !== 0) {
        return -featuredBias;
      }

      if ((right.stars ?? 0) !== (left.stars ?? 0)) {
        return (right.stars ?? 0) - (left.stars ?? 0);
      }

      return (
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      );
    });

  return buildSearchIndex(ranked).slice(0, 8);
}

export function formatCompactNumber(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("zh-CN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRelativeDate(value: string): string {
  const today = new Date();
  const target = new Date(value);
  const days = Math.max(
    0,
    Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000)),
  );

  if (days <= 1) {
    return "1 天内";
  }

  if (days < 30) {
    return `${days} 天前`;
  }

  if (days < 365) {
    return `${Math.round(days / 30)} 个月前`;
  }

  return `${Math.round(days / 365)} 年前`;
}

export function mapTagToCategory(tag: string): string {
  const lower = tag.toLowerCase();

  for (const [key, value] of Object.entries(KNOWN_CATEGORY_LABELS)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return "其他";
}

export function getPrimaryCategory(tags: string[]): string {
  for (const tag of tags) {
    const mapped = mapTagToCategory(tag);
    if (mapped !== "其他") {
      return mapped;
    }
  }

  return tags[0] ? mapTagToCategory(tags[0]) : "其他";
}

export function matchesFreshness(updatedAt: string, freshness: BrowseFilters["freshness"]): boolean {
  if (freshness === "all") {
    return true;
  }

  const days = Number(freshness);
  const diff =
    (Date.now() - new Date(updatedAt).getTime()) / (24 * 60 * 60 * 1000);
  return diff <= days;
}

export function filterSearchEntries(
  entries: SearchEntry[],
  filters: BrowseFilters,
): SearchEntry[] {
  const query = filters.query.trim().toLowerCase();

  return entries.filter((entry) => {
    if (entry.deprecated && filters.kind !== "all") {
      return false;
    }

    if (filters.kind !== "all" && entry.kind !== filters.kind) {
      return false;
    }

    if (filters.platforms.length > 0) {
      const wanted = filters.platforms.every((platform) =>
        entry.platforms.includes(platform),
      );
      if (!wanted) {
        return false;
      }
    }

    const entryCategory = entry.category ?? getPrimaryCategory(entry.tags);
    if (filters.tag && entryCategory !== filters.tag) {
      return false;
    }

    const sourceRepos = entry.sourceRepos ?? [entry.sourceRepo];
    if (filters.sourceRepo && !sourceRepos.includes(filters.sourceRepo)) {
      return false;
    }

    if (!matchesFreshness(entry.updatedAt, filters.freshness)) {
      return false;
    }

    if (query && !entry.searchText.includes(query)) {
      return false;
    }

    return true;
  });
}

export function getFacetSummary(entries: SearchEntry[]) {
  const byPlatform = new Map<Platform, number>();
  const bySource = new Map<string, number>();
  const byTag = new Map<string, number>();
  const byCategory = new Map<string, number>();

  for (const entry of entries) {
    for (const platform of entry.platforms) {
      byPlatform.set(platform, (byPlatform.get(platform) ?? 0) + 1);
    }
    for (const sourceRepo of entry.sourceRepos ?? [entry.sourceRepo]) {
      bySource.set(sourceRepo, (bySource.get(sourceRepo) ?? 0) + 1);
    }
    for (const tag of entry.tags) {
      byTag.set(tag, (byTag.get(tag) ?? 0) + 1);
    }
    const category = entry.category ?? getPrimaryCategory(entry.tags);
    byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
  }

  return {
    byPlatform,
    bySource,
    byTag,
    byCategory,
  };
}

export function createCatalogMeta(
  generatedAt: string,
  sources: CatalogSourceStatus[],
): CatalogMeta {
  const fallbackSources = sources.filter((source) => source.status === "fallback");
  return {
    generatedAt,
    stale: fallbackSources.length > 0,
    warning:
      fallbackSources.length > 0
        ? `部分 GitHub 源同步失败，当前页面回退到最近一次成功快照。`
        : undefined,
    sources,
  };
}
