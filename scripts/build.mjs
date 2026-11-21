import {
  readFile,
  writeFile,
  mkdir,
  copyFile,
  rm,
  lstat,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(root, "dist");
if (out !== path.join(root, "dist") || !out.startsWith(root + path.sep))
  throw Error("Unsafe build output path.");
try {
  if ((await lstat(out)).isSymbolicLink())
    throw Error("Refusing to replace a symlink build directory.");
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}
console.log(`Building static files in validated output: ${out}`);
await rm(out, { recursive: true, force: true });
const sw = await readFile(path.join(root, "sw.js"), "utf8");
const list = sw.slice(sw.indexOf("const FILES = ["), sw.indexOf("];"));
const files = [
  ...new Set(
    [...list.matchAll(/"\.\/([^"\r\n]+)"/g)]
      .map((m) => m[1])
      .concat(["sw.js", "LICENSE"]),
  ),
];
for (const name of files) {
  const source = path.resolve(root, name),
    destination = path.resolve(out, name);
  if (
    !source.startsWith(root + path.sep) ||
    !destination.startsWith(out + path.sep)
  )
    throw Error("Invalid static asset path.");
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
await writeFile(
  path.join(out, "build-info.json"),
  JSON.stringify({ version: pkg.version, files: files.length }) + "\n",
);
console.log(
  `Prepared ${files.length} static assets for ECHO SQUAD ${pkg.version}.`,
);
