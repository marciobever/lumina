// components/PageShell.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

/**
 * Força remount do subtree a cada mudança de rota (pathname + query),
 * garantindo que os AdSlots desmontem (destroy) e remontem (define/display/refresh).
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() || "";

  // Incluo search params para garantir “pageviews” em navegações que mudam apenas a query.
  const remountKey = useMemo(() => `${pathname}?${search}`, [pathname, search]);

  return <div key={remountKey}>{children}</div>;
}
