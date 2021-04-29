"use strict";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import CrxFactory from "crx";

const __filename = fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

if (process.argv[1] === __filename) {
  // running as stand-alone script, so invoke main function directly
  // parse command-line arguments "--source"
  const args = Object.fromEntries(process.argv.slice(2).map(arg => arg.replace(/^-+/, "").split("=")));
  const source = args.source || "";
  if (!source) {
    console.log("Missing command-line argument --source=/extensions/name");
    process.exit(1);
  }
  // optional command-line argument --target defaults to "dist/extensions/"
  const target = args.target || path.resolve(__dirname, "..", "dist", "extensions");
  // invoke main function
  (async function main() {
    const { appId, files } = await BuildCrx(source, target);
    if (!appId) {
      console.log("Something went wrong - appId is undefined");
      process.exit(1);
    } else {
      console.log("Wrote " + files.length + " files");
    }
    console.log("END");
  })();
}

/**
 * Builds a CRX file from the files in sourcePath,
 * writes it to targetPath/<appId>/binary.crx,
 * and returns all the results.
 * @param {string} sourcePath
 * @param (string?} targetPath - if omitted, no files are written
 * @returns {{ appId: string, files: Array<{ name: string, content: Buffer|string }> }}
 */
async function BuildCrx(sourcePath, targetPath) {
  // ensure that sourcePath, manifest.json, and private-key.pem all exist
  if (!fs.existsSync(sourcePath)) {
    console.log("Unable to find source path");
    process.exit(1);
  }
  if (!fs.existsSync(path.resolve(sourcePath, "manifest.json"))) {
    console.log("Unable to find manifest.json in source path");
    process.exit(1);
  }
  if (!fs.existsSync(path.resolve(sourcePath, "private-key.pem"))) {
    console.log("Unable to find private-key.pem in source path");
    process.exit(1);
  }

  // read manifest.json
  const manifestJson = fs.readFileSync(path.resolve(sourcePath, "manifest.json"), { encoding: "utf8" });
  const manifest = JSON.parse(manifestJson);
  if (!(manifest.update_url || "").includes("/update.xml")) {
    console.log("Manifest update_url must contain \"/update.xml\"");
    process.exit(1);
  }
  const codebase = manifest.update_url.replace("update.xml", "binary.crx");

  const pemKeyBuffer = fs.readFileSync(path.resolve(sourcePath, "private-key.pem"));
  const crx = new CrxFactory({
    codebase: codebase,
    privateKey: pemKeyBuffer,
  });
  const pubKeyBuffer = await crx.generatePublicKey();
  const pubKeyBase64 = pubKeyBuffer.toString("base64");
  if (manifest.key !== pubKeyBase64) {
    console.log("In manifest.json, key should be:\n" + pubKeyBase64);
    process.exit(1);
  }

  // Load the source files into the new CRX (.pem files are ignored)
  await crx.load(sourcePath);
  // zip up the files
  const zipBuffer = await crx.loadContents();
  // pack the CRX file and generate the update.xml file
  const crxBuffer = await crx.pack(zipBuffer);
  const updateXml = crx.generateUpdateXML();

  const appId = crx.generateAppId(); // warning: appId is only available after calling crx.pack()
  // check that the appId is included in the update_url
  if (!manifest.update_url.includes(appId)) {
    console.log("Manifest update_url must contain appId \"" + appId + "\"");
    process.exit(1);
  }

  verifyCrx3(crxBuffer, appId);

  const files = [
    { name: "binary.crx", content: crxBuffer },
    { name: "binary.zip", content: zipBuffer },
    { name: "update.xml", content: updateXml },
    { name: "manifest.json", content: manifestJson },
  ];

  if (targetPath) {
    // write the files to targetPath
    const relativeTargetPath = path.relative(".", targetPath);
    console.log("  Writing files:");
    console.log(`    ${relativeTargetPath}/${appId}/`);
    const distDir = path.resolve(targetPath, appId);
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir);
    }
    for (const file of files) {
      console.log(`    ${relativeTargetPath}/${appId}/${file.name}`);
      fs.writeFileSync(path.resolve(distDir, file.name), file.content);
    }
    console.log("  AppID: " + appId);
  }

  return { appId, files };
}

// sanity check
function verifyCrx3(crxBuffer, expectedId) {
  const magicNumber = crxBuffer.toString("ascii", 0, 4);
  if (magicNumber !== "Cr24") {
    throw new Error("CRX output expected magic number 'Cr24', but instead found '" + magicNumber + "'");
  }
  const crxVersion = crxBuffer.readUInt32LE(4);
  if (crxVersion !== 3) {
    throw new Error("CRX output isn't CRX version 3");
  }
  const headerSize = crxBuffer.readUInt32LE(8);
  if (headerSize !== 581) {
    throw new Error("CRX header size is incorrect");
  }
  const actualId = crxBuffer.slice(577, 577 + 16).toString("hex").split("").map(h => String.fromCharCode(parseInt(h, 16) + 97)).join("");
  if (expectedId !== actualId) {
    throw new Error("CRX header contains wrong ID: expected " + expectedId + " but found " + actualId);
  }
}

export default BuildCrx;
