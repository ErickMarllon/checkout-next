"use client";

import { createContext } from "react";

export const TenantContext = createContext<{ host: string } | null>(null);
