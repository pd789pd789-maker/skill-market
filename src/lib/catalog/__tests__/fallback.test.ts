import { createCatalogMeta } from "@/lib/catalog/normalize";
import {
  createFallbackStatus,
  filterFallbackEntries,
} from "@/lib/catalog/fallback";
import type { CatalogEntry } from "@/lib/catalog/types";

const snapshot: CatalogEntry[] = [
  {
    slug: "fallback-entry",
    kind: "skill",
    title: "Fallback Entry",
    summary: "Snapshot copy",
    sourceRepo: "example/repo",
    repoUrl: "https://github.com/example/repo",
    downloadUrl: "https://github.com/example/repo/tree/main/skills/fallback-entry",
    platforms: ["codex"],
    tags: ["testing"],
    officialStatus: "community",
    deprecated: false,
    stars: 10,
    updatedAt: "2026-07-01T00:00:00.000Z",
    installMethods: ["copy-folder"],
  },
];

describe("catalog fallback handling", () => {
  it("finds last-known-good snapshot entries per source", () => {
    expect(filterFallbackEntries(snapshot, "example/repo")).toHaveLength(1);
  });

  it("marks meta as stale when any source falls back", () => {
    const meta = createCatalogMeta("2026-07-06T00:00:00.000Z", [
      createFallbackStatus({
        id: "adapter",
        label: "Adapter",
        sourceRepo: "example/repo",
        updatedAt: "2026-07-06T00:00:00.000Z",
        error: new Error("404"),
        entries: snapshot,
      }),
    ]);

    expect(meta.stale).toBe(true);
    expect(meta.warning).toContain("回退");
  });
});
