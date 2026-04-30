import fs from "fs";
import path from "path";
import { getMode } from "./getMode";

export function getTenantConfig(host: string) {
  const isDev = getMode();
  const cleanHost = host.split(":")[0];

  let filePath = `/var/www/config/checkoutNext/tenant/${cleanHost}.json`;

  if (isDev) {
    filePath = `./config/tenant/${cleanHost}.json`;
  }

  if (!fs.existsSync(filePath)) return null;

  const data = fs.readFileSync(filePath, "utf-8");

  return JSON.parse(data);
}
