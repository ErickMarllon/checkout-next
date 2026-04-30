import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantConfig } from "@/utils/getTenantConfig";
import { apiRateLimiter } from "@/lib/middleware/rateLimiter";

export async function GET(req: Request) {
  return apiRateLimiter(req as any, async () => {
    const headerList = await headers();
    const host = headerList.get("host")?.split(":")[0] || "default";
  
    const tenant = getTenantConfig(host);
  
    return NextResponse.json(tenant);
  });
}
