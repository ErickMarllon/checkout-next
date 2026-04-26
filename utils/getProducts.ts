import fs from "fs";
import path from "path";
import { getMode } from "./getMode";
import { getAssetUrl } from "./getAssetUrl";
import { ProductFormData } from "@/app/checkout/[[...slug]]/schemas/items";

export function getProducts(host: string) {
  const isDev = getMode();
  const cleanHost = host.split(":")[0];

  let filePath = `/var/www/config/checkout/products/${cleanHost}.json`;

  if (isDev) {
    filePath = `./config/products/${cleanHost}.json`;
  }

  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as ProductFormData[];

  return data.map((p: ProductFormData) => {
    const gift = p.gift
      ? {
          ...p.gift,
          ...(p.gift.image && {
            image: getAssetUrl(host, "products", p.gift.image),
          }),
        }
      : undefined;

    return {
      ...p,
      image: getAssetUrl(host, "products", p.image),
      ...(gift && { gift }),
    };
  });
}
