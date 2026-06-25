import { getCompanyPageContent, getMetadataDefaults } from "@/server/services/settings-service";
import PrivacyClientPage from "./PrivacyClientPage";

export async function generateMetadata() {
  const page = await getCompanyPageContent("privacy");
  return getMetadataDefaults(page?.title || "Privacy Policy");
}

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const page = await getCompanyPageContent("privacy");
  return <PrivacyClientPage pageData={page} />;
}
