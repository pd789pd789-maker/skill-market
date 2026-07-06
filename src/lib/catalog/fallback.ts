import type { CatalogEntry, CatalogSourceStatus } from "@/lib/catalog/types";

export function filterFallbackEntries(
  entries: CatalogEntry[],
  sourceRepo: string,
): CatalogEntry[] {
  return entries.filter((entry) => entry.sourceRepo === sourceRepo);
}

export function createFallbackStatus(options: {
  id: string;
  label: string;
  sourceRepo: string;
  updatedAt: string;
  error: unknown;
  entries: CatalogEntry[];
}): CatalogSourceStatus {
  return {
    id: options.id,
    label: options.label,
    sourceRepo: options.sourceRepo,
    entryCount: options.entries.length,
    status: "fallback",
    updatedAt: options.updatedAt,
    error:
      options.error instanceof Error ? options.error.message : String(options.error),
  };
}
