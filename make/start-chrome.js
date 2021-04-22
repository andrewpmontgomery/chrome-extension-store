"use strict";

import fs from "fs";
import { spawn } from "child_process";

function StartChrome() {

  const chromeExe = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

  if (!fs.existsSync(chromeExe)) {
    console.log("Unable to find chrome.exe at: " + chromeExe);
    throw new Error("END");
  }

  console.log("Launching Chrome");

  spawn(
    chromeExe,
    [
      "http://localhost:5000/webstore/category/extensions?hl=en-US",
      "--apps-gallery-url=http://localhost:5000/webstore",
      "--apps-gallery-download-url=http://localhost:5000/service/crx/binary.crx?appId=%s",
      "--apps-gallery-update-url=http://localhost:5000/service/crx/update.xml?appId=%s",
      "--whitelisted-extension-id=demoknhoknhkmcponecodnkfphccjjbo",
      "--extension_id=demoknhoknhkmcponecodnkfphccjjbo",
      // none of these should be needed:
      "--allow-legacy-extension-manifests",
      "--extension-content-verification=bootstrap",
      "--extensions-install-verification=bootstrap",
      "--enable-experimental-extension-apis",
      // "--extensions-not-webstore=demoknhoknhkmcponecodnkfphccjjbo",
      // "--enable-logging",
      // "--v=1", // logging verbosity
    ],
    {
      stdio: "ignore",
      detached: true,
    },
  );
}

export default StartChrome;
