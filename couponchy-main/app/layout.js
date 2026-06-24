import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "./Providers";
import "./globals.css";
import AppToaster from "@/components/ui/Toaster";
import { getMetadataDefaults } from "@/server/services/settings-service";
import { getSettings } from "@/server/repositories/settings-repository";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export async function generateMetadata() {
  return getMetadataDefaults("Home");
}

function CustomMarkup({ markup }) {
  if (!markup?.trim()) {
    return null;
  }

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: markup }} />;
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const requestHeaders = await headers();
  const countryHeader = requestHeaders.get("x-country-code") || "US";
  
  const COUNTRY_TO_LANG = {
    US: "en", GB: "en", CA: "en", AU: "en",
    DE: "de", NL: "nl", SA: "ar", AE: "ar",
    IN: "hi", ES: "es", FR: "fr", IT: "it", PT: "pt"
  };
  const targetLang = COUNTRY_TO_LANG[countryHeader] || "en";
  const isTranslating = targetLang !== "en";

  return (
    <html lang="en" className={isTranslating ? "translating" : ""}>
      <head>
        <CustomMarkup markup={settings.general.customHeadScript} />
      </head>
      <body className={`${plusJakartaSans.variable} antialiased`}>
        <CustomMarkup markup={settings.general.customBodyStartScript} />
        <Providers>
          {children}
        </Providers>
        <AppToaster />
        <CustomMarkup markup={settings.general.customBodyEndScript} />
      </body>
    </html>
  );
}
