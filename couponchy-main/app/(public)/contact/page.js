import { getCompanyPageContent, getMetadataDefaults } from "@/server/services/settings-service";
import ContactClientPage from "./ContactClientPage";

export async function generateMetadata() {
  const page = await getCompanyPageContent("contact");
  return getMetadataDefaults(page?.title || "Contact Us");
}

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const page = await getCompanyPageContent("contact");
  return <ContactClientPage pageTitle={page?.title || "Contact Us"} pageContent={page?.content || ""} />;
}
