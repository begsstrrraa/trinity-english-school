import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.join(process.cwd(), "static", "images");
const files = [
  ["hero.jpg", "https://trinityenglishschool.in/wp-content/uploads/2019/08/banner-1024x520.jpg"],
  ...Array.from({ length: 23 }, (_, index) => [
    `gallery-${String(index + 1).padStart(2, "0")}.jpg`,
    `https://trinityenglishschool.in/wp-content/uploads/2018/10/${index + 1}.jpg`,
  ]),
];

await mkdir(out, { recursive: true });
for (const [name, url] of files) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const body = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(out, name), body);
  console.log(`${name} ${body.length}`);
}
