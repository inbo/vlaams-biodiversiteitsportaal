/**
 * Patches addWMSCtrl.js before the Gradle build to fix five bugs:
 *
 * Bug 1 (addLayer): String.length() is not a function — .length() throws TypeError
 *   for every preset WMS URL (which has no '?'), so the layer is never added.
 *
 * Bug 2 (getCapabilities): The bare WMS endpoint URL is proxied without
 *   '?service=WMS&request=GetCapabilities', causing the server to return a
 *   ServiceExceptionReport instead of WMS_Capabilities XML.
 *
 * Bug 3 (getCapabilities): No null-check on xml.WMS_Capabilities before accessing
 *   it — throws TypeError when the server returns anything other than
 *   WMS_Capabilities XML.
 *
 * Bug 4 (getCapabilities): Improved recursive layer finding. The original code
 *   was too shallow and missed many layers (especially in ArcGIS/INBO servers).
 *
 * Bug 5 (addLayerFromGetMapRequest): The WMS base URL is passed unproxied to
 *   MapService.add(), so Leaflet makes GetMap tile requests directly from the
 *   browser.  These fail with CORS errors and produce an invisible layer.
 */
const fs = require('fs');
const filePath = './grails-app/assets/javascripts/spApp/controller/addWMSCtrl.js';

let src = fs.readFileSync(filePath, 'utf8');

// ── Fix 1: .length() → .length ────────────────────────────────────────────────
const fix1Before = '.selectedServer.length()';
const fix1After  = '.selectedServer.length';
if (!src.includes(fix1Before)) throw new Error('Fix 1: pattern not found — upstream changed?');
src = src.replace(fix1Before, fix1After);
console.log('Fix 1 applied: .length() → .length');

// ── Fix 2: append ?service=WMS&request=GetCapabilities ────────────────────────
const fix2Before = 'var url = $scope.selectedServer + ($scope.version ? "&version=" + $scope.version : "");';
const fix2After  =
    "var sep = $scope.selectedServer.indexOf('?') >= 0 ? '&' : '?';\n" +
    "                    var url = $scope.selectedServer + sep + 'service=WMS&request=GetCapabilities'" +
    " + ($scope.version ? '&version=' + $scope.version : '');";
if (!src.includes(fix2Before)) throw new Error('Fix 2: pattern not found — upstream changed?');
src = src.replace(fix2Before, fix2After);
console.log('Fix 2 applied: added ?service=WMS&request=GetCapabilities');

// ── Fix 3 + 4: rewrite the .success callback with recursion ───────────────────
const fix34Regex = /\.success\(function \(resp\) \{[\s\S]+\}\)(?=\s*\.error)/;
if (!fix34Regex.test(src)) throw new Error('Fix 3+4: .success callback pattern not found — upstream changed?');

const fix34After =
`.success(function (resp) {
                        $scope.availableLayers = [];
                        var x2js = new X2JS({attributePrefix: []});
                        var xml = x2js.xml_str2json(resp);

                        if (!xml || !xml.WMS_Capabilities) {
                            var errMsg = 'Unexpected response from WMS server (no WMS_Capabilities found)';
                            if (xml && xml.ServiceExceptionReport && xml.ServiceExceptionReport.ServiceException) {
                                errMsg = String(
                                    xml.ServiceExceptionReport.ServiceException.__text ||
                                    xml.ServiceExceptionReport.ServiceException._code ||
                                    errMsg
                                );
                            }
                            $scope.warning = errMsg;
                            return;
                        }

                        var version = xml.WMS_Capabilities.version || xml.WMS_Capabilities._version;
                        
                        function getLegendUrl(lyr) {
                            if (!lyr || !lyr.Style) return '';
                            var styles = lyr.Style;
                            var firstStyle = Array.isArray(styles) ? styles[0] : styles;
                            if (!firstStyle || !firstStyle.LegendURL || !firstStyle.LegendURL.OnlineResource) return '';
                            var res = firstStyle.LegendURL.OnlineResource['xlink:href'] || firstStyle.LegendURL.OnlineResource.href || '';
                            if (!res) return '';
                            return $SH.baseUrl + '/portal/proxy?url=' + encodeURIComponent(res);
                        }

                        function findLayers(node) {
                            if (!node) return;
                            if (node.Layer) {
                                var children = Array.isArray(node.Layer) ? node.Layer : [node.Layer];
                                for (var i=0; i < children.length; i++) {
                                    var lyr = children[i];
                                    if (lyr.Name) {
                                        var name = typeof lyr.Name === 'string' ? lyr.Name : (lyr.Name.__text || lyr.Name.toString());
                                        var title = typeof lyr.Title === 'string' ? lyr.Title : (lyr.Title ? (lyr.Title.__text || lyr.Title.toString()) : name);
                                        $scope.availableLayers.push({
                                            displayname: title,
                                            name: name,
                                            title: title,
                                            version: version,
                                            legendurl: getLegendUrl(lyr)
                                        });
                                    }
                                    findLayers(lyr); // Recurse
                                }
                            }
                        }

                        if (xml.WMS_Capabilities.Capability) {
                            findLayers(xml.WMS_Capabilities.Capability);
                        }
                    })`;

src = src.replace(fix34Regex, fix34After);
console.log('Fix 3+4 applied: Recursive layer finding enabled');

// ── Fix 5: proxy the WMS base URL in the manual (GetMap URL) mode ─────────────
const fix5Before = 'url: result.URL,';
const fix5After  = 'url: $SH.baseUrl + "/portal/proxy?url=" + encodeURIComponent(result.URL),';
if (!src.includes(fix5Before)) throw new Error('Fix 5: pattern not found — upstream changed?');
src = src.replace(fix5Before, fix5After);
console.log('Fix 5 applied: proxy URL in addLayerFromGetMapRequest');

fs.writeFileSync(filePath, src);
console.log('addWMSCtrl.js patched successfully');
