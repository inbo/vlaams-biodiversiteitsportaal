console.log(`Building static pages for ${process.env.NODE_ENV} environment`)

let protocol = "https"
let domain = "::BASE_DOMAIN::"
let loginUrl = "::KEYCLOAK_URL::/realms/vbp/protocol/openid-connect/auth?client_id=::KEYCLOAK_CLIENT_ID::&response_type=code&scope=openid&redirect_uri=https%3A%2F%2F::BASE_DOMAIN::?auth-cookie-action=set"
let logoutUrl = "::KEYCLOAK_URL::/realms/vbp/protocol/openid-connect/logout?client_id=::KEYCLOAK_CLIENT_ID::&logout_uri=https%3A%2F%2F::BASE_DOMAIN::?auth-cookie-action=remove"

if (process.env.NODE_ENV === 'development') {
    protocol = "http"
    domain = "localhost"
    loginUrl = "http://localhost:9999/default/authorize?client_id=7072p1h0hnf2hiu7172iuqjsbb&response_type=code&scope=openid&redirect_uri=http%3A%2F%2Flocalhost?auth-cookie-action=remove"
    logoutUrl = "http://localhost:9999/default/endsession?post_logout_redirect_uri=http%3A%2F%2Flocalhost?auth-cookie-action=remove"
}

module.exports = {
  isDevel: false,
  inMante: false, // set to true and deploy if you want to set a maintenance message in all the services
  enabledLangs: ['nl', 'en'],
  mainDomain: domain, // used for cookies (without http/https)
  mainLAUrl: `${protocol}://${domain}`,
  baseFooterUrl: `${protocol}://${domain}`,
  theme: 'vlaanderen', // for now 'material', 'clean', 'superhero', 'yeti', 'cosmo', 'darkly', 'paper', 'sandstone', 'simplex', 'slate' or 'flatly' themes are available. See the last ones in: https://bootswatch.com/3/
  services: {
    collectory: { url: '/collectory', title: 'Collections' },
    biocache: { url: '/biocache-hub', title: 'Occurrence records' },
    biocacheService: { url: '/biocache-service', title: 'Occurrence records webservice' },
    bie: { url: '/bie-hub', title: 'Species' },
    // This bieService var is used by the search autocomplete. With your BIE
    bieService: { url: '/bie-index', title: 'Species webservice' },
    regions: { url: '/regions', title: 'Regions' },
    lists: { url: '/species-list', title: 'Species List' },
    spatial: { url: '/spatial-hub', title: 'Spatial Portal' },
    images: { url: '/image-service', title: 'Images Service' },
    cas: { url: '', title: 'CAS' }
  },
  loginUrl: loginUrl,
  logoutUrl: logoutUrl,
  otherLinks: [
    { title: 'Datasets', url: '/collectory/datasets' },
    { title: 'Explore your area', url: '/biocache-hub/explore/your-area/' }
  ]
}
