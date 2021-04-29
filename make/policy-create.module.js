/*
 * Creates an empty policy file in the /etc folder
 */

import fs from "fs";
import { fileURLToPath } from "url";
import SETTINGS from "./SETTINGS.module.js";

const __filename = fileURLToPath(new URL(import.meta.url));

if (process.argv[1] === __filename) {
  // running as stand-alone script, so invoke main function directly
  PolicyCreate();
}

function PolicyCreate() {
  const targetFile = SETTINGS.policyPath + SETTINGS.policyFile;
  const isLinux = process.platform === "linux";
  if (!isLinux) {
    console.log("Not running on Linux: unable to create group policy file");
    return;
  } else {
    console.log("Creating group policy file...");
  }
  if (!fs.existsSync(SETTINGS.policyPath)) {
    console.log("Target folder " + SETTINGS.policyPath + " not found");
    process.exit(1);
  } else {
    if (!process.env.SUDO_USER) {
      console.log("Please run as admin: sudo npm run first-run");
      process.exit(1);
    } else {
      try {
        // first create the file (ignores if already exists)
        fs.closeSync(fs.openSync(targetFile, "w"));
        // also, truncate the file (just in case it already exists)
        fs.truncateSync(targetFile);
        // finally, set mode 777
        fs.chmodSync(targetFile, 0o777);
        console.log("Created file " + targetFile);
      } catch {
        console.log("Create FAILED. Did you run with sudo?");
        process.exit(1);
      }
    }
  }
}

export default PolicyCreate;
