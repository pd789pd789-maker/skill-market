import { dedupeEntries, getTopCollections } from "@/lib/catalog/normalize";
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
    });
  });

  it("sorts top collections by repository stars", () => {
    const collections = getTopCollections(sampleEntries);
    expect(collections[0].slug).toBe("collection");
  });
});
