export const PLATFORM_ORDER = [
  "codex",
  "claude",
  "cursor",
  "gemini",
  "multi-agent",
] as const;

export type Platform = (typeof PLATFORM_ORDER)[number];

export const INSTALL_METHOD_ORDER = [
  "copy-folder",
  "installer-script",
  "plugin-marketplace",
  "github-release",
] as const;

export type InstallMethod = (typeof INSTALL_METHOD_ORDER)[number];

export type CatalogKind = "skill" | "plugin" | "collection";

export type OfficialStatus =
  | "official"
  | "community"
  | "curated"
  | "deprecated";

export interface CatalogEntry {
  slug: string;
  kind: CatalogKind;
  title: string;
  summary: string;
  description?: string;
  category?: string;
  sourceRepo: string;
  repoUrl: string;
  downloadUrl: string;
  platforms: Platform[];
  tags: string[];
  officialStatus: OfficialStatus;
  deprecated: boolean;
  stars: number | null;
  updatedAt: string;
  installMethods: InstallMethod[];
  canonicalId?: string;
  sourceRepos?: string[];
  originalTitle?: string;
  originalSummary?: string;
  path?: string;
}

export interface SearchEntry {
  slug: string;
  kind: CatalogKind;
  title: string;
  summary: string;
  description?: string;
  category?: string;
  sourceRepo: string;
  sourceRepos?: string[];
  downloadUrl: string;
  platforms: Platform[];
  tags: string[];
  officialStatus: OfficialStatus;
  deprecated: boolean;
  stars: number | null;
  updatedAt: string;
  installMethods: InstallMethod[];
  originalTitle?: string;
  originalSummary?: string;
  searchText: string;
}

export interface CatalogSourceStatus {
  id: string;
  label: string;
  sourceRepo: string;
  entryCount: number;
  status: "fresh" | "fallback";
  error?: string;
  updatedAt: string;
}

export interface CatalogMeta {
  generatedAt: string;
  stale: boolean;
  warning?: string;
  sources: CatalogSourceStatus[];
}

export interface BrowseFilters {
  query: string;
  platforms: Platform[];
  tag: string | null;
  sourceRepo: string | null;
  kind: CatalogKind | "all";
  freshness: "all" | "7" | "30" | "90";
}

export interface GitHubRepoMeta {
  fullName: string;
  description: string;
  stargazersCount: number;
  pushedAt: string;
  defaultBranch: string;
  htmlUrl: string;
}

export interface SourceContext {
  now: string;
  githubToken?: string;
}

export interface SourceAdapter<TRaw = unknown> {
  id: string;
  label: string;
  sourceRepo: string;
  fetch: (context: SourceContext) => Promise<TRaw>;
  normalize: (raw: TRaw, context: SourceContext) => Promise<CatalogEntry[]>;
  validate: (entries: CatalogEntry[]) => CatalogEntry[];
}
