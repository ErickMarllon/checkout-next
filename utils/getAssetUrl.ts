import fs from "fs";
import path from "path";
import { getMode } from "./getMode";

export function getAssetUrl(
  host: string,
  folder: string,
  name: string,
): string | null {
  const isDev = getMode();
  const cleanHost = host.split(":")[0];

  let basePath = `/var/www/assets/${cleanHost}/images/${folder}`;

  if (isDev) {
    basePath = `./config/assets/${cleanHost}/images/${folder}`;
  }

  const possibleExtensions = [
    "webp",
    "avif",
    "png",
    "jpg",
    "jpeg",
    "svg",
    "gif",
  ];

  for (const ext of possibleExtensions) {
    const fileName = `${name}.${ext}`;

    if (fs.existsSync(path.join(basePath, fileName))) {
      console.log(`/images/${folder}/${fileName}`);
      return `/images/${folder}/${fileName}`;
    }
  }

  return null;
}
