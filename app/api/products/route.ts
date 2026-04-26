import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getProducts } from "@/utils/getProducts";

export async function GET() {
  const headerList = await headers();
  const host = headerList.get("host")?.split(":")[0] || "default";

  const products = getProducts(host);

  return NextResponse.json(products);
}
