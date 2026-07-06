import type { GitHubRepoMeta, SourceContext } from "@/lib/catalog/types";

const API_BASE = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 5_000;

function buildHeaders(context: SourceContext): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "SkillAtlas/1.0",
    ...(context.githubToken
      ? { Authorization: `Bearer ${context.githubToken}` }
      : {}),
  };
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
  const response = await fetchOrThrow(url, context);
  return (await response.json()) as T;
}

export async function fetchGitHubText(
  url: string,
  context: SourceContext,
): Promise<string> {
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
