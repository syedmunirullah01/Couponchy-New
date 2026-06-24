"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCountryCodeFromPathname, DEFAULT_COUNTRY_CODE } from "@/lib/countries";

const COUNTRY_TO_LANG = {
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  DE: "de", // German
  NL: "nl", // Dutch
  SA: "ar", // Arabic
  AE: "ar", // Arabic
  IN: "hi", // Hindi
  ES: "es", // Spanish
  FR: "fr", // French
  IT: "it", // Italian
  PT: "pt", // Portuguese
};

export default function TranslationLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdminOrAuth = pathname.startsWith("/admin") || pathname.startsWith("/login");
    const countryFromPath = isAdminOrAuth ? DEFAULT_COUNTRY_CODE : (getCountryCodeFromPathname(pathname) || DEFAULT_COUNTRY_CODE);
    const targetLang = COUNTRY_TO_LANG[countryFromPath] || "en";

    const cookies = document.cookie.split("; ");
    const googTransCookies = cookies.filter((entry) => entry.trim().startsWith("googtrans="));
    const rawGoogTrans = googTransCookies.length > 0 
      ? googTransCookies[0].trim().split("=")[1] 
      : null;
    const currentGoogTrans = rawGoogTrans ? rawGoogTrans.replace(/"/g, "") : null;

    const expectedValue = `/en/${targetLang}`;

    let needsCookieUpdate = false;
    if (targetLang === "en") {
      if (currentGoogTrans && currentGoogTrans !== "/en/en") {
        needsCookieUpdate = true;
      }
    } else {
      if (currentGoogTrans !== expectedValue) {
        needsCookieUpdate = true;
      }
    }

    if (googTransCookies.length > 1 || needsCookieUpdate) {
      // Clear all potential duplicate cookie levels
      const domains = [
        "",
        window.location.hostname,
        "." + window.location.hostname,
        window.location.hostname.replace(/^www\./, "")
      ];
      domains.forEach((dom) => {
        const domAttr = dom ? `; domain=${dom}` : "";
        document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domAttr}`;
      });

      // Write single clean cookie
      document.cookie = `googtrans=${expectedValue}; path=/; max-age=31536000; samesite=lax`;
      window.location.reload();
      return;
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      let translateDiv = document.getElementById("google_translate_element");
      if (!translateDiv) {
        translateDiv = document.createElement("div");
        translateDiv.id = "google_translate_element";
        translateDiv.style.display = "none";
        document.body.appendChild(translateDiv);
      }

      const script = document.createElement("script");
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    const htmlElement = document.documentElement;
    const showPage = () => {
      htmlElement.classList.remove("translating");
    };

    const timeoutId = setTimeout(showPage, 1500);

    const observer = new MutationObserver(() => {
      const isTranslated =
        htmlElement.classList.contains("translated-ltr") ||
        htmlElement.classList.contains("translated-rtl") ||
        htmlElement.getAttribute("lang") !== "en";

      if (isTranslated) {
        showPage();
        observer.disconnect();
        clearTimeout(timeoutId);
      }
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ["class", "lang"],
    });

    if (
      targetLang === "en" ||
      htmlElement.classList.contains("translated-ltr") ||
      htmlElement.classList.contains("translated-rtl") ||
      htmlElement.getAttribute("lang") !== "en"
    ) {
      showPage();
      observer.disconnect();
      clearTimeout(timeoutId);
    }

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
}
