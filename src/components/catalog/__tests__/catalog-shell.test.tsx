import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import type { CatalogEntry, CatalogMeta, SearchEntry } from "@/lib/catalog/types";

const collections: CatalogEntry[] = [
  {
    slug: "antigravity-awesome-skills",
    kind: "collection",
    title: "Antigravity Awesome Skills",
    summary: "Collection",
    sourceRepo: "sickn33/antigravity-awesome-skills",
    repoUrl: "https://github.com/sickn33/antigravity-awesome-skills",
    downloadUrl: "https://github.com/sickn33/antigravity-awesome-skills",
    platforms: ["codex", "claude", "cursor", "gemini", "multi-agent"],
    tags: ["awesome"],
    officialStatus: "curated",
    deprecated: false,
    stars: 42,
    updatedAt: "2026-07-06T00:00:00.000Z",
    installMethods: ["copy-folder"],
  },
];

const entries: SearchEntry[] = [
  {
    slug: "alpha",
    kind: "skill",
    title: "Alpha Skill",
    summary: "Testing helper",
    sourceRepo: "sickn33/antigravity-awesome-skills",
    downloadUrl: "https://github.com/repo/alpha",
    platforms: ["codex", "cursor"],
    tags: ["testing"],
    officialStatus: "community",
    deprecated: false,
    stars: 42,
    updatedAt: "2026-07-04T00:00:00.000Z",
    installMethods: ["copy-folder"],
    searchText: "alpha skill testing helper codex cursor",
  },
  {
    slug: "beta",
    kind: "skill",
    title: "Beta Skill",
    summary: "Docs helper",
    sourceRepo: "anthropics/skills",
    downloadUrl: "https://github.com/repo/beta",
    platforms: ["claude"],
    tags: ["docs"],
    officialStatus: "official",
    deprecated: false,
    stars: 21,
    updatedAt: "2026-07-03T00:00:00.000Z",
    installMethods: ["copy-folder"],
    searchText: "beta skill docs helper claude",
  },
];

const meta: CatalogMeta = {
  generatedAt: "2026-07-06T00:00:00.000Z",
  stale: false,
  sources: [],
};

describe("CatalogShell", () => {
  it("filters results with the search box", async () => {
    const user = userEvent.setup();
    render(
      <CatalogShell
        variant="catalog"
        entries={entries}
        collections={collections}
        meta={meta}
      />,
    );

    expect(screen.getAllByText("Alpha Skill").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Beta Skill").length).toBeGreaterThan(0);

    await user.type(
      screen.getAllByPlaceholderText("搜索技能名称、功能或关键词...")[0],
      "Alpha",
    );

    expect(screen.getAllByText("Alpha Skill").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Beta Skill")).toHaveLength(0);
  });
});
