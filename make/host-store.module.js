"use strict";

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import finalhandler from "finalhandler";
import serveStatic from "serve-static";
import PolicyUpdate from "./policy-update.module.js";
import SETTINGS from "./SETTINGS.module.js";

function HostStore() {
  const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

  /*
  function serveRelativeFile(res, relativePath, mimeType) {
    const absolutePath = path.resolve(__dirname, "..", relativePath.replace(/^\//, ""));
    return serveAbsoluteFile(res, absolutePath, mimeType);
  }
  */
  function serveAbsoluteFile(res, absolutePath, mimeType) {
    const fileData = fs.readFileSync(absolutePath);
    res.writeHead(200, "OK", { "Content-Type": mimeType });
    res.end(fileData);
  }

  const serve = serveStatic(path.resolve(__dirname, "..", "dist"), { index: ["index.html"] });

  const server = http.createServer(function onRequest(req, res) {
    console.log(req.method + " " + req.url);

    if (["POST", "PUT"].includes(req.method)) {
      let body = "";
      req.on("error", () => {}); // silently catch errors (usually when client cancels the request)
      req.on("data", (data) => { body += data.toString("utf8"); }); // only ascii strings supported, will fail if chunks split across a utf8 multi-byte code
      req.on("end", () => handleRequest(req, res, body)); // silently catch errors (usually when client cancels the request)
    } else {
      handleRequest(req, res);
    }
  });

  function handleRequest(req, res, body) {
    const methodAndUrlWithoutParams = req.method + " " + (req.url + "?").split("?")[0];
    switch (methodAndUrlWithoutParams) {
      case "GET /api/policy": {
        serveAbsoluteFile(res, path.resolve(SETTINGS.policyPath, SETTINGS.policyFile), "application/json");
        return;
      }
      case "PUT /api/policy": {
        let newPolicy = "";
        // check that request body is valid JSON
        try {
          newPolicy = JSON.stringify(JSON.parse(body), null, 2);
        } catch (e) {
          res.writeHead(400, "Bad Request");
          res.end({ message: "Unable to parse new policy file content as JSON" });
          return;
        }
        PolicyUpdate(newPolicy);
        serveAbsoluteFile(res, path.resolve(SETTINGS.policyPath, SETTINGS.policyFile), "application/json");
        return;
      }
    }

    serve(req, res, function(...args) {
      // if file not found, we end up here
      return finalhandler(req, res);
    });
  }

  console.log("Listening on port 5000");
  console.log("Open these three tabs in Chromium:");
  console.log(" - chrome://policy");
  console.log(" - chrome://extensions");
  console.log(" - http://localhost:5000");
  server.listen(5000);
}

export default HostStore;
