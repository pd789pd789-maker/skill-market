import {
  INSTALL_METHOD_LABELS,
  KNOWN_CATEGORY_LABELS,
  PLATFORM_LABELS,
} from "@/lib/catalog/constants";
import type { CatalogEntry, CatalogKind, Platform } from "@/lib/catalog/types";

type CapabilityProfile = {
  id: string;
  patterns: string[];
  title: (kind: CatalogKind, brand?: string | null) => string;
  focus: string;
  outcome: string;
  scenario: string;
};

const COLLECTION_LOCALIZATION: Record<
  string,
  { title: string; summary: string; description: string }
> = {
  "sickn33/antigravity-awesome-skills": {
    title: "Antigravity 精选技能合集",
    summary:
      "汇总可直接安装的跨平台代理技能，是 Skill Atlas 首页重点展示的主来源之一。",
    description:
      "这个合集围绕可安装、可复用的技能能力展开，适合从一个仓库里快速发现高质量技能。它覆盖 Codex、Claude、Cursor、Gemini 等多种环境，便于统一比较和下载。当前来源于 sickn33/antigravity-awesome-skills，可直接进入原仓库继续筛选与安装。",
  },
  "VoltAgent/awesome-agent-skills": {
    title: "VoltAgent 智能体技能合集",
    summary:
      "聚合官方团队与社区维护的多平台代理技能，适合快速浏览真实可用的 Agent 能力。",
    description:
      "这个合集侧重多平台代理和真实团队维护的技能资源，适合用来做选型与能力补齐。你可以从中快速找到开发、测试、自动化与协作相关的常用技能。当前来源于 VoltAgent/awesome-agent-skills，适合直接跳转到原仓库继续探索。",
  },
  "ComposioHQ/awesome-codex-skills": {
    title: "Composio Codex 技能合集",
    summary:
      "聚焦 Codex 场景的实用技能目录，强调安装流程、自动化接入与真实工作流示例。",
    description:
      "这个合集主要服务 Codex 生态中的安装与自动化使用场景，便于快速挑选实战技能。它适合把会议、协作、开发与多代理流程连接成更完整的工作流。当前来源于 ComposioHQ/awesome-codex-skills，可继续在原仓库查看安装方式和示例。",
  },
  "anthropics/skills": {
    title: "Anthropic 官方技能合集",
    summary:
      "Anthropic 官方公开的 Skill 仓库，覆盖文档、前端、创作和常见 Claude 工作流。",
    description:
      "这个合集由 Anthropic 官方维护，适合需要稳定基础能力的 Claude 用户直接选用。它覆盖文档处理、创作辅助、页面实现和多类常见任务，适合作为官方能力底座。当前来源于 anthropics/skills，可通过复制目录方式接入原始技能仓库。",
  },
  "openai/plugins": {
    title: "OpenAI 官方插件合集",
    summary:
      "聚合 OpenAI 官方 Codex 插件，覆盖设计、建站、部署与工具集成等高频工作流。",
    description:
      "这个合集主要收录 OpenAI 官方插件形态的能力，适合在 Codex 中直接扩展工作流。它覆盖设计协作、建站开发、发布部署和多种第三方工具连接。当前来源于 openai/plugins，可通过插件市场或本地目录方式继续安装与启用。",
  },
  "openai/skills": {
    title: "OpenAI 历史技能合集",
    summary:
      "已弃用的 OpenAI Skills 历史来源，仅保留作生态背景说明，不进入主推荐榜单。",
    description:
      "这个合集属于历史兼容来源，主要用于解释早期技能形态和生态演进。它不会进入首页主榜单，但仍然保留作背景参考。当前来源于 openai/skills，使用前建议优先评估新的插件或技能实现。",
  },
};

const CAPABILITY_PROFILES: CapabilityProfile[] = [
  {
    id: "meeting-notes",
    patterns: ["meeting", "minutes", "notes", "actions", "follow-up"],
    title: () => "会议纪要与行动项技能",
    focus: "会议重点提炼、行动项整理与责任分工跟进",
    outcome: "快速生成结构化纪要、待办清单和后续追踪内容",
    scenario: "团队同步、客户沟通和项目复盘",
  },
  {
    id: "docx",
    patterns: ["docx", "word doc", "word document", "word"],
    title: () => "Word 文档处理技能",
    focus: "Word 文档创建、编辑与结构化整理",
    outcome: "更快完成报告编排、批注修改和文档自动化流程",
    scenario: "方案文档、交付报告和办公自动化",
  },
  {
    id: "documentation",
    patterns: ["documentation", "proposal", "spec", "decision doc", "coauthoring", "doc-coauthoring"],
    title: () => "文档协作写作技能",
    focus: "结构化文档撰写、提纲协作与内容迭代",
    outcome: "更快完成方案文档、技术规格和说明材料的协同编写",
    scenario: "方案撰写、技术规格和团队文档协作",
  },
  {
    id: "pptx",
    patterns: ["pptx", "powerpoint", "slides", "presentation", "deck"],
    title: () => "PPT 演示文稿技能",
    focus: "演示文稿生成、编辑和结构化排版",
    outcome: "更快整理汇报内容、页面结构和讲解材料",
    scenario: "项目汇报、培训材料和销售演示",
  },
  {
    id: "pdf",
    patterns: ["pdf", "form", "ocr"],
    title: () => "PDF 文档处理技能",
    focus: "PDF 提取、创建、表单处理与版面分析",
    outcome: "快速完成资料整理、文本提取和文件自动化处理",
    scenario: "合同资料、归档文件和法务文档场景",
  },
  {
    id: "spreadsheet",
    patterns: ["xlsx", "excel", "spreadsheet", "csv", "sheet"],
    title: () => "电子表格处理技能",
    focus: "表格读写、公式处理与数据整理",
    outcome: "更快完成 Excel、CSV 和报表型数据的清洗与结构化分析",
    scenario: "报表处理、运营数据和办公分析",
  },
  {
    id: "creative-design",
    patterns: [
      "algorithmic-art",
      "art",
      "canvas",
      "brand-guidelines",
      "branding",
      "theme",
      "theme-factory",
      "visual",
      "poster",
      "illustration",
    ],
    title: () => "视觉创意与品牌设计技能",
    focus: "视觉创意、品牌规范和静态设计产出",
    outcome: "更快完成海报、视觉稿、品牌风格与创意内容设计",
    scenario: "品牌表达、营销素材和静态视觉设计",
  },
  {
    id: "figma",
    patterns: ["figma", "design system", "code connect", "component library"],
    title: (kind) => (kind === "plugin" ? "Figma 设计协作插件" : "Figma 设计协作技能"),
    focus: "Figma 设计实现、组件映射和设计系统协作",
    outcome: "加快设计稿落地、Code Connect 对齐和设计资产维护",
    scenario: "设计交付、组件库维护和前端协作",
  },
  {
    id: "frontend",
    patterns: ["frontend", "next.js", "nextjs", "react", "web app", "landing page", "build web apps"],
    title: (kind) => (kind === "plugin" ? "前端建站插件" : "前端建站技能"),
    focus: "前端页面实现、交互搭建与 Web 应用交付",
    outcome: "更快完成页面开发、界面重构和上线前打磨",
    scenario: "官网搭建、后台界面和产品原型实现",
  },
  {
    id: "api-docs",
    patterns: ["api docs", "api documentation", "openapi", "swagger", "documentation"],
    title: () => "API 文档生成技能",
    focus: "接口说明、示例整理和文档结构生成",
    outcome: "更快产出清晰的 API 文档、字段解释和调用示例",
    scenario: "接口交付、对外集成和开发协作",
  },
  {
    id: "api-test",
    patterns: ["api test", "graphql", "grpc", "rest", "postman", "contract test"],
    title: () => "API 接口测试技能",
    focus: "REST、GraphQL 与 gRPC 接口测试和回归验证",
    outcome: "更快定位接口问题、补齐测试覆盖并稳定集成链路",
    scenario: "自动化测试、接口联调和回归验证",
  },
  {
    id: "api-integration",
    patterns: ["claude-api", "mcp", "sdk", "api", "integration"],
    title: () => "API 与集成技能",
    focus: "API 接入、MCP 连接与工具集成编排",
    outcome: "更快完成服务接入、接口调用与外部系统能力扩展",
    scenario: "平台集成、工具接入和开发自动化",
  },
  {
    id: "testing",
    patterns: ["unit test", "pytest", "jest", "vitest", "testing", "test generation"],
    title: () => "自动化测试技能",
    focus: "测试用例生成、测试结构优化与质量保障",
    outcome: "快速补齐边界场景、回归验证和自动化质量检查",
    scenario: "单元测试、回归测试和持续集成场景",
  },
  {
    id: "typescript",
    patterns: ["typescript", "type-safe", "type safety", "tsconfig"],
    title: () => "TypeScript 代码优化技能",
    focus: "TypeScript 类型设计、重构建议和性能敏感实现优化",
    outcome: "更快整理类型系统、修复约束问题并提升代码可维护性",
    scenario: "前端工程、Node 项目和类型体操场景",
  },
  {
    id: "python",
    patterns: ["python", "pytest", "pandas", "notebook"],
    title: () => "Python 开发技能",
    focus: "Python 代码生成、脚本补全与自动化处理",
    outcome: "更快完成脚本开发、测试补齐和数据处理辅助",
    scenario: "脚本自动化、后端服务和数据分析",
  },
  {
    id: "git",
    patterns: ["git", "commit", "branch", "merge", "github"],
    title: () => "Git 工作流助手",
    focus: "提交整理、分支协作与仓库变更管理",
    outcome: "更稳妥地完成提交规范化、冲突处理和仓库操作建议",
    scenario: "日常协作、版本管理和代码审查",
  },
  {
    id: "sql",
    patterns: ["sql", "postgres", "database", "query", "index", "schema"],
    title: () => "数据库与 SQL 技能",
    focus: "SQL 查询、索引优化与数据模型调整",
    outcome: "帮助你优化查询性能、梳理数据结构并减少数据库瓶颈",
    scenario: "数据分析、后端服务和报表查询",
  },
  {
    id: "cicd",
    patterns: ["ci/cd", "cicd", "pipeline", "github actions", "jenkins", "gitlab ci", "deploy"],
    title: () => "CI/CD 流水线技能",
    focus: "构建发布、流水线配置与自动部署流程",
    outcome: "更快生成持续集成配置、发布步骤和自动化校验链路",
    scenario: "工程发布、质量门禁和自动交付",
  },
  {
    id: "netlify",
    patterns: ["netlify", "hosting", "static site"],
    title: (kind) => (kind === "plugin" ? "Netlify 部署插件" : "Netlify 部署技能"),
    focus: "静态站点托管、构建发布与线上部署集成",
    outcome: "帮助你更快完成前端项目发布和托管接入",
    scenario: "静态站点、营销页和前端交付",
  },
  {
    id: "browser",
    patterns: ["browser", "chrome", "playwright", "web automation", "scrape"],
    title: () => "浏览器自动化技能",
    focus: "浏览器控制、页面检查与网页自动化操作",
    outcome: "更快完成页面测试、交互验证和网页流程自动化",
    scenario: "前端测试、数据采集和网页操作辅助",
  },
  {
    id: "multi-agent",
    patterns: ["multi-agent", "multi agent", "worktree", "parallel agents", "subagent"],
    title: () => "多代理协作技能",
    focus: "多代理分工、并行执行与隔离工作流协作",
    outcome: "帮助你在复杂任务中拆分子流程并提升执行吞吐",
    scenario: "复杂开发任务、批量处理和协同自动化",
  },
  {
    id: "communications",
    patterns: ["internal-comms", "newsletter", "faq", "status report", "leadership update", "incident report", "communications"],
    title: () => "内部沟通写作技能",
    focus: "内部沟通文案、状态同步与团队更新内容整理",
    outcome: "更快完成周报、更新说明、FAQ 和内部通知等写作任务",
    scenario: "团队同步、管理汇报和组织内部沟通",
  },
  {
    id: "skill-creator",
    patterns: ["skill creator", "skill-creator", "template", "scaffold"],
    title: () => "Skill 创建助手",
    focus: "Skill 模板搭建、说明编写与结构化封装",
    outcome: "更快创建新的技能包并统一维护说明与能力边界",
    scenario: "内部能力沉淀、模板复用和技能工程化",
  },
  {
    id: "security",
    patterns: ["security", "audit", "compliance", "vulnerability"],
    title: () => "安全审计技能",
    focus: "风险识别、权限审查与合规检查",
    outcome: "帮助你发现潜在安全问题并输出更可执行的修复建议",
    scenario: "上线前审查、安全巡检和合规自查",
  },
  {
    id: "content",
    patterns: ["image", "video", "avatar", "content", "copywriting", "media"],
    title: () => "内容生成与多媒体技能",
    focus: "图文素材、视频脚本与多媒体生成辅助",
    outcome: "更快完成内容创作、素材整理和生成式工作流衔接",
    scenario: "营销内容、讲解视频和创意生产",
  },
  {
    id: "automation",
    patterns: ["automation", "workflow", "productivity", "assistant", "helper"],
    title: () => "自动化工作流技能",
    focus: "重复任务自动化、流程串联与效率提升",
    outcome: "帮助你减少手动操作并把常见任务沉淀为可复用流程",
    scenario: "日常办公、团队协作和工程自动化",
  },
];

const TOKEN_DICTIONARY: Record<string, string> = {
  actions: "行动项",
  agent: "智能体",
  api: "API 接口",
  assistant: "助手",
  audit: "审计",
  automation: "自动化",
  browser: "浏览器",
  build: "构建",
  ci: "持续集成",
  cicd: "CI/CD",
  claude: "Claude",
  code: "代码",
  codex: "Codex",
  content: "内容",
  creator: "创建器",
  cursor: "Cursor",
  data: "数据",
  database: "数据库",
  deploy: "部署",
  deployment: "部署",
  design: "设计",
  docs: "文档",
  docx: "Word 文档",
  figma: "Figma",
  frontend: "前端",
  generator: "生成器",
  gemini: "Gemini",
  git: "Git",
  github: "GitHub",
  image: "图像",
  integration: "集成",
  meeting: "会议",
  multi: "多",
  notes: "纪要",
  optimize: "优化",
  optimizer: "优化器",
  pdf: "PDF 文档",
  plugin: "插件",
  plugins: "插件",
  powerpoint: "PPT 演示文稿",
  pptx: "PPT 演示文稿",
  python: "Python",
  query: "查询",
  react: "React",
  release: "发布",
  rest: "REST",
  review: "审查",
  security: "安全",
  skill: "技能",
  skills: "技能",
  slides: "演示文稿",
  sql: "SQL",
  test: "测试",
  testing: "测试",
  typescript: "TypeScript",
  unit: "单元",
  video: "视频",
  web: "Web",
  workflow: "工作流",
  word: "Word 文档",
};

const EMBEDDED_GLOSSARY: Array<[RegExp, string]> = [
  [/\bSkills\b/g, "技能"],
  [/\bSkill\b/g, "技能"],
  [/\bskills\b/g, "技能"],
  [/\bskill\b/g, "技能"],
  [/\bPlugins\b/g, "插件"],
  [/\bPlugin\b/g, "插件"],
  [/\bplugins\b/g, "插件"],
  [/\bplugin\b/g, "插件"],
  [/\bworkflow\b/gi, "工作流"],
  [/\bworkflows\b/gi, "工作流"],
  [/\bagent\b/gi, "智能体"],
  [/\bagents\b/gi, "智能体"],
  [/\bfrontend\b/gi, "前端"],
  [/\bbackend\b/gi, "后端"],
  [/\bdeployment\b/gi, "部署"],
  [/\btesting\b/gi, "测试"],
  [/\bdocumentation\b/gi, "文档"],
];

function normalizeForMatch(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9/+.-]+/g, " ");
}

function hasChinese(input: string): boolean {
  return /[\u4e00-\u9fff]/.test(input);
}

function localizeEmbeddedEnglish(input: string): string {
  return EMBEDDED_GLOSSARY.reduce((current, [pattern, replacement]) => {
    return current.replace(pattern, replacement);
  }, input)
    .replace(/\s+/g, " ")
    .trim();
}

function pickBrand(rawTitle: string, sourceRepo: string): string | null {
  const explicitBrand = rawTitle.trim().match(/^[A-Z][A-Za-z0-9.+-]*(?:\s+[A-Z][A-Za-z0-9.+-]*)?$/);
  if (explicitBrand) {
    return explicitBrand[0];
  }

  const lastSegment = sourceRepo.split("/")[0];
  const normalized = lastSegment
    .replace(/-ai$/i, "")
    .replace(/hq$/i, "HQ")
    .replace(/^openai$/i, "OpenAI")
    .replace(/^anthropics$/i, "Anthropic");

  if (/^(openai|anthropic)$/i.test(normalized)) {
    return normalized;
  }

  return null;
}

function buildProfileTitle(
  entry: CatalogEntry,
  profile: CapabilityProfile,
  brand: string | null,
): string {
  const title = profile.title(entry.kind, brand);
  if (brand && !title.toLowerCase().includes(brand.toLowerCase()) && profile.id === "multi-agent") {
    return `${brand} ${title}`;
  }
  return title;
}

function matchProfile(entry: CatalogEntry): CapabilityProfile | null {
  const titleHaystack = normalizeForMatch(
    [
      entry.title,
      entry.originalTitle,
      entry.path,
      entry.sourceRepo,
      ...entry.tags,
    ]
      .filter(Boolean)
      .join(" "),
  );
  const summaryHaystack = normalizeForMatch(
    [entry.summary, entry.originalSummary].filter(Boolean).join(" "),
  );

  let best: CapabilityProfile | null = null;
  let bestScore = 0;

  for (const profile of CAPABILITY_PROFILES) {
    const titleScore = profile.patterns.reduce((count, pattern) => {
      return count + (titleHaystack.includes(pattern) ? 4 : 0);
    }, 0);
    const summaryScore = profile.patterns.reduce((count, pattern) => {
      return count + (summaryHaystack.includes(pattern) ? 1 : 0);
    }, 0);
    const score = titleScore + summaryScore;

    if (score > bestScore) {
      best = profile;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : null;
}

function inferGenericCategory(entry: CatalogEntry): string {
  const haystack = normalizeForMatch(
    [entry.title, entry.summary, ...entry.tags].join(" "),
  );

  for (const [key, label] of Object.entries(KNOWN_CATEGORY_LABELS)) {
    if (haystack.includes(key)) {
      return label;
    }
  }

  if (haystack.includes("official")) {
    return "官方能力";
  }

  if (haystack.includes("workflow") || haystack.includes("automation")) {
    return "自动化工作流";
  }

  return "通用自动化";
}

function buildFallbackTitle(entry: CatalogEntry): string {
  const category = inferGenericCategory(entry);
  const brand = pickBrand(entry.title, entry.sourceRepo);
  const suffix =
    entry.kind === "plugin"
      ? "插件"
      : entry.kind === "collection"
        ? "合集"
        : "技能";

  if (brand) {
    return `${brand} ${category}${suffix}`;
  }

  const lastSegment =
    entry.title.split("/").pop()?.split(/[-_ ]+/).filter(Boolean) ?? [];
  const translated = lastSegment
    .map((token) => TOKEN_DICTIONARY[token.toLowerCase()] ?? token.toUpperCase())
    .slice(0, 3)
    .join(" ");

  if (translated && hasChinese(translated)) {
    return `${translated}${suffix}`;
  }

  return `${category}${suffix}`;
}

function formatPlatforms(platforms: Platform[]): string {
  const labels = platforms.map((platform) => PLATFORM_LABELS[platform]);
  if (labels.length === 0) {
    return "常见 Agent 环境";
  }
  if (labels.length <= 2) {
    return labels.join(" 和 ");
  }
  return `${labels.slice(0, 2).join("、")} 等环境`;
}

function formatInstallMethods(methods: CatalogEntry["installMethods"]): string {
  const labels = methods.map((method) => INSTALL_METHOD_LABELS[method]);
  if (labels.length === 0) {
    return "原始仓库中的默认安装方式";
  }
  if (labels.length === 1) {
    return labels[0];
  }
  return labels.join("、");
}

function normalizeScenario(scenario: string): string {
  return scenario.endsWith("场景") ? scenario : `${scenario}场景`;
}

function buildLocalizedSummary(
  entry: CatalogEntry,
  profile: CapabilityProfile | null,
  originalSummary: string,
): string {
  if (hasChinese(originalSummary)) {
    return localizeEmbeddedEnglish(originalSummary);
  }

  if (profile) {
    return `聚焦${profile.focus}，帮助你${profile.outcome}。`;
  }

  return `这是一个面向${formatPlatforms(entry.platforms)}的${entry.kind === "plugin" ? "插件" : "技能"}，适合补齐${inferGenericCategory(entry)}相关工作流。`;
}

function buildLocalizedDescription(
  entry: CatalogEntry,
  profile: CapabilityProfile | null,
  summary: string,
  originalSummary: string,
): string {
  const sentences: string[] = [];

  if (hasChinese(originalSummary)) {
    sentences.push(localizeEmbeddedEnglish(originalSummary));
  } else if (profile) {
    const kindLabel = entry.kind === "plugin" ? "插件" : "技能";
    sentences.push(`这个${kindLabel}主要围绕${profile.focus}展开，可帮助你${profile.outcome}。`);
  } else {
    sentences.push(summary);
  }

  if (profile) {
    sentences.push(
      `它更适合${normalizeScenario(profile.scenario)}，在${formatPlatforms(entry.platforms)}里可以作为高频工作流能力使用。`,
    );
  } else {
    sentences.push(
      `它更适合${inferGenericCategory(entry)}场景，可在${formatPlatforms(entry.platforms)}中承担常见自动化任务。`,
    );
  }

  sentences.push(
    `当前来源于${entry.sourceRepo}，可通过${formatInstallMethods(entry.installMethods)}接入原始仓库并继续扩展。`,
  );

  return [...new Set(sentences.map((sentence) => sentence.trim()).filter(Boolean))].join("");
}

function localizeCollectionEntry(entry: CatalogEntry): CatalogEntry {
  const sourceSummary = entry.originalSummary ?? entry.summary;
  const preset = COLLECTION_LOCALIZATION[entry.sourceRepo];
  const localizedTitle = preset?.title ?? localizeEmbeddedEnglish(entry.title);
  const localizedSummary =
    preset?.summary ??
    (hasChinese(sourceSummary)
      ? localizeEmbeddedEnglish(sourceSummary)
      : `这是来自 ${entry.sourceRepo} 的技能合集，适合集中浏览相关能力与安装入口。`);
  const description =
    preset?.description ??
    `${localizedSummary} 它支持你按平台、来源和类型集中比较不同能力。当前可通过${formatInstallMethods(entry.installMethods)}继续跳转到原仓库浏览。`;

  return {
    ...entry,
    title: localizedTitle,
    summary: localizedSummary,
    description,
    originalTitle: localizedTitle === entry.title ? entry.originalTitle : entry.title,
    originalSummary:
      localizedSummary === sourceSummary ? entry.originalSummary : sourceSummary,
  };
}

function localizeSkillLikeEntry(entry: CatalogEntry): CatalogEntry {
  const originalTitle = entry.originalTitle ?? entry.title;
  const originalSummary = entry.originalSummary ?? entry.summary;

  const profile = matchProfile({
    ...entry,
    title: originalTitle,
    summary: originalSummary,
  });
  const brand = pickBrand(originalTitle, entry.sourceRepo);

  const localizedTitle = hasChinese(originalTitle)
    ? localizeEmbeddedEnglish(originalTitle)
    : profile
      ? buildProfileTitle(entry, profile, brand)
      : buildFallbackTitle(entry);

  const localizedSummary = buildLocalizedSummary(entry, profile, originalSummary);
  const description = buildLocalizedDescription(
    entry,
    profile,
    localizedSummary,
    originalSummary,
  );

  return {
    ...entry,
    title: localizedTitle,
    summary: localizedSummary,
    description,
    originalTitle: localizedTitle === originalTitle ? entry.originalTitle : originalTitle,
    originalSummary:
      localizedSummary === originalSummary ? entry.originalSummary : originalSummary,
  };
}

export function localizeCatalogEntries(entries: CatalogEntry[]): CatalogEntry[] {
  return entries.map((entry) => {
    if (entry.kind === "collection") {
      return localizeCollectionEntry(entry);
    }
    return localizeSkillLikeEntry(entry);
  });
}
