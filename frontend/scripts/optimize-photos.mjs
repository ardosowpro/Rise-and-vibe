// Génère des versions WebP optimisées (max 1600px de large) des photos
// de public/photos/ vers public/photos/optimized/.
// Usage : npm run photos
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = new URL("../public/photos/", import.meta.url).pathname;
const OUT = path.join(SRC, "optimized");
const MAX_WIDTH = 1600;

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const file of files) {
  const name = file.replace(/\.(jpe?g|png)$/i, "");
  const out = path.join(OUT, `${name}.webp`);
  const info = await sharp(path.join(SRC, file))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out);
  console.log(`${file} → optimized/${name}.webp (${Math.round(info.size / 1024)} Ko)`);
}
console.log(`${files.length} photo(s) optimisée(s).`);
