"use client";
import { TenantContext } from "./context";

export function TenantProvider({
  host,
  children,
}: {
  host: string;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ host }}>{children}</TenantContext.Provider>
  );
}
