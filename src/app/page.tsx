import { AppHeader } from "@/components/catalog/app-header";
import { CatalogShell } from "@/components/catalog/catalog-shell";
import {
  getCatalogMeta,
  getSearchIndex,
  getTopCollectionsData,
} from "@/lib/catalog/load-catalog";

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <CatalogShell
        variant="home"
        entries={getSearchIndex()}
        collections={getTopCollectionsData()}
        meta={getCatalogMeta()}
      />
    </>
  );
}
