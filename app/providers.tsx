"use client";

import { AppStoreProvider } from "@/lib/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}
