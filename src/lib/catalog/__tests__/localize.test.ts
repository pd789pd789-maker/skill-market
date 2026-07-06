import { buildSearchIndex } from "@/lib/catalog/normalize";
import type { CatalogEntry } from "@/lib/catalog/types";
import { localizeCatalogEntries } from "@/lib/catalog/localize";

describe("catalog localization", () => {
  it("converts English skill metadata into Chinese display content", () => {
    const entries: CatalogEntry[] = [
      {
        slug: "meeting-notes-and-actions",
        kind: "skill",
        title: "meeting-notes-and-actions",
        summary: "Extract action items from meetings and turn them into structured notes.",
        sourceRepo: "ComposioHQ/awesome-codex-skills",
        repoUrl: "https://github.com/ComposioHQ/awesome-codex-skills",
        downloadUrl:
          "https://github.com/ComposioHQ/awesome-codex-skills/tree/main/meeting-notes-and-actions",
        platforms: ["codex", "claude"],
        tags: ["meeting", "productivity"],
        officialStatus: "community",
        deprecated: false,
        stars: 10,
        updatedAt: "2026-07-01T00:00:00.000Z",
        installMethods: ["copy-folder"],
      },
    ];

    const [localized] = localizeCatalogEntries(entries);
    expect(localized.title).toContain("会议");
    expect(localized.title).toContain("行动项");
    expect(localized.summary).toContain("聚焦");
    expect(localized.description).toContain("当前来源于ComposioHQ/awesome-codex-skills");
    expect(localized.category).toBe("沟通与协作");
    expect(localized.originalTitle).toBe("meeting-notes-and-actions");
    expect(localized.originalSummary).toContain("Extract action items");
  });

  it("keeps Chinese summaries while enriching detail copy and search text", () => {
    const entries: CatalogEntry[] = [
      {
        slug: "docx",
        kind: "skill",
        title: "anthropics/docx",
        summary: "创建、编辑与分析 Word 文档的官方 Skill，适合文档自动化与报告整理。",
        sourceRepo: "anthropics/skills",
        repoUrl: "https://github.com/anthropics/skills",
        downloadUrl: "https://github.com/anthropics/skills/tree/main/skills/docx",
        platforms: ["claude"],
        tags: ["docs", "office"],
        officialStatus: "official",
        deprecated: false,
        stars: 20,
        updatedAt: "2026-07-01T00:00:00.000Z",
        installMethods: ["copy-folder"],
      },
    ];

    const [localized] = localizeCatalogEntries(entries);
    const [searchEntry] = buildSearchIndex([localized]);

    expect(localized.title).toContain("Word 文档");
    expect(localized.summary).toContain("Word 文档");
    expect(localized.description).toContain("Claude");
    expect(localized.category).toBe("文档与办公");
    expect(searchEntry.searchText).toContain("anthropics/docx");
    expect(searchEntry.searchText).toContain("word 文档");
  });
});
