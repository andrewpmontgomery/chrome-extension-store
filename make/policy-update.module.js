/*
 * Updates the policy file in the /etc folder,
 * either with the contents of the master policy file,
 * or with known contents.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import SETTINGS from "./SETTINGS.module.js";

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

if (process.argv[1] === __filename) {
  // running as stand-alone script, so invoke main function directly
  PolicyUpdate();
}

/*
 * @param {string?} contents
 */
function PolicyUpdate(newContents) {
  const targetFile = SETTINGS.policyPath + SETTINGS.policyFile;
  const isLinux = process.platform === "linux";
  if (!isLinux) {
    console.log("Not running on Linux: unable to set group policy");
    return;
  } else {
    console.log("Setting group policy...");
  }
  // ensure that the target folder and target file already exist
  if (!fs.existsSync(SETTINGS.policyPath)) {
    console.log("Target folder " + SETTINGS.policyPath + " not found");
    process.exit(1);
  } else {
    if (!fs.existsSync(targetFile)) {
      console.log("Target file " + targetFile + " not found; please execute: sudo npm run first-run");
      process.exit(1);
    } else {
      try {
        if (!newContents) {
          const sourceFile = path.resolve(__dirname, SETTINGS.policyFile);
          newContents = fs.readFileSync(sourceFile);
        }
        fs.truncateSync(targetFile);
        fs.appendFileSync(targetFile, newContents);
        console.log("Policy updated in file " + targetFile);
      } catch {
        console.log("Copy FAILED.");
        process.exit(1);
      }
    }
  }
}

export default PolicyUpdate;
