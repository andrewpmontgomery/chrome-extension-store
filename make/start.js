// 1. Make & copy all three extensions
// 2. Copy the policy file (if on Linux)
// 3. Start hosting the store
// 4. Optionally, run Chrome (with the flags? no)

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

import BuildCrx from "./build-crx.module.js";
import HostStore from "./host-store.module.js";
import PolicyUpdate from "./policy-update.module.js";

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

(async function main() {
  // 1. Update group policies
  PolicyUpdate();

  // 2. Clear the dist folder
  fs.emptyDirSync(path.resolve(__dirname, "..", "dist"));

  // 3. Build two extensions and write to dist/extensions/
  const target = path.resolve(__dirname, "..", "dist", "extensions");
  fs.emptyDirSync(target);
  const crxPathForceInstall = path.resolve(__dirname, "..", "src", "extensions", "force-install");
  const crxPathLinkInstall = path.resolve(__dirname, "..", "src", "extensions", "link-install");
  await BuildCrx(crxPathForceInstall, target);
  await BuildCrx(crxPathLinkInstall, target);

  // 4. Copy pre-signed extension to dist/extensions/
  fs.copySync(path.resolve(__dirname, "..", "src", "extensions", "signed-by-google"), path.resolve(__dirname, "..", "dist", "extensions", "fonnndfldddonnmjebmnnhbkcpoiagmp"));

  // 5. Copy unpacked extension to dist/extensions/
  fs.copySync(path.resolve(__dirname, "..", "src", "extensions", "unpacked-dev"), path.resolve(__dirname, "..", "dist", "extensions", "npkdlgokhbklicmodpklggkljnkcpdgc"));

  // 6. Copy webstore to dist/webstore/
  fs.copySync(path.resolve(__dirname, "..", "src", "webstore"), path.resolve(__dirname, "..", "dist", "webstore"));

  // 7. Copy root index.html and favicon.ico to dist/
  fs.copySync(path.resolve(__dirname, "..", "src", "index.html"), path.resolve(__dirname, "..", "dist", "index.html"));
  fs.copySync(path.resolve(__dirname, "..", "src", "favicon.ico"), path.resolve(__dirname, "..", "dist", "favicon.ico"));

  // 8. Start hosting webstore (unless arg --no-host)
  if (!process.argv.find(arg => arg === "--no-host")) {
    HostStore();
  }

  // 9. Launch browser
  // no longer done
})();
