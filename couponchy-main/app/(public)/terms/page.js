import { getCompanyPageContent, getMetadataDefaults } from "@/server/services/settings-service";
import TermsClientPage from "./TermsClientPage";

export async function generateMetadata() {
  const page = await getCompanyPageContent("terms");
  return getMetadataDefaults(page?.title || "Terms Of Service");
}

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await getCompanyPageContent("terms");
  return <TermsClientPage pageData={page} />;
}
