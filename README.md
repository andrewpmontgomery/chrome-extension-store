# chrome-extension-store
Chrome Extension Store for Enterprise

This is a proof-of-concept of a private Chrome Extension Store for Enterprise use.

## THIS DOESN'T WORK YET


#### Launching Chrome




###### CRX3 file format

http://gromnitsky.blogspot.com/2019/04/crx3.html  
(by the author of crx3-utils)

###### CRX proof information

https://blog.janestreet.com/chrome-extensions-finding-the-missing-proof/

#### Registry settings

###### Windows

To force-install an extension, create this registry key and child value:
* Key: HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist (note lowercase list)
* Name: "1"
* Type: REG_SZ
* Data: "demoknhoknhkmcponecodnkfphccjjbo;http://localhost:5000/service/crx/update.xml"

To enable our custom extension store, create this registry key and child value:
* Key: HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallSources
* Name: "1"
* Type: REG_SZ
* Data: "http://localhost:5000/*"

Because we're using plain HTTP, not HTTPS, we need to bypass Chrome's security:
* Key: HKLM\SOFTWARE\Policies\Google\Chrome\OverrideSecurityRestrictionsOnInsecureOrigin
* Name: "1"
* Type: "REG_SZ"
* Data: "http://localhost:5000"

###### Linux

See here: https://sites.google.com/site/lock5stat/offline-use/installing-for-all-users  

Change into Chrome's managed policies directory (Create this directory if it doesn't exist):

/etc/opt/chrome/policies/managed

Make sure that files within this directory are non-writable by non-admin users.  Now, create a file in the directory named chromestore.json.

Paste the following code into the file:

  {
    "ExtensionInstallForcelist": ["demoknhoknhkmcponecodnkfphccjjbo;http://localhost:5000/service/crx/update.xml"]
  }
