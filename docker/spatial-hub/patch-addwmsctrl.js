/**
 * Patches addWMSCtrl.js before the Gradle build to fix two bugs:
 *
 * Bug 1 (addLayer): String.length() is not a function — .length() throws TypeError
 *   for every preset WMS URL (which has no '?'), so the layer is never added.
 *
 * Bug 2 (getCapabilities): The bare WMS endpoint URL is proxied without
 *   '?service=WMS&request=GetCapabilities', causing the server to return a
 *   ServiceExceptionReport instead of WMS_Capabilities XML.  x2js then fails
 *   silently, availableLayers stays empty, and the Add-to-map button never
 *   becomes clickable.
 */
const fs = require('fs');
const filePath = './grails-app/assets/javascripts/spApp/controller/addWMSCtrl.js';

let src = fs.readFileSync(filePath, 'utf8');

// Fix 1: .length() → .length
const fix1Before = '.selectedServer.length()';
const fix1After  = '.selectedServer.length';
if (!src.includes(fix1Before)) throw new Error('Fix 1: pattern not found — upstream changed?');
src = src.replace(fix1Before, fix1After);

// Fix 2: append ?service=WMS&request=GetCapabilities to the getCapabilities URL
const fix2Before = 'var url = $scope.selectedServer + ($scope.version ? "&version=" + $scope.version : "");';
const fix2After  =
    "var sep = $scope.selectedServer.indexOf('?') >= 0 ? '&' : '?';\n" +
    "                    var url = $scope.selectedServer + sep + 'service=WMS&request=GetCapabilities'" +
    " + ($scope.version ? '&version=' + $scope.version : '');";
if (!src.includes(fix2Before)) throw new Error('Fix 2: pattern not found — upstream changed?');
src = src.replace(fix2Before, fix2After);

fs.writeFileSync(filePath, src);
console.log('addWMSCtrl.js patched successfully');
