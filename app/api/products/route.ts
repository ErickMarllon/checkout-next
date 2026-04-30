import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getProducts } from "@/utils/getProducts";
import { apiRateLimiter } from "@/lib/middleware/rateLimiter";

export async function GET(req: Request) {
  return apiRateLimiter(req as any, async () => {
    const headerList = await headers();
    const host = headerList.get("host")?.split(":")[0] || "default";
  
    const products = getProducts(host);
  
    return NextResponse.json(products);
  });
}
