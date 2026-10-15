"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LocaleNavigationProvider } from "./locale-navigation-provider";

export function LocaleDocument({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <html lang={pathname === "/en" ? "en" : "ja"}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <LocaleNavigationProvider>{children}</LocaleNavigationProvider>
      </body>
    </html>
  );
}
