console.log(`Building static pages for ${process.env.NODE_ENV} environment`)

let protocol = 'https';
let baseDomain = 'biodiversiteitsportaal.dev.svdev.be';
let brandingDomain = baseDomain
let loginUrl = "https://biodiversiteitsportaal-dev.auth.eu-west-1.amazoncognito.com/login?client_id=7072p1h0hnf2hiu7172iuqjsbb&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fwww.biodiversiteitsportaal.dev.svdev.be?auth-cookie-action=set"
let logoutUrl = "https://biodiversiteitsportaal-dev.auth.eu-west-1.amazoncognito.com/logout?client_id=7072p1h0hnf2hiu7172iuqjsbb&logout_uri=https%3A%2F%2Fwww.biodiversiteitsportaal.dev.svdev.be?auth-cookie-action=remove"

if (process.env.NODE_ENV === 'docker') {
    protocol = 'http';
    baseDomain = 'la-flanders.org:8080';
    brandingDomain = 'la-flanders.org';
    loginUrl = "http://localhost:9999/default/authorize?client_id=7072p1h0hnf2hiu7172iuqjsbb&response_type=code&scope=openid&redirect_uri=http%3A%2F%2Fwww.la-flanders.org?auth-cookie-action=remove"
    logoutUrl = "http://localhost:9999/default/endsession?post_logout_redirect_uri=http%3A%2F%2Fwww.la-flanders.org?auth-cookie-action=remove"
}

module.exports = {
  isDevel: false,
  inMante: false, // set to true and deploy if you want to set a maintenance message in all the services
  enabledLangs: ['nl', 'en'],
  mainDomain: brandingDomain, // used for cookies (without http/https)
  mainLAUrl: `${protocol}://www.${brandingDomain}`,
  baseFooterUrl: `${protocol}://${brandingDomain}`,
  theme: 'vlaanderen', // for now 'material', 'clean', 'superhero', 'yeti', 'cosmo', 'darkly', 'paper', 'sandstone', 'simplex', 'slate' or 'flatly' themes are available. See the last ones in: https://bootswatch.com/3/
  services: {
    collectory: { url: `${protocol}://collections.${baseDomain}`, title: 'Collections' },
    biocache: { url: `${protocol}://records.${baseDomain}`, title: 'Occurrence records' },
    biocacheService: { url: `${protocol}://records-ws.${baseDomain}`, title: 'Occurrence records webservice' },
    bie: { url: `${protocol}://species.${baseDomain}`, title: 'Species' },
    // This bieService var is used by the search autocomplete. With your BIE
    bieService: { url: `${protocol}://species-ws.${baseDomain}`, title: 'Species webservice' },
    regions: { url: `${protocol}://regions.${baseDomain}`, title: 'Regions' },
    lists: { url: `${protocol}://lists.${baseDomain}`, title: 'Species List' },
    spatial: { url: `${protocol}://spatial.${baseDomain}`, title: 'Spatial Portal' },
    images: { url: `${protocol}://images.${baseDomain}`, title: 'Images Service' },
    cas: { url: `${protocol}://auth.${baseDomain}`, title: 'CAS' }
  },
  loginUrl: loginUrl,
  logoutUrl: logoutUrl,
  otherLinks: [
    { title: 'Datasets', url: `${protocol}://collections.${baseDomain}/datasets` },
    { title: 'Explore your area', url: `${protocol}://records.${baseDomain}/explore/your-area/` }
  ]
}
