/**
 * Patches PortalService.groovy to tighten proxy URL validation.
 * 1. Makes protocol (http/https) mandatory.
 * 2. Ensures the URL starts with the permitted protocol and server.
 * 3. Escapes dots in the server name for exact domain matching.
 */
const fs = require('fs');
const filePath = './grails-app/services/au/org/ala/spatial/portal/PortalService.groovy';

let src = fs.readFileSync(filePath, 'utf8');

// The original pattern makes protocol optional and doesn't escape dots
const modeBefore = "def mode = '((^(https:|http:)\\/\\/)?SERVER\\/*)'";

// New pattern: mandatory protocol, escaped dots in SERVER, starts with protocol
const modeAfter  = "def mode = '^(https:|http:)\\\\/\\\\/' + SERVER.replace('.', '\\\\\\\\.') + '(\\\\/.*|$)'";

if (src.includes(modeBefore)) {
    src = src.replace(modeBefore, modeAfter);
} else {
    throw new Error('Could not find proxy validation pattern in PortalService.groovy');
}

console.log('PortalService.groovy patched: tightened proxy URL validation');
fs.writeFileSync(filePath, src);
