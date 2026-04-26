import { headers } from "next/headers";

export async function getHost() {
  const headerList = await headers();
  return headerList.get("host")?.split(":")[0] || "default";
}
