/**
 * Post-build patch for OpenNext Cloudflare adapter.
 *
 * Replaces the dynamic `require(this.middlewareManifestPath)` in the bundled
 * handler.mjs with the inlined middleware-manifest.json content.
 *
 * The adapter already patches most dynamic requires but misses
 * `getMiddlewareManifest()` in next-server.js.
 */

const fs = require("fs");
const path = require("path");

const handlerPath = path.join(
  __dirname,
  "..",
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs"
);

const manifestPath = path.join(
  __dirname,
  "..",
  ".open-next",
  "server-functions",
  "default",
  ".next",
  "server",
  "middleware-manifest.json"
);

if (!fs.existsSync(handlerPath)) {
  console.error("handler.mjs not found at", handlerPath);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  console.error("middleware-manifest.json not found at", manifestPath);
  process.exit(1);
}

const manifest = fs.readFileSync(manifestPath, "utf-8").trim();
let handler = fs.readFileSync(handlerPath, "utf-8");

const pattern = "require(this.middlewareManifestPath)";
if (!handler.includes(pattern)) {
  console.log("Pattern not found — already patched or adapter updated.");
  process.exit(0);
}

handler = handler.replace(pattern, `(${manifest})`);

fs.writeFileSync(handlerPath, handler, "utf-8");
console.log("Patched getMiddlewareManifest: inlined middleware-manifest.json");
