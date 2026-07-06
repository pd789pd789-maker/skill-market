import {
  fetchGitHubJson,
  fetchGitHubText,
  fetchRepoMeta,
  fetchRepoTree,
  parseGitHubRepo,
  rawGitHubUrl,
  repoTreeUrl,
} from "@/lib/catalog/github";
import { ensureSlug, normalizeTags, unique } from "@/lib/catalog/normalize";
import type {
  CatalogEntry,
  InstallMethod,
  OfficialStatus,
  Platform,
  SourceAdapter,
  SourceContext,
} from "@/lib/catalog/types";

type AntigravityItem = {
  id: string;
  path: string;
  category?: string;
  name: string;
  description?: string;
  source?: string;
  date_added?: string;
  plugin?: {
    targets?: Record<string, string>;
    setup?: {
      type?: string;
    };
  };
};

type AntigravityRaw = {
  meta: Awaited<ReturnType<typeof fetchRepoMeta>>;
  items: AntigravityItem[];
};

type ManifestRaw = {
  meta: Awaited<ReturnType<typeof fetchRepoMeta>>;
  branch: string;
  files: Array<{ path: string; text: string }>;
};

type ReadmeRaw = {
  meta: Awaited<ReturnType<typeof fetchRepoMeta>>;
  readme: string;
};

function parseFrontmatter(text: string): Record<string, string> {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return {};
  }

  const output: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^"|"$/g, "");
    if (key) {
      output[key] = value;
    }
  }
  return output;
}

function normalizePlatforms(input: string[] | undefined, fallback: Platform[]): Platform[] {
  if (!input || input.length === 0) {
    return fallback;
  }

  const mapped = input
    .map((item) => item.toLowerCase())
    .flatMap((item): Platform[] => {
      if (item === "codex") return ["codex"];
      if (item === "claude") return ["claude"];
      if (item === "cursor") return ["cursor"];
      if (item === "gemini") return ["gemini"];
      if (item === "supported") return [];
      return [];
    });

  return unique(mapped.length > 0 ? mapped : fallback);
}

function buildCollectionEntry(options: {
  slug: string;
  title: string;
  summary: string;
  sourceRepo: string;
  repoUrl: string;
  stars: number | null;
  updatedAt: string;
  tags: string[];
  platforms: Platform[];
  officialStatus: OfficialStatus;
  deprecated?: boolean;
  installMethods: InstallMethod[];
}): CatalogEntry {
  return {
    slug: options.slug,
    kind: "collection",
    title: options.title,
    summary: options.summary,
    sourceRepo: options.sourceRepo,
    repoUrl: options.repoUrl,
    downloadUrl: options.repoUrl,
    platforms: options.platforms,
    tags: normalizeTags(options.tags),
    officialStatus: options.officialStatus,
    deprecated: options.deprecated ?? false,
    stars: options.stars,
    updatedAt: options.updatedAt,
    installMethods: options.installMethods,
  };
}

function validateEntries(entries: CatalogEntry[]): CatalogEntry[] {
  return entries.filter((entry) => {
    return (
      Boolean(entry.slug) &&
      Boolean(entry.title) &&
      Boolean(entry.summary) &&
      Boolean(entry.sourceRepo) &&
      Boolean(entry.repoUrl) &&
      Boolean(entry.downloadUrl) &&
      entry.platforms.length > 0 &&
      entry.installMethods.length > 0
    );
  });
}

async function fetchAntigravity(context: SourceContext): Promise<AntigravityRaw> {
  const repo = "sickn33/antigravity-awesome-skills";
  const meta = await fetchRepoMeta(repo, context);
  const items = await fetchGitHubJson<AntigravityItem[]>(
    rawGitHubUrl(repo, meta.defaultBranch, "skills_index.json"),
    context,
  );
  return { meta, items };
}

async function normalizeAntigravity(
  raw: AntigravityRaw,
): Promise<CatalogEntry[]> {
  const repo = raw.meta.fullName;
  const collection = buildCollectionEntry({
    slug: "antigravity-awesome-skills",
    title: "Antigravity Awesome Skills",
    summary:
      raw.meta.description ||
      "面向 Codex、Claude、Cursor、Gemini 的大型可安装 Skill 库。",
    sourceRepo: repo,
    repoUrl: raw.meta.htmlUrl,
    stars: raw.meta.stargazersCount,
    updatedAt: raw.meta.pushedAt,
    tags: ["awesome", "catalog", "skills", "cross-platform"],
    platforms: ["codex", "claude", "cursor", "gemini", "multi-agent"],
    officialStatus: "curated",
    installMethods: ["installer-script", "copy-folder"],
  });

  const items = raw.items.map<CatalogEntry>((item) => {
    const targets = Object.entries(item.plugin?.targets ?? {})
      .filter(([, status]) => status === "supported")
      .map(([platform]) => platform);

    return {
      slug: ensureSlug(item.id || item.name, item.id),
      kind: "skill",
      title: item.name.replace(/[-_]/g, " "),
      summary: item.description?.trim() || "来自 Antigravity 索引的社区 Skill。",
      sourceRepo: repo,
      repoUrl: raw.meta.htmlUrl,
      downloadUrl: repoTreeUrl(repo, raw.meta.defaultBranch, item.path),
      platforms: normalizePlatforms(targets, ["codex", "claude"]),
      tags: normalizeTags([item.category ?? "other", item.source ?? "community"]),
      officialStatus: item.source === "personal" ? "curated" : "community",
      deprecated: false,
      stars: raw.meta.stargazersCount,
      updatedAt: item.date_added
        ? new Date(item.date_added).toISOString()
        : raw.meta.pushedAt,
      installMethods:
        item.plugin?.setup?.type === "none"
          ? ["copy-folder"]
          : ["installer-script", "copy-folder"],
      path: item.path,
    };
  });

  return [collection, ...items];
}

async function fetchManifestSource(
  repo: string,
  matcher: (path: string) => boolean,
  context: SourceContext,
): Promise<ManifestRaw> {
  const meta = await fetchRepoMeta(repo, context);
  const tree = await fetchRepoTree(repo, meta.defaultBranch, context);
  const selected = tree.filter(matcher);

  const files = await Promise.all(
    selected.map(async (path) => ({
      path,
      text: await fetchGitHubText(rawGitHubUrl(repo, meta.defaultBranch, path), context),
    })),
  );

  return {
    meta,
    branch: meta.defaultBranch,
    files,
  };
}

async function normalizeAnthropic(raw: ManifestRaw): Promise<CatalogEntry[]> {
  const repo = raw.meta.fullName;
  const collection = buildCollectionEntry({
    slug: "anthropics-skills",
    title: "Anthropic Skills",
    summary:
      raw.meta.description ||
      "Anthropic 官方公开的 Agent Skills 仓库，适合 Claude 工作流。",
    sourceRepo: repo,
    repoUrl: raw.meta.htmlUrl,
    stars: raw.meta.stargazersCount,
    updatedAt: raw.meta.pushedAt,
    tags: ["official", "claude", "skills"],
    platforms: ["claude"],
    officialStatus: "official",
    installMethods: ["copy-folder"],
  });

  const items = raw.files.map<CatalogEntry>(({ path, text }) => {
    const frontmatter = parseFrontmatter(text);
    const folder = path.split("/")[1] ?? path;
    return {
      slug: ensureSlug(folder, folder),
      kind: "skill",
      title: frontmatter.name || folder,
      summary:
        frontmatter.description ||
        "Anthropic 官方 Skill，来自公开技能仓库。",
      sourceRepo: repo,
      repoUrl: raw.meta.htmlUrl,
      downloadUrl: repoTreeUrl(repo, raw.branch, path.replace("/SKILL.md", "")),
      platforms: ["claude"],
      tags: normalizeTags([folder, "official", "anthropic"]),
      officialStatus: "official",
      deprecated: false,
      stars: raw.meta.stargazersCount,
      updatedAt: raw.meta.pushedAt,
      installMethods: ["copy-folder"],
      path,
    };
  });

  return [collection, ...items];
}

async function normalizeOpenAIPlugins(raw: ManifestRaw): Promise<CatalogEntry[]> {
  const repo = raw.meta.fullName;
  const collection = buildCollectionEntry({
    slug: "openai-plugins",
    title: "OpenAI Plugins",
    summary:
      raw.meta.description ||
      "OpenAI 官方 Codex 插件示例集合，覆盖设计、部署与应用集成。",
    sourceRepo: repo,
    repoUrl: raw.meta.htmlUrl,
    stars: raw.meta.stargazersCount,
    updatedAt: raw.meta.pushedAt,
    tags: ["official", "codex", "plugins"],
    platforms: ["codex"],
    officialStatus: "official",
    installMethods: ["plugin-marketplace", "copy-folder"],
  });

  const items = raw.files.map<CatalogEntry>(({ path, text }) => {
    const manifest = JSON.parse(text) as {
      name?: string;
      description?: string;
      keywords?: string[];
      interface?: {
        displayName?: string;
        shortDescription?: string;
      };
    };
    const folder = path.split("/")[1] ?? path;
    return {
      slug: ensureSlug(folder, folder),
      kind: "plugin",
      title: manifest.interface?.displayName || manifest.name || folder,
      summary:
        manifest.interface?.shortDescription ||
        manifest.description ||
        "OpenAI 官方插件。",
      sourceRepo: repo,
      repoUrl: raw.meta.htmlUrl,
      downloadUrl: repoTreeUrl(repo, raw.branch, path.replace("/.codex-plugin/plugin.json", "")),
      platforms: ["codex"],
      tags: normalizeTags([...(manifest.keywords ?? []), folder, "official"]),
      officialStatus: "official",
      deprecated: false,
      stars: raw.meta.stargazersCount,
      updatedAt: raw.meta.pushedAt,
      installMethods: ["plugin-marketplace", "copy-folder"],
      path,
    };
  });

  const deprecatedCollection = buildCollectionEntry({
    slug: "openai-skills-deprecated",
    title: "OpenAI Skills (Deprecated)",
    summary:
      "已弃用的 OpenAI Skills 仓库，保留作历史来源说明，不进入主榜单。",
    sourceRepo: "openai/skills",
    repoUrl: "https://github.com/openai/skills",
    stars: null,
    updatedAt: raw.meta.pushedAt,
    tags: ["deprecated", "history"],
    platforms: ["codex"],
    officialStatus: "deprecated",
    deprecated: true,
    installMethods: ["copy-folder"],
  });

  return [collection, deprecatedCollection, ...items];
}

function inferReadmeKind(title: string, summary: string, url: string): CatalogEntry["kind"] {
  const lower = `${title} ${summary} ${url}`.toLowerCase();
  if (lower.includes("plugin")) {
    return "plugin";
  }
  if (
    lower.includes("awesome") ||
    lower.includes("collection") ||
    lower.includes("bundle")
  ) {
    return "collection";
  }
  return "skill";
}

function parseReadmeBullets(
  readme: string,
  sourceRepo: string,
): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  let currentSection = "community";

  for (const rawLine of readme.split("\n")) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    const summaryMatch = line.match(/<summary><h3[^>]*>(.+?)<\/h3><\/summary>/i);
    if (headingMatch) {
      currentSection = headingMatch[1];
      continue;
    }
    if (summaryMatch) {
      currentSection = summaryMatch[1];
      continue;
    }

    const bulletMatch =
      line.match(/^- \*\*\[([^\]]+)\]\(([^)]+)\)\*\* - (.+)$/) ??
      line.match(/^- \[([^\]]+)\]\(([^)]+)\) - (.+)$/);

    if (!bulletMatch) {
      continue;
    }

    const [, title, url, summary] = bulletMatch;
    if (!url.includes("github.com")) {
      continue;
    }

    const repo = parseGitHubRepo(url);
    const tags = normalizeTags([currentSection, repo ?? sourceRepo]);
    entries.push({
      slug: ensureSlug(`${sourceRepo}-${title}`, `${sourceRepo}-${title}`),
      kind: inferReadmeKind(title, summary, url),
      title,
      summary,
      sourceRepo,
      repoUrl: repo ? `https://github.com/${repo}` : url,
      downloadUrl: url,
      platforms: ["codex", "claude", "cursor", "gemini", "multi-agent"],
      tags,
      officialStatus: /official|team|openai|anthropic/i.test(currentSection)
        ? "curated"
        : "community",
      deprecated: false,
      stars: null,
      updatedAt: new Date().toISOString(),
      installMethods: url.includes("/releases")
        ? ["github-release"]
        : ["copy-folder"],
    });
  }

  return entries;
}

async function fetchReadmeSource(
  repo: string,
  context: SourceContext,
): Promise<ReadmeRaw> {
  const meta = await fetchRepoMeta(repo, context);
  const readme = await fetchGitHubText(
    rawGitHubUrl(repo, meta.defaultBranch, "README.md"),
    context,
  );
  return { meta, readme };
}

async function normalizeVoltAgent(raw: ReadmeRaw): Promise<CatalogEntry[]> {
  const repo = raw.meta.fullName;
  return [
    buildCollectionEntry({
      slug: "voltagent-awesome-agent-skills",
      title: "Awesome Agent Skills",
      summary:
        raw.meta.description ||
        "收录官方团队与社区技能的跨平台代理目录仓库。",
      sourceRepo: repo,
      repoUrl: raw.meta.htmlUrl,
      stars: raw.meta.stargazersCount,
      updatedAt: raw.meta.pushedAt,
      tags: ["awesome", "curated", "cross-platform"],
      platforms: ["codex", "claude", "cursor", "gemini", "multi-agent"],
      officialStatus: "curated",
      installMethods: ["copy-folder"],
    }),
    ...parseReadmeBullets(raw.readme, repo),
  ];
}

async function normalizeComposio(raw: ReadmeRaw): Promise<CatalogEntry[]> {
  const repo = raw.meta.fullName;
  return [
    buildCollectionEntry({
      slug: "composio-awesome-codex-skills",
      title: "Awesome Codex Skills",
      summary:
        raw.meta.description ||
        "Codex 生态下的实用 Skill 汇编，偏安装与自动化场景。",
      sourceRepo: repo,
      repoUrl: raw.meta.htmlUrl,
      stars: raw.meta.stargazersCount,
      updatedAt: raw.meta.pushedAt,
      tags: ["awesome", "codex", "skills"],
      platforms: ["codex"],
      officialStatus: "curated",
      installMethods: ["installer-script", "copy-folder"],
    }),
    ...parseReadmeBullets(raw.readme, repo),
  ];
}

export const antigravityAdapter: SourceAdapter<AntigravityRaw> = {
  id: "antigravity-json",
  label: "Antigravity JSON Catalog",
  sourceRepo: "sickn33/antigravity-awesome-skills",
  fetch: fetchAntigravity,
  normalize: normalizeAntigravity,
  validate: validateEntries,
};

export const anthropicsAdapter: SourceAdapter<ManifestRaw> = {
  id: "anthropics-manifest",
  label: "Anthropic Skill Manifest",
  sourceRepo: "anthropics/skills",
  fetch: (context) =>
    fetchManifestSource(
      "anthropics/skills",
      (path) => path.startsWith("skills/") && path.endsWith("/SKILL.md"),
      context,
    ),
  normalize: normalizeAnthropic,
  validate: validateEntries,
};

export const openaiPluginsAdapter: SourceAdapter<ManifestRaw> = {
  id: "openai-plugin-manifest",
  label: "OpenAI Plugin Manifest",
  sourceRepo: "openai/plugins",
  fetch: (context) =>
    fetchManifestSource(
      "openai/plugins",
      (path) => path.endsWith("/.codex-plugin/plugin.json"),
      context,
    ),
  normalize: normalizeOpenAIPlugins,
  validate: validateEntries,
};

export const voltAgentAdapter: SourceAdapter<ReadmeRaw> = {
  id: "voltagent-readme",
  label: "VoltAgent README Catalog",
  sourceRepo: "VoltAgent/awesome-agent-skills",
  fetch: (context) => fetchReadmeSource("VoltAgent/awesome-agent-skills", context),
  normalize: normalizeVoltAgent,
  validate: validateEntries,
};

export const composioAdapter: SourceAdapter<ReadmeRaw> = {
  id: "composio-readme",
  label: "Composio README Catalog",
  sourceRepo: "ComposioHQ/awesome-codex-skills",
  fetch: (context) => fetchReadmeSource("ComposioHQ/awesome-codex-skills", context),
  normalize: normalizeComposio,
  validate: validateEntries,
};

export const SOURCE_ADAPTERS = [
  antigravityAdapter,
  anthropicsAdapter,
  openaiPluginsAdapter,
  voltAgentAdapter,
  composioAdapter,
];
