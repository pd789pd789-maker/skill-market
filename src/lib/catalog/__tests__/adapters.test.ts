import {
  antigravityAdapter,
  anthropicsAdapter,
  openaiPluginsAdapter,
  voltAgentAdapter,
} from "@/lib/catalog/source-adapters";

describe("catalog source adapters", () => {
  it("normalizes a JSON index source", async () => {
    const entries = await antigravityAdapter.normalize({
      meta: {
        fullName: "sickn33/antigravity-awesome-skills",
        description: "JSON catalog",
        stargazersCount: 42,
        pushedAt: "2026-07-06T00:00:00.000Z",
        defaultBranch: "main",
        htmlUrl: "https://github.com/sickn33/antigravity-awesome-skills",
      },
      items: [
        {
          id: "test-skill",
          path: "skills/test-skill",
          category: "testing",
          name: "Test Skill",
          description: "Does a thing",
          source: "community",
          date_added: "2026-07-01",
          plugin: {
            targets: { codex: "supported", claude: "supported" },
            setup: { type: "script" },
          },
        },
      ],
    });

    expect(entries).toHaveLength(2);
    expect(entries[1]).toMatchObject({
      slug: "test-skill",
      sourceRepo: "sickn33/antigravity-awesome-skills",
      platforms: ["codex", "claude"],
    });
  });

  it("normalizes manifest skill sources", async () => {
    const entries = await anthropicsAdapter.normalize({
      meta: {
        fullName: "anthropics/skills",
        description: "Official skills",
        stargazersCount: 0,
        pushedAt: "2026-07-06T00:00:00.000Z",
        defaultBranch: "main",
        htmlUrl: "https://github.com/anthropics/skills",
      },
      branch: "main",
      files: [
        {
          path: "skills/docx/SKILL.md",
          text: `---\nname: docx\ndescription: Edit docs\n---\n# Docx`,
        },
      ],
    });

    expect(entries).toHaveLength(2);
    expect(entries[1]).toMatchObject({
      slug: "docx",
      title: "docx",
      sourceRepo: "anthropics/skills",
      platforms: ["claude"],
    });
  });

  it("normalizes manifest plugin sources", async () => {
    const entries = await openaiPluginsAdapter.normalize({
      meta: {
        fullName: "openai/plugins",
        description: "Plugin examples",
        stargazersCount: 0,
        pushedAt: "2026-07-06T00:00:00.000Z",
        defaultBranch: "main",
        htmlUrl: "https://github.com/openai/plugins",
      },
      branch: "main",
      files: [
        {
          path: "plugins/figma/.codex-plugin/plugin.json",
          text: JSON.stringify({
            name: "figma",
            description: "Design plugin",
            keywords: ["design", "figma"],
            interface: { displayName: "Figma" },
          }),
        },
      ],
    });

    expect(entries).toHaveLength(3);
    expect(entries[2]).toMatchObject({
      slug: "figma",
      kind: "plugin",
      title: "Figma",
      sourceRepo: "openai/plugins",
    });
  });

  it("parses README based entries with GitHub links only", async () => {
    const entries = await voltAgentAdapter.normalize({
      meta: {
        fullName: "VoltAgent/awesome-agent-skills",
        description: "Awesome list",
        stargazersCount: 100,
        pushedAt: "2026-07-06T00:00:00.000Z",
        defaultBranch: "main",
        htmlUrl: "https://github.com/VoltAgent/awesome-agent-skills",
      },
      readme: `## Skills by TestMu AI\n- **[testmu-ai/api-skill](https://github.com/LambdaTest/agent-skills/tree/main/api-skill)** - API testing skill\n- **[anthropics/docx](https://officialskills.sh/anthropics/skills/docx)** - should be skipped`,
    });

    expect(entries).toHaveLength(2);
    expect(entries[1]).toMatchObject({
      slug: "voltagent-awesome-agent-skills-testmu-ai-api-skill",
      sourceRepo: "VoltAgent/awesome-agent-skills",
      repoUrl: "https://github.com/LambdaTest/agent-skills",
    });
  });
});
