"use strict";

import fs from "fs";
import { spawn } from "child_process";

function LaunchBrowser() {
  // todo: add support for Microsoft Edge, because we really need to test with that
  const chromeExecutablePaths = [
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];

  const chromeExe = chromeExecutablePaths.find(exe => fs.existsSync(exe));
  if (!chromeExe) {
    console.log("Unable to find chrome executable in /usr/bin");
    // throw new Error("END");
  } else {
    console.log("Launching Chrome/Chromium");
    spawn(
      chromeExe,
      [
        "http://localhost:5000/webstore/category/extensions?hl=en-US",
        //
        // Optional paramaters, have a play around and see what they do
        // Command-line parameters listed here:
        //   https://chromium.googlesource.com/chromium/src/+/master/chrome/common/chrome_switches.cc
        // and extension-specific parameters here:
        //   https://chromium.googlesource.com/chromium/src/+/master/extensions/common/switches.cc
        //
        // Control the extension store URLs:
        //   "--apps-gallery-url=http://localhost:5000/webstore", // base URL of webstore itself
        //   "--apps-gallery-download-url=http://localhost:5000/extensions/%s/binary.crx", where %s is replaced by appId
        //   "--apps-gallery-update-url=http://localhost:5000/extensions/updatePost", // Chrome POSTs to this URL to check for updates
        //
        // Specify which extensions should get special treatment (access private APIs, etc.) (not sure how these all interact):
        //   "--whitelisted-extension-id=" + extId,
        //   "--extensions-not-webstore=" + extId,
        //
        // Load an unpacked extension from a local folder:
        //   "--load-extension=" + pathToExtn,
        //   "--allow-legacy-extension-manifests",
        //   "--extension-content-verification=bootstrap",
        //   "--extensions-install-verification=bootstrap",
        //  "--enable-experimental-extension-apis", // at the time of writing (Chrome 90) there are no more experimental extension APIs
        //
        // Logging:
        //   "--enable-logging", // on Windows, logs to "%LOCALAPPDATA%\Chromium\User Data\chrome_debug.log"
        //   "--v=1", // logging verbosity
      ],
      {
        stdio: "ignore",
        detached: true,
      },
    );
  }
}

export default LaunchBrowser;
