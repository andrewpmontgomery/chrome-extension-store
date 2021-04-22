"use strict";

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function HostCrx() {
  const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

  function serveFile(res, relativePath, mimeType) {
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.substr(1);
    }
    const fileData = fs.readFileSync(path.resolve(__dirname, "..", relativePath));
    res.writeHead(200, "OK", { "Content-Type": mimeType });
    res.end(fileData);
  }

  const server = http.createServer(function onRequest(req, res) {
    console.log(req.method + " " + req.url);
    const urlWithoutParams = (req.url + "?").split("?")[0];
    switch (urlWithoutParams) {
      case "/webstore/category/extensions":
        serveFile(res, "/service/webstore.html", "text/html");
        break;
      case "/webstore/category/favicon.png":
        serveFile(res, "/service/favicon.png", "image/png");
        break;
      case "/service/crx/update.xml":
        serveFile(res, "/dist/update.xml", "application/xml");
        break;
      case "/service/crx/binary.crx":
        serveFile(res, "/dist/binary.crx", "application/x-chrome-extension");
        break;
      case "/service/crx/manifest.json":
        serveFile(res, "/src/manifest.json", "application/json");
        break;
      default:
        console.log("URL not matched");
        res.writeHead(404, "Not Found");
        res.end("Not found");
        break;
    }
  });

  console.log("Listening on port 5000");
  server.listen(5000);
}

export default HostCrx;
