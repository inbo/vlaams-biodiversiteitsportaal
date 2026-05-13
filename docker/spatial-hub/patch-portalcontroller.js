/**
 * Patches PortalController.groovy to allow configurable anonymous access to the proxy.
 */
const fs = require('fs');
const filePath = './grails-app/controllers/au/org/ala/spatial/portal/PortalController.groovy';

let src = fs.readFileSync(filePath, 'utf8');

// Replace the hardcoded userId check with a configurable check
const proxyBefore = 'def userId = getValidUserId(params)\n\n        if (!userId) {\n            notAuthorised()';
const proxyAfter  = 
    'def userId = getValidUserId(params)\n' +
    '        def allowAnonymous = Holders.config.security.oidc.allowAnonymousProxy ?: false\n\n' +
    '        if (!userId && !allowAnonymous) {\n' +
    '            notAuthorised()';

if (src.includes(proxyBefore)) {
    src = src.replace(proxyBefore, proxyAfter);
} else {
    // Try alternative whitespace
    const altBefore = 'def userId = getValidUserId(params)\n        if (!userId) {\n            notAuthorised()';
    const altAfter = 
        'def userId = getValidUserId(params)\n' +
        '        def allowAnonymous = Holders.config.security.oidc.allowAnonymousProxy ?: false\n' +
        '        if (!userId && !allowAnonymous) {\n' +
        '            notAuthorised()';
    if (src.includes(altBefore)) {
        src = src.replace(altBefore, altAfter);
    } else {
        throw new Error('Could not find proxy authentication check in PortalController.groovy');
    }
}

console.log('PortalController.groovy patched: proxy access is now environment-configurable');
fs.writeFileSync(filePath, src);
