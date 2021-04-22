"use strict";

/**
 * Generates a PEM file containing a private key which maps to a Chrome extension ID with a specified prefix and/or suffix.
 * Runtime is heavily CPU dependent. My runtimes are:
 * - 1 character = 2 seconds
 * - 2 characters = 15 seconds
 * - 3 characters = 5 minutes
 * - 4 characters = 1.5 hours
 * - 5 characters = 1 day
 * - 6 characters = 2 weeks
 *
 * Usage:
 *   node generate-known-pem.js --prefix=big --suffix=app
 * or
 *   node generate-known-pem.js --prefix=big
 * or
 *   node generate-known-pem.js --suffix=app
 *
 * Only characters a to p (inclusive) are allowed in prefix and suffix.
 */

import crypto from "crypto";
import fs from "fs";

// parse command-line arguments "prefix" and "suffix"
const args = process.argv
  .filter(arg => arg.includes("="))
  .map(arg => arg.replace(/^-+/, "").split("="))
  .reduce((acc, el) => { acc[el[0]] = el[1]; return acc; }, {}); // todo: rewrite with spread operator
const prefix = args.prefix || "";
const suffix = args.suffix || "";
if (!prefix && !suffix) {
  console.log("Missing command-line argument --prefix=abc or --suffix=nop or both");
  process.exit(1);
}

// ensure that prefix and suffix only have letters a-p
for (const [key, value] of Object.entries({ prefix, suffix })) {
  const badLetters = [...value.matchAll(/[^a-p]/g)].map(match => match[0]).join(",");
  if (badLetters) {
    console.log(`Invalid arguments: ${key} characters out of range a-p: [${badLetters}]`);
    process.exit(1);
  }
}

console.log(`Generating random keys until we find one starting with "${prefix}" and ending with "${suffix}"`);

if ((prefix + suffix).length > 5) {
  console.log("Warning: finding more than five characters will take more than a day");
}

const startTime = Date.now();

for (let loopCount = 0; true; loopCount++) {
  // generate a new random key pair
  const key = crypto.generateKeyPairSync(
    "rsa",
    {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "der" },
    },
  );
  // calculate the appId from the SHA256 hash of the publicKey
  const appId = crypto
    .createHash("sha256")
    .update(key.publicKey)
    .digest()
    .toString("hex")
    .split("")
    .map(x => (parseInt(x, 16) + 0x0a).toString(26))
    .join("")
    .slice(0, 32);
  // log to console intermittently
  const isSquare = Number.isInteger(Math.sqrt(loopCount));
  if (isSquare) {
    console.log(`Last found at [${String(loopCount).padStart(6)}]: ${appId}`);
  }
  // after a few keys are generated, calculate speed and estimated end time
  if (loopCount === 25) {
    const elapsed = Date.now() - startTime;
    const loopsPerSecond = Math.round((1000000 * loopCount) / elapsed) / 1000;
    console.log(`Speed: ${loopsPerSecond} keys generated per second`);
    const searchSpace = Math.pow(16, (prefix + suffix).length) / 2;
    console.log(`Average search space: ${searchSpace} keys`);
    const estimatedMs = (searchSpace / loopsPerSecond) * 1000;
    const estimatedTime = (new Date(Date.now() + estimatedMs));
    console.log(`Estimated end time: ${estimatedTime}`);
  }
  if (appId.startsWith(prefix) && appId.endsWith(suffix)) {
    fs.writeFileSync(appId + ".pem", key.privateKey);
    console.log(`Private key saved to ${appId}.pem`);
    const timeTaken = (new Date(Date.now() - startTime)).toISOString().substr(11, 8);
    console.log(`Time taken: ${timeTaken}`);
    break;
  }
}
