"use client";

import { SessionProvider } from "next-auth/react";
import TranslationLoader from "@/components/layout/TranslationLoader";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <TranslationLoader />
      {children}
    </SessionProvider>
  );
}
