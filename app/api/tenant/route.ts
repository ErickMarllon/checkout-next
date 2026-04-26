import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantConfig } from "@/utils/getTenantConfig";

export async function GET() {
  const headerList = await headers();
  const host = headerList.get("host")?.split(":")[0] || "default";

  const tenant = getTenantConfig(host);

  return NextResponse.json(tenant);
}
