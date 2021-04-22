"use strict";

import path from "path";
import fs from "fs";
import CrxFactory from "crx";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

(async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "src", "manifest.json"), { encoding: "utf8" }));

  const pemKeyBuffer = fs.readFileSync(path.resolve(__dirname, "demo-private-key.pem"));
  const crx = new CrxFactory({
    codebase: "http://localhost:5000/service/crx/binary.crx", // todo: move this to a settings.json file
    privateKey: pemKeyBuffer,
  });

  const pubKeyBuffer = await crx.generatePublicKey();
  const pubKeyBase64 = pubKeyBuffer.toString("base64");
  if (manifest.key !== pubKeyBase64) {
    throw new Error("In manifest.json, key should be:\n" + pubKeyBase64);
  }

  // Load the manifest and contents
  await crx.load(path.resolve(__dirname, "..", "src"));
  // zip up the files
  const zipContentsBuffer = await crx.loadContents();
  // write the zip file
  console.log("  Writing:");
  console.log("    dist/binary.zip");
  fs.writeFileSync(path.resolve(__dirname, "..", "dist", "binary.zip"), zipContentsBuffer);
  // pack the CRX file
  const crxBuffer = await crx.pack(zipContentsBuffer);
  const updateXML = crx.generateUpdateXML();
  const appId = crx.generateAppId();
  // verifyCrx3(crxBuffer, appId);
  console.log("    dist/binary.crx");
  fs.writeFileSync(path.resolve(__dirname, "..", "dist", "binary.crx"), crxBuffer);
  console.log("    dist/update.xml");
  fs.writeFileSync(path.resolve(__dirname, "..", "dist", "update.xml"), updateXML);
  console.log("  AppID: " + appId);

  console.log("END");
})();
