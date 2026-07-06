import type {
  CatalogKind,
  InstallMethod,
  OfficialStatus,
  Platform,
} from "@/lib/catalog/types";

export const PLATFORM_LABELS: Record<Platform, string> = {
  codex: "Codex",
  claude: "Claude",
  cursor: "Cursor",
  gemini: "Gemini",
  "multi-agent": "多平台代理",
};

export const KIND_LABELS: Record<CatalogKind, string> = {
  skill: "Skill",
  plugin: "Plugin",
  collection: "合集",
};

export const INSTALL_METHOD_LABELS: Record<InstallMethod, string> = {
  "copy-folder": "复制到本地目录",
  "installer-script": "脚本安装",
  "plugin-marketplace": "插件市场",
  "github-release": "GitHub Release",
};

export const INSTALL_METHOD_DESCRIPTIONS: Record<InstallMethod, string> = {
  "copy-folder": "直接复制 skill 文件夹到本地配置目录，适合 Anthropic 和通用技能库。",
  "installer-script": "通过 `npx`、`python` 或仓库提供的安装脚本快速启用。",
  "plugin-marketplace": "适合 Codex 插件形态，通过插件清单或市场入口安装。",
  "github-release": "优先使用 release 包或仓库发布页，适合版本化交付。",
};

export const OFFICIAL_STATUS_LABELS: Record<OfficialStatus, string> = {
  official: "官方",
  community: "社区",
  curated: "精选",
  deprecated: "已弃用",
};

export const SOURCE_ACCENT: Record<string, string> = {
  "sickn33/antigravity-awesome-skills": "from-sky-500/12 to-cyan-500/12",
  "VoltAgent/awesome-agent-skills": "from-blue-500/12 to-indigo-500/12",
  "ComposioHQ/awesome-codex-skills": "from-emerald-500/12 to-teal-500/12",
  "anthropics/skills": "from-orange-500/12 to-amber-500/12",
  "openai/plugins": "from-slate-800/8 to-cyan-500/10",
};

export const KNOWN_CATEGORY_LABELS: Record<string, string> = {
  productivity: "开发效率",
  development: "开发效率",
  coding: "代码生成",
  code: "代码生成",
  analysis: "代码分析",
  testing: "测试与质量",
  docs: "文档与知识",
  knowledge: "文档与知识",
  data: "数据与模型",
  model: "数据与模型",
  deployment: "运维与部署",
  devops: "运维与部署",
  design: "设计与内容",
  content: "设计与内容",
  office: "生产力工具",
  workspace: "生产力工具",
  security: "安全与审计",
};

export const HOME_NAV_ITEMS = [
  { label: "发现高质量 Skill", href: "/#discover" },
  { label: "全部技能", href: "/skills" },
  { label: "兼容性", href: "/#compatibility" },
  { label: "安装方式", href: "/#install" },
  { label: "最近更新", href: "/#recent" },
];

export const DEFAULT_FILTERS = {
  query: "",
  platforms: [] as Platform[],
  tag: null,
  sourceRepo: null,
  kind: "all" as const,
  freshness: "all" as const,
};

export const FEATURED_SOURCE_REPO = "sickn33/antigravity-awesome-skills";
