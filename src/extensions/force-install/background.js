"use strict";

console.log("This extension should be force-installed by policy");

chrome.runtime.onMessageExternal.addListener(function(message, sender, callback) {
  if (message) {
    switch (message.action) {
      case "get-hardware-platform-info": {
        if (chrome && chrome.enterprise && chrome.enterprise.hardwarePlatform) {
          chrome.enterprise.hardwarePlatform.getHardwarePlatformInfo((results) => {
            if (chrome.runtime.lastError) {
              callback({ success: false, message: chrome.runtime.lastError.message });
            } else {
              callback({ success: true, info: results });
            }
          });
        } else {
          callback({ succes: false, message: "The API enterprise.hardwarePlatform is not available" });
        }
        break;
      }
      default: {
        callback({ success: false, message: "Unsupported or missing message.action" });
        break;
      }
    }
  } else {
    callback({ success: false, message: "Missing message" });
  }
});

chrome.enterprise.hardwarePlatform.getHardwarePlatformInfo(function(results) {
  if (chrome.runtime.lastError) {
    console.log("Error calling chrome.enterprise.getHardwarePlatformInfo: " + chrome.runtime.lastError.message);
  } else {
    console.log("Hardware platform info:", results);
  }
});
