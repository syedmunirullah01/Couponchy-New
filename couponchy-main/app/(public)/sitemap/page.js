import { getCompanyPageContent, getMetadataDefaults } from "@/server/services/settings-service";
import { getAllCategories } from "@/server/repositories/categories-repository";
import { getAllStores } from "@/server/repositories/stores-repository";
import SitemapClientPage from "./SitemapClientPage";

export async function generateMetadata() {
  const page = await getCompanyPageContent("sitemap");
  return getMetadataDefaults(page?.title || "Sitemap");
}

export const dynamic = "force-dynamic";

export default async function SitemapPage() {
  const page = await getCompanyPageContent("sitemap");
  
  let categories = [];
  let stores = [];
  try {
    categories = await getAllCategories();
    stores = await getAllStores();
  } catch (error) {
    console.error("Failed to fetch database elements for Sitemap page:", error);
  }

  return <SitemapClientPage pageData={page} stores={stores} categories={categories} />;
}
