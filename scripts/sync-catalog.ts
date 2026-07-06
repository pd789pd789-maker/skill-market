import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createFallbackStatus,
  filterFallbackEntries,
} from "../src/lib/catalog/fallback";
import { buildSearchIndex, createCatalogMeta, dedupeEntries } from "../src/lib/catalog/normalize";
import { SOURCE_ADAPTERS } from "../src/lib/catalog/source-adapters";
import type {
  CatalogEntry,
  CatalogMeta,
  CatalogSourceStatus,
  SourceAdapter,
  SourceContext,
} from "../src/lib/catalog/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedDir = path.resolve(__dirname, "../src/generated");
const fullCatalogPath = path.join(generatedDir, "catalog-full.json");
const searchCatalogPath = path.join(generatedDir, "catalog-search.json");
const metaCatalogPath = path.join(generatedDir, "catalog-meta.json");

async function readJson<T>(targetPath: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(targetPath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

async function loadFallbackEntries(): Promise<CatalogEntry[]> {
  return readJson<CatalogEntry[]>(fullCatalogPath, []);
}

async function run(): Promise<void> {
  await mkdir(generatedDir, { recursive: true });

  const generatedAt = new Date().toISOString();
  const context: SourceContext = {
    now: generatedAt,
    githubToken: process.env.GITHUB_TOKEN,
  };

  const fallbackEntries = await loadFallbackEntries();
  const nextEntries: CatalogEntry[] = [];
  const sourceStatuses: CatalogSourceStatus[] = [];

  for (const adapter of SOURCE_ADAPTERS as SourceAdapter[]) {
    try {
      const raw = await adapter.fetch(context);
      const normalized = await adapter.normalize(raw, context);
      const validated = adapter.validate(normalized);
      nextEntries.push(...validated);
      sourceStatuses.push({
        id: adapter.id,
        label: adapter.label,
        sourceRepo: adapter.sourceRepo,
        entryCount: validated.length,
        status: "fresh",
        updatedAt: generatedAt,
      });
    } catch (error) {
      const fallback = filterFallbackEntries(fallbackEntries, adapter.sourceRepo);
      if (fallback.length > 0) {
        nextEntries.push(...fallback);
      }
      sourceStatuses.push(
        createFallbackStatus({
          id: adapter.id,
          label: adapter.label,
          sourceRepo: adapter.sourceRepo,
          updatedAt: generatedAt,
          error,
          entries: fallback,
        }),
      );
    }
  }

  const deduped = dedupeEntries(nextEntries);

  if (deduped.length === 0) {
    throw new Error("Catalog sync produced zero entries and no fallback snapshot was available.");
  }

  const meta: CatalogMeta = createCatalogMeta(generatedAt, sourceStatuses);
  const searchIndex = buildSearchIndex(deduped);

  await Promise.all([
    writeFile(fullCatalogPath, `${JSON.stringify(deduped, null, 2)}\n`, "utf8"),
    writeFile(searchCatalogPath, `${JSON.stringify(searchIndex, null, 2)}\n`, "utf8"),
    writeFile(metaCatalogPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8"),
  ]);

  const freshCount = sourceStatuses.filter((source) => source.status === "fresh").length;
  const fallbackCount = sourceStatuses.length - freshCount;
  console.log(
    `Skill Atlas catalog synced: ${deduped.length} entries from ${freshCount} fresh source(s)` +
      (fallbackCount > 0 ? `, ${fallbackCount} fallback source(s)` : ""),
  );
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
