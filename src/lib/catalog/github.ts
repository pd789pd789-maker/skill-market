import type { GitHubRepoMeta, SourceContext } from "@/lib/catalog/types";

const API_BASE = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 20_000;

function buildHeaders(context: SourceContext): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "SkillAtlas/1.0",
    ...(context.githubToken
      ? { Authorization: `Bearer ${context.githubToken}` }
      : {}),
  };
}

function parseRawGitHubUrl(
  url: string,
): { repo: string; branch: string; path: string } | null {
  const match = url.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)\/(.+)$/i,
  );

  if (!match) {
    return null;
  }

  return {
    repo: match[1],
    branch: match[2],
    path: match[3],
  };
}

async function fetchRepoContent(
  repo: string,
  branch: string,
  path: string,
  context: SourceContext,
): Promise<string> {
  const response = await fetchOrThrow(
    `${API_BASE}/repos/${repo}/contents/${path}?ref=${branch}`,
    context,
  );
  const raw = (await response.json()) as {
    content?: string;
    encoding?: string;
  };

  if (!raw.content || raw.encoding !== "base64") {
    throw new Error(`GitHub contents API did not return base64 content for ${repo}/${path}`);
  }

  return Buffer.from(raw.content.replace(/\n/g, ""), "base64").toString("utf8");
}

async function fetchOrThrow(
  url: string,
  context: SourceContext,
): Promise<Response> {
  const response = await fetch(url, {
    headers: buildHeaders(context),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}) for ${url}`);
  }

  return response;
}

export async function fetchGitHubJson<T>(
  url: string,
  context: SourceContext,
): Promise<T> {
  const rawFile = parseRawGitHubUrl(url);
  if (rawFile) {
    const text = await fetchRepoContent(
      rawFile.repo,
      rawFile.branch,
      rawFile.path,
      context,
    );
    return JSON.parse(text) as T;
  }

  const response = await fetchOrThrow(url, context);
  return (await response.json()) as T;
}

export async function fetchGitHubText(
  url: string,
  context: SourceContext,
): Promise<string> {
  const rawFile = parseRawGitHubUrl(url);
  if (rawFile) {
    return fetchRepoContent(rawFile.repo, rawFile.branch, rawFile.path, context);
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "SkillAtlas/1.0",
      ...(context.githubToken
        ? { Authorization: `Bearer ${context.githubToken}` }
        : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Text fetch failed (${response.status}) for ${url}`);
  }

  return response.text();
}

export async function fetchRepoMeta(
  repo: string,
  context: SourceContext,
): Promise<GitHubRepoMeta> {
  const raw = await fetchGitHubJson<{
    full_name: string;
    description: string | null;
    stargazers_count: number;
    pushed_at: string;
    default_branch: string;
    html_url: string;
  }>(`${API_BASE}/repos/${repo}`, context);

  return {
    fullName: raw.full_name,
    description: raw.description ?? "",
    stargazersCount: raw.stargazers_count,
    pushedAt: raw.pushed_at,
    defaultBranch: raw.default_branch,
    htmlUrl: raw.html_url,
  };
}

export async function fetchRepoTree(
  repo: string,
  branch: string,
  context: SourceContext,
): Promise<string[]> {
  const raw = await fetchGitHubJson<{
    tree: Array<{ path: string; type: string }>;
  }>(`${API_BASE}/repos/${repo}/git/trees/${branch}?recursive=1`, context);

  return raw.tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path);
}

export function repoFileUrl(repo: string, branch: string, path: string): string {
  return `https://github.com/${repo}/blob/${branch}/${path}`;
}

export function repoTreeUrl(repo: string, branch: string, path = ""): string {
  const normalizedPath = path ? `/${path}` : "";
  return `https://github.com/${repo}/tree/${branch}${normalizedPath}`;
}

export function rawGitHubUrl(repo: string, branch: string, path: string): string {
  return `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
}

export function parseGitHubRepo(url: string): string | null {
  const match = url.match(/github\.com\/([^/]+\/[^/#?]+)/i);
  return match ? match[1].replace(/\.git$/i, "") : null;
}

export function normalizeGitHubUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!/github\.com$/i.test(parsed.hostname)) {
      return null;
    }

    const segments = parsed.pathname
      .replace(/\/+$/g, "")
      .split("/")
      .filter(Boolean);

    if (segments.length < 2) {
      return null;
    }

    const repo = `${segments[0]}/${segments[1]}`.replace(/\.git$/i, "");
    const extraPath = segments.slice(2).join("/");
    return extraPath
      ? `https://github.com/${repo}/${extraPath}`
      : `https://github.com/${repo}`;
  } catch {
    return null;
  }
}

export function normalizeGitHubComparableUrl(url: string): string | null {
  const normalized = normalizeGitHubUrl(url);
  if (!normalized) {
    return null;
  }

  const parsed = new URL(normalized);
  const segments = parsed.pathname.split("/").filter(Boolean);
  const repo = `${segments[0]}/${segments[1]}`.toLowerCase();

  if (segments[2] === "tree" || segments[2] === "blob") {
    const path = segments.slice(4).join("/").toLowerCase();
    return path ? `github:${repo}/${path}` : `github:${repo}`;
  }

  const extraPath = segments.slice(2).join("/").toLowerCase();
  return extraPath ? `github:${repo}/${extraPath}` : `github:${repo}`;
}
