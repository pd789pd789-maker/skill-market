import {
  dedupeEntries,
  ensureUniqueSlugs,
  filterSearchEntries,
  getTopCollections,
} from "@/lib/catalog/normalize";
import type { CatalogEntry } from "@/lib/catalog/types";

const sampleEntries: CatalogEntry[] = [
  {
    slug: "a",
    kind: "skill",
    title: "Alpha",
    summary: "Community version",
    sourceRepo: "repo/a",
    repoUrl: "https://github.com/repo/a",
    downloadUrl: "https://github.com/repo/a/tree/main/skills/alpha",
    platforms: ["codex"],
    tags: ["testing"],
    officialStatus: "community",
    deprecated: false,
    stars: 10,
    updatedAt: "2026-07-01T00:00:00.000Z",
    installMethods: ["copy-folder"],
    canonicalId: "github:repo/a/skills/alpha",
    sourceRepos: ["repo/a"],
  },
  {
    slug: "a-official",
    kind: "skill",
    title: "Alpha",
    summary: "Official version",
    sourceRepo: "repo/b",
    repoUrl: "https://github.com/repo/b",
    downloadUrl: "https://github.com/repo/a/tree/main/skills/alpha",
    platforms: ["codex", "cursor"],
    tags: ["analysis"],
    officialStatus: "official",
    deprecated: false,
    stars: 20,
    updatedAt: "2026-07-02T00:00:00.000Z",
    installMethods: ["plugin-marketplace"],
    canonicalId: "github:repo/a/skills/alpha",
    sourceRepos: ["repo/b"],
  },
  {
    slug: "collection",
    kind: "collection",
    title: "Collection",
    summary: "Top collection",
    sourceRepo: "repo/c",
    repoUrl: "https://github.com/repo/c",
    downloadUrl: "https://github.com/repo/c",
    platforms: ["codex"],
    tags: ["catalog"],
    officialStatus: "curated",
    deprecated: false,
    stars: 50,
    updatedAt: "2026-07-03T00:00:00.000Z",
    installMethods: ["copy-folder"],
  },
];

describe("catalog aggregation", () => {
  it("deduplicates entries while preserving stronger metadata", () => {
    const deduped = dedupeEntries(sampleEntries);
    expect(deduped).toHaveLength(2);
    expect(deduped[1]).toMatchObject({
      title: "Alpha",
      officialStatus: "official",
      platforms: ["codex", "cursor"],
      installMethods: ["copy-folder", "plugin-marketplace"],
      sourceRepos: ["repo/a", "repo/b"],
    });
  });

  it("sorts top collections by repository stars", () => {
    const collections = getTopCollections(sampleEntries);
    expect(collections[0].slug).toBe("collection");
  });

  it("merges likely mirror entries even when canonical ids are missing", () => {
    const deduped = dedupeEntries([
      {
        ...sampleEntries[0],
        slug: "algorithmic-art",
        title: "算法 艺术技能",
        originalTitle: "algorithmic-art",
        canonicalId: undefined,
        downloadUrl: "https://github.com/anthropics/skills/tree/main/skills/algorithmic-art",
      },
      {
        ...sampleEntries[1],
        slug: "algorithmic-art",
        title: "算法 艺术技能",
        originalTitle: "algorithmic-art",
        canonicalId: undefined,
        downloadUrl:
          "https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/algorithmic-art",
      },
    ]);

    expect(deduped).toHaveLength(1);
    expect(deduped[0].sourceRepos).toEqual(["repo/a", "repo/b"]);
  });

  it("resolves slug conflicts across different catalog entities", () => {
    const entries = ensureUniqueSlugs([
      {
        ...sampleEntries[0],
        slug: "remotion",
        kind: "skill",
        title: "Remotion Skill",
        canonicalId: "github:community/remotion",
      },
      {
        ...sampleEntries[1],
        slug: "remotion",
        kind: "plugin",
        title: "Remotion Plugin",
        canonicalId: "github:openai/plugins/remotion",
      },
    ]);

    expect(new Set(entries.map((entry) => entry.slug)).size).toBe(2);
    expect(entries.some((entry) => entry.slug === "remotion")).toBe(true);
    expect(entries.some((entry) => entry.slug !== "remotion")).toBe(true);
  });

  it("filters by normalized Chinese category instead of raw tags", () => {
    const filtered = filterSearchEntries(
      [
        {
          slug: "figma",
          kind: "plugin",
          title: "Figma 设计协作插件",
          summary: "Design plugin",
          description: "Help with Figma workflows",
          category: "设计与内容",
          sourceRepo: "openai/plugins",
          sourceRepos: ["openai/plugins"],
          downloadUrl: "https://github.com/openai/plugins/tree/main/plugins/figma",
          platforms: ["codex"],
          tags: ["figma", "design-system"],
          officialStatus: "official",
          deprecated: false,
          stars: 10,
          updatedAt: "2026-07-06T00:00:00.000Z",
          installMethods: ["plugin-marketplace"],
          searchText: "figma design plugin",
        },
      ],
      {
        query: "",
        platforms: [],
        tag: "设计与内容",
        sourceRepo: null,
        kind: "all",
        freshness: "all",
      },
    );

    expect(filtered).toHaveLength(1);
  });
});
