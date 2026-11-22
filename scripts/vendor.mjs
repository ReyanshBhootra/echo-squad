import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = new URL("../", import.meta.url);
await mkdir(new URL("assets/vendor/", root), { recursive: true });
for (const name of ["three.module.js", "three.core.js"]) {
  await copyFile(
    new URL(`node_modules/three/build/${name}`, root),
    new URL(`assets/vendor/${name}`, root),
  );
}
await copyFile(
  new URL("node_modules/three/LICENSE", root),
  new URL("assets/vendor/THREE-LICENSE.txt", root),
);
console.log(
  `Vendored Three.js from the lockfile installation into ${fileURLToPath(new URL("assets/vendor/", root))}`,
);
