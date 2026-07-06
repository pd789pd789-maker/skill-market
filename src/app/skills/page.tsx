import { AppHeader } from "@/components/catalog/app-header";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import {
  getCatalogMeta,
  getSearchIndex,
  getTopCollectionsData,
} from "@/lib/catalog/load-catalog";

export default function SkillsPage() {
  return (
    <>
      <AppHeader />
      <CatalogShell
        variant="catalog"
        entries={getSearchIndex()}
        collections={getTopCollectionsData()}
        meta={getCatalogMeta()}
      />
    </>
  );
}
