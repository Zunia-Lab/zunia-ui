import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = process.argv[2] || "packages/ui";
const stylesPath = join(root, pkg, "src/styles.css");
const tokensPath = join(root, "packages/tokens/src/tokens.css");
const outDir = join(root, pkg, "dist");
const outPath = join(outDir, "styles.css");

let css = readFileSync(stylesPath, "utf8");
const tokens = readFileSync(tokensPath, "utf8");
css = css.replace(/@import\s+["'][^"']+["']\s*;\s*/g, `${tokens}\n\n`);

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, css);
console.log("wrote", outPath);
