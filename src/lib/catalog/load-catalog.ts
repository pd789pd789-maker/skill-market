import fullCatalog from "@/generated/catalog-full.json";
import catalogMeta from "@/generated/catalog-meta.json";
import searchIndex from "@/generated/catalog-search.json";
import type {
  CatalogEntry,
  CatalogMeta,
  SearchEntry,
} from "@/lib/catalog/types";
import { getTopCollections } from "@/lib/catalog/normalize";

export function getCatalog(): CatalogEntry[] {
  return fullCatalog as CatalogEntry[];
}

export function getSearchIndex(): SearchEntry[] {
  return searchIndex as SearchEntry[];
}

export function getCatalogMeta(): CatalogMeta {
  return catalogMeta as CatalogMeta;
}

export function getEntry(slug: string): CatalogEntry | undefined {
  return getCatalog().find((entry) => entry.slug === slug);
}

export function getCollectionEntry(slug: string): CatalogEntry | undefined {
  return getCatalog().find(
    (entry) => entry.slug === slug && entry.kind === "collection",
  );
}

export function getCollectionMembers(sourceRepo: string): CatalogEntry[] {
  return getCatalog()
    .filter((entry) => entry.kind !== "collection" && entry.sourceRepo === sourceRepo)
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
}

export function getRelatedEntries(entry: CatalogEntry, limit = 4): CatalogEntry[] {
  return getCatalog()
    .filter(
      (candidate) =>
        candidate.slug !== entry.slug &&
        candidate.kind !== "collection" &&
        candidate.platforms.some((platform) => entry.platforms.includes(platform)),
    )
    .sort((left, right) => (right.stars ?? 0) - (left.stars ?? 0))
    .slice(0, limit);
}

export function getTopCollectionsData(): CatalogEntry[] {
  return getTopCollections(getCatalog());
}
