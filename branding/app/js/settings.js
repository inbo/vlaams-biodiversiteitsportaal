console.log(`Building static pages for ${process.env.NODE_ENV} environment`)

let loginUrl = "https://biodiversiteitsportaal-dev.auth.eu-west-1.amazoncognito.com/login?client_id=7072p1h0hnf2hiu7172iuqjsbb&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fwww.biodiversiteitsportaal.dev.svdev.be?auth-cookie-action=set"
let logoutUrl = "https://biodiversiteitsportaal-dev.auth.eu-west-1.amazoncognito.com/logout?client_id=7072p1h0hnf2hiu7172iuqjsbb&logout_uri=https%3A%2F%2Fwww.biodiversiteitsportaal.dev.svdev.be?auth-cookie-action=remove"

if (process.env.NODE_ENV === 'docker') {
    loginUrl = "http://localhost:9999/default/authorize?client_id=7072p1h0hnf2hiu7172iuqjsbb&response_type=code&scope=openid&redirect_uri=http%3A%2F%2Fwww.la-flanders.org?auth-cookie-action=remove"
    logoutUrl = "http://localhost:9999/default/endsession?post_logout_redirect_uri=http%3A%2F%2Fwww.la-flanders.org?auth-cookie-action=remove"
}

module.exports = {
  isDevel: false,
  inMante: false, // set to true and deploy if you want to set a maintenance message in all the services
  enabledLangs: ['nl', 'en'],
  mainDomain: brandingDomain, // used for cookies (without http/https)
  mainLAUrl: '',
  baseFooterUrl: '',
  theme: 'vlaanderen', // for now 'material', 'clean', 'superhero', 'yeti', 'cosmo', 'darkly', 'paper', 'sandstone', 'simplex', 'slate' or 'flatly' themes are available. See the last ones in: https://bootswatch.com/3/
  services: {
    collectory: { url: '/collectory/', title: 'Collections' },
    biocache: { url: '/biocache-hub/', title: 'Occurrence records' },
    biocacheService: { url: '/biocache-service/', title: 'Occurrence records webservice' },
    bie: { url: '', title: '/bie-hub/' },
    // This bieService var is used by the search autocomplete. With your BIE
    bieService: { url: '/bie-index/', title: 'Species webservice' },
    regions: { url: '/regions/', title: 'Regions' },
    lists: { url: '/species-list/', title: 'Species List' },
    spatial: { url: '/spatial-hub/', title: 'Spatial Portal' },
    images: { url: '/image-service/', title: 'Images Service' },
    cas: { url: '', title: 'CAS' }
  },
  loginUrl: loginUrl,
  logoutUrl: logoutUrl,
  otherLinks: [
    { title: 'Datasets', url: 'collections.${baseDomain}/datasets` },
    { title: 'Explore your area', url: 'records.${baseDomain}/explore/your-area/` }
  ]
}
