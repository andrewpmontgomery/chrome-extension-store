# chrome-extension-store

Chrome Extension Store for Enterprise

This is a proof-of-concept of a private Chrome Extension Store for Enterprise use.

This has only been tested with *Chromium* on *Linux*, but the same principles should apply on Windows for machines attached to an Active Directory domain.

Note: "For Windows instances that are not joined to a Microsoft® Active Directory® domain, forced installation is limited to apps and extensions listed in the Chrome Web Store."

## Quick Start

Download the entire project to a local folder.

Run `npm install` to set up the packages.  
Run `sudo npm run first-run` to create the Policy file in `/etc/chromium/policies/managed/`  
(You may need to edit `make/SETTINGS.js` if your instance of Chromium uses a different folder)  
Run `npm start` to build the extensions and launch a simple web server, serving up the `dist/` folder.  

## What happens?

Running `sudo npm run first-run`
will create a blank Policy file at `/etc/chromium/policies/managed/crx-store-policy.json`  
with permissions 777 (read/write for all users).

This file will be populated by `npm start` below.

#### Policies

Running `npm start`  
will copy from `make/crx-store-policy.json` to `/etc/chromium/policies/managed/crx-store-policy.json`  
containing the following policies:

* "ExtensionInstallForcelist": ["focedodpfclchannlpocobimkdiabgfh;http://localhost:5000/extensions/focedodpfclchannlpocobimkdiabgfh/update.xml"]
   * Forces a specific extension to be installed
* "ExtensionInstallSources": ["http://localhost:5000/*"]
   * Allows extensions to be installed from a specific host (not just the official store)
* "DeveloperToolsAvailability": 1
   * Allows debugging (useful for testing, but remove this in production)
* "EnterpriseHardwarePlatformAPIEnabled": true
   * Enables the enterprise.hardwarePlatform API

If it doesn't work, you may need to edit `make/SETTINGS.js` to change the target folder to one of the following:
* /etc/chromium/policies/managed
* /etc/chromium-browser/policies/managed
* /etc/opt/chrome/policies/managed
* or similar

Chrome won't install extensions unless they are either:
1. signed by Google, or
2. in the ExtensionInstallForcelist group policy setting, or
3. downloaded from a URLPattern in the ExtensionInstallSources group policy setting
4. loaded unpacked

In addition, if policy ExtensionInstallBlocklist is set to "*":
* the option to load unpacked is no longer available, and
* if you want to use policy ExtensionInstallSources, then you will have to add your extension ID to policy ExtensionInstallAllowlist

(Older documentation refers to policy names ExtensionInstallBlacklist and ExtensionInstallWhitelist.)

#### Build extensions

Running `npm start` will build two sample extensions in `src/extensions/` and copy them to `dist/`  

#### Host extensions

Running `npm start` will host a lightweight web server on port 5000, serving files from `dist/`:
* an extension store at http://localhost:5000/webstore
* binary CRX files at http://localhost:5000/extensions/<appId>/binary.crx
* update.xml files at http://localhost:5000/extensions/<appId>/update.xml
* manifest.json files at http://localhost:5000/extensions/<appId>/manifest.json

#### Launching Chrome

Additional functionality can be unlocked by launching Chrome with special command-line flags.
However this is not a realistic scenario for most enterprise users.

## Making changes

To make changes to the sample extensions in `src/extensions/`:
* Don't forget to increment the version number in `manifest.json`
* Re-run `npm start` to rebuild the binary.crx files
* Browse to chrome://extensions and press Update
* If errors aren't showing, make sure that the "Collect Errors" toggle is enabled in chrome://extensions

The code in `make/` uses ES Modules, not CommonJS.

----------

### Group Policy via Registry

Linux doesn't have a Registry, so this project uses a policy file instead.  
For Windows, you'll have to use Active Directory's Group Policy.  
Instructions for this are widely available online.

To force-install an extension, create this registry key and child value:
* Key: HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist (note lowercase list)
* Name: "1"
* Type: REG_SZ
* Data: "focedodpfclchannlpocobimkdiabgfh;http://localhost:5000/extensions/focedodpfclchannlpocobimkdiabgfh/update.xml"

To enable the custom extension store, create this registry key and child value:
* Key: HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallSources
* Name: "1"
* Type: REG_SZ
* Data: "http://localhost:5000/*"

To enable developer tools on force-installed extensions (remove this in production):
* Key: HKEY_LOCAL_MACHINE\Software\Policies\Google\Chrome
* Name: "DeveloperToolsAvailability"
* Type: REG_DWORD
* Data: 0x00000001 (use zero or remove to disable)

To enable API enterprise.hardwarePlatform:
* Key: HKEY_LOCAL_MACHINE\Software\Policies\Google\Chrome
* Name: "EnterpriseHardwarePlatformAPIEnabled":
* Type: REG_DWORD
* Data: 0x00000001

----------

### CRX information

###### CRX3 file format

http://gromnitsky.blogspot.com/2019/04/crx3.html  
(by the author of crx3-utils)

###### CRX proof information

https://blog.janestreet.com/chrome-extensions-finding-the-missing-proof/

###### CRX policy example

See here: https://sites.google.com/site/lock5stat/offline-use/installing-for-all-users  

----------

### Extension API Permissions

Force-installed extension can access some additional restricted APIs.
In practice, the only additional API of any interest is `enterprise.hardwarePlatform`.

### List of available extension APIs

Derived from https://github.com/chromium/chromium/blob/master/chrome/common/extensions/api/_permission_features.json

Chrome ships with a wide range of Extension APIs.
Many of them are restricted to ChromeOS and/or to Google's own extensions and/or to Components only.
(Components are a different way of extending browser functionality; they are reserved for Chrome developers only. See chrome://components for more info.)

Here are all the known APIs and whether they are available in Windows:

Permission | Available in Enterprise Extension on Windows
---------- | --------------------------------------------
accessibilityFeatures.modify | Yes
accessibilityFeatures.read | Yes
accessibilityPrivate | No
activeTab | Yes
activityLogPrivate | No
autofillAssistantPrivate | No
autofillPrivate | No
autotestPrivate | No
background | Yes
bookmarks | Yes
brailleDisplayPrivate | No
browsingData | Yes
certificateProvider | No
chromePrivate | No
chromeosInfoPrivate | No
clipboardRead | Yes
clipboardWrite | Yes
commandLinePrivate | No
commands.accessibility | No
contentSettings | Yes
contextMenus | Yes
cookies | Yes
crashReportPrivate | No
cryptotokenPrivate | No
debugger | Yes
developerPrivate | No
devtools | Yes
declarativeContent | Yes
desktopCapture | Yes
desktopCapturePrivate | Yes, but useless
documentScan | No
downloads | Yes
downloads.open | Yes
downloads.shelf | Yes
enterprise.deviceAttributes | No
enterprise.networkingAttributes | No
enterprise.hardwarePlatform | Yes
enterprise.platformKeys | No
enterprise.platformKeysPrivate | No
enterprise.reportingPrivate | No
experimental | Yes, but useless
fileBrowserHandler | No
fileManagerPrivate | No
fileSystemProvider | No
fontSettings | Yes
gcm | Yes
geolocation | Yes
history | Yes
identity | Yes
identity.email | Yes
identityPrivate | No
idltest | Yes, but useless
imageWriterPrivate | No
input | Yes (not Mac)
inputMethodPrivate | No
languageSettingsPrivate | No
launcherSearchProvider | No
lockWindowFullscreenPrivate | No
login | No
loginScreenStorage | No
loginScreenUi | No
loginState | No
webcamPrivate | No
networking.castPrivate | No
management | Yes
mediaPlayerPrivate | No
mediaRouterPrivate | No
mdns | No
notifications | Yes
echoPrivate | No
pageCapture | Yes
passwordsPrivate | No
platformKeys | No
plugin | Yes - TODO what is this?
printing | No
printingMetrics | No
privacy | Yes
processes | No
proxy | Yes
resourcesPrivate | No
rtcPrivate | No
safeBrowsingPrivate | No
scripting | Yes (m3)
search | Yes
sessions | Yes
settingsPrivate | No
signedInDevices | No (maybe future)
systemPrivate | No
tabGroups | Yes (m3)
tabs | Yes
tabCapture | Yes
terminalPrivate | No
topSites | Yes
transientBackground | No (maybe future)
tts | Yes
ttsEngine | Yes
usersPrivate | No
wallpaper | No
wallpaperPrivate | No
webNavigation | Yes
webrtcAudioPrivate | No
webrtcDesktopCapturePrivate | No
webrtcLoggingPrivate | No
webrtcLoggingPrivate.audioDebug | No
webstorePrivate | No

----------

End of file.
