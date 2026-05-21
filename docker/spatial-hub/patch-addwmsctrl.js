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
 * Bug 4 (getCapabilities): The layer-parsing loop only pushes layers to
 *   availableLayers when they have Style.LegendURL.  Many WMS servers (including
 *   geo.api.vlaanderen.be/GRB) do not include <Style> or <LegendURL> elements at
 *   all, so availableLayers stays empty and the layer dropdown never appears.
 *
 * Bug 5 (addLayerFromGetMapRequest): The WMS base URL is passed unproxied to
 *   MapService.add(), so Leaflet makes GetMap tile requests directly from the
 *   browser.  These fail with CORS errors and produce an invisible layer.
 *   The automatic mode (addLayer) already proxies the URL correctly.
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

// ── Fix 3 + 4: rewrite the .success callback ──────────────────────────────────
//
// The original callback:
//   • crashes with TypeError if xml.WMS_Capabilities is absent (Bug 3)
//   • only adds layers that have Style.LegendURL — GRB/many servers omit these
//     entirely, so availableLayers stays empty and the dropdown never shows (Bug 4)
//
// Replacement: guard against bad responses (Fix 3) and push any named layer
// regardless of whether it has a legend URL (Fix 4).
const fix34Regex = /\.success\(function \(resp\) \{[\s\S]+\}\)(?=\s*\.error)/;
if (!fix34Regex.test(src)) throw new Error('Fix 3+4: .success callback pattern not found — upstream changed?');

const fix34After =
`.success(function (resp) {
                        $scope.availableLayers = [];
                        var x2js = new X2JS({attributePrefix: []});
                        var xml = x2js.xml_str2json(resp);

                        // Fix 3: guard against non-WMS responses (e.g. ServiceExceptionReport)
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

                        // x2js with attributePrefix:[] stores XML attributes without a prefix,
                        // so the WMS version="1.3.0" attribute is at .version, not ._version.
                        var version = xml.WMS_Capabilities.version || xml.WMS_Capabilities._version;
                        var rootLayer = xml.WMS_Capabilities.Capability && xml.WMS_Capabilities.Capability.Layer;
                        var layers = rootLayer
                            ? (Array.isArray(rootLayer.Layer)
                                ? rootLayer.Layer
                                : (rootLayer.Layer ? [rootLayer.Layer] : []))
                            : [];

                        // Fix 4: helper — build proxied legend URL only when available
                        function getLegendUrl(lyr) {
                            if (!lyr || !lyr.Style) return '';
                            var styles = lyr.Style;
                            var firstStyle = Array.isArray(styles) ? styles[0] : styles;
                            if (!firstStyle || !firstStyle.LegendURL || !firstStyle.LegendURL.OnlineResource) return '';
                            return $SH.baseUrl + '/portal/proxy?url=' +
                                encodeURIComponent(firstStyle.LegendURL.OnlineResource['xlink:href'] || '');
                        }

                        // Fix 4: recursively collect named layers at any nesting depth.
                        // WMS servers vary in structure:
                        //   GRB: flat — Capability.Layer.Layer[] are all leaf layers (Name, no children)
                        //   INBO: nested — Capability.Layer.Layer[] are group layers that have both
                        //         a Name (e.g. "Biologische waardering") AND sub-Layer children.
                        //         A flat one-level loop would push group names and never recurse into
                        //         the actual leaf layers, leaving availableLayers empty.
                        // Strategy: always recurse when sub-Layer children exist; also push the
                        // layer itself when it has a Name (leaf layers, and named group layers that
                        // are themselves valid WMS layer names).
                        function collectLayers(layerOrList) {
                            var list = Array.isArray(layerOrList) ? layerOrList : [layerOrList];
                            for (var j = 0; j < list.length; j++) {
                                var lyr = list[j];
                                if (!lyr) continue;
                                // If this layer has children, recurse into them first
                                if (lyr.Layer !== undefined) {
                                    collectLayers(lyr.Layer);
                                }
                                // Also push this layer itself if it has a Name
                                if (lyr.Name !== undefined) {
                                    $scope.availableLayers.push({
                                        displayname: lyr.Name,
                                        name: lyr.Name,
                                        title: lyr.Title,
                                        version: version,
                                        legendurl: getLegendUrl(lyr)
                                    });
                                }
                            }
                        }
                        collectLayers(layers);
                    })`;

src = src.replace(fix34Regex, fix34After);
console.log('Fix 3+4 applied: null-check on WMS_Capabilities + layers without Style.LegendURL now included');

// ── Fix 5: proxy the WMS base URL in the manual (GetMap URL) mode ─────────────
//
// In addLayerFromGetMapRequest, the layer url is set to result.URL (the raw WMS
// base URL, e.g. https://gisservices.inbo.be/arcgis/services/...).  Leaflet then
// makes GetMap tile requests DIRECTLY to that server from the browser, which fails
// with a CORS error and produces an empty/invisible layer.
//
// addLayer() (automatic mode) correctly wraps the URL in /portal/proxy?url=...
// so Leaflet's tile requests go through the spatial-hub proxy server-side.
// This fix applies the same treatment to the manual mode.
const fix5Before = 'url: result.URL,';
const fix5After  = 'url: $SH.baseUrl + "/portal/proxy?url=" + encodeURIComponent(result.URL),';
if (!src.includes(fix5Before)) throw new Error('Fix 5: pattern not found — upstream changed?');
src = src.replace(fix5Before, fix5After);
console.log('Fix 5 applied: proxy URL in addLayerFromGetMapRequest');

fs.writeFileSync(filePath, src);
console.log('addWMSCtrl.js patched successfully');
