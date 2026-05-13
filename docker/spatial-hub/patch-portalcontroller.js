/**
 * Patches PortalController.groovy to allow public access to the proxy action.
 * This is necessary because OIDC session sharing between the main portal 
 * and the spatial-hub container often fails on dev/prod environments,
 * causing 401 errors when trying to load WMS layers.
 */
const fs = require('fs');
const filePath = './grails-app/controllers/au/org/ala/spatial/portal/PortalController.groovy';

let src = fs.readFileSync(filePath, 'utf8');

// Remove the userId check in the proxy() method
const proxyBefore = 'def userId = getValidUserId(params)\n\n        if (!userId) {\n            notAuthorised()';
const proxyAfter  = 'def userId = getValidUserId(params)\n\n        if (false) { // Patch: allow public proxy access\n            notAuthorised()';

if (!src.includes(proxyBefore)) {
    // Try without the extra newline or slightly different whitespace
    const altBefore = 'def userId = getValidUserId(params)\n        if (!userId) {\n            notAuthorised()';
    if (src.includes(altBefore)) {
        src = src.replace(altBefore, 'def userId = getValidUserId(params)\n        if (false) {\n            notAuthorised()');
    } else {
        throw new Error('Could not find proxy authentication check in PortalController.groovy');
    }
} else {
    src = src.replace(proxyBefore, proxyAfter);
}

console.log('PortalController.groovy patched: proxy is now public');
fs.writeFileSync(filePath, src);
