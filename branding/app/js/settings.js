const baseDomain = 'biodiversiteitsportaal.dev.svdev.be';

module.exports = {
  isDevel: false,
  inMante: false, // set to true and deploy if you want to set a maintenance message in all the services
  enabledLangs: ['nl', 'en'],
  mainDomain: baseDomain, // used for cookies (without http/https)
  mainLAUrl: `https://www.${baseDomain}`,
  baseFooterUrl: `https://branding.${baseDomain}`,
  theme: 'vlaanderen', // for now 'material', 'clean', 'superhero', 'yeti', 'cosmo', 'darkly', 'paper', 'sandstone', 'simplex', 'slate' or 'flatly' themes are available. See the last ones in: https://bootswatch.com/3/
  services: {
    collectory: { url: `https://collections.${baseDomain}`, title: 'Collections' },
    biocache: { url: `https://records.${baseDomain}`, title: 'Occurrence records' },
    biocacheService: { url: `https://records-ws.${baseDomain}`, title: 'Occurrence records webservice' },
    bie: { url: `https://species.${baseDomain}`, title: 'Species' },
    // This bieService var is used by the search autocomplete. With your BIE
    bieService: { url: `https://species-ws.${baseDomain}`, title: 'Species webservice' },
    regions: { url: `https://regions.${baseDomain}`, title: 'Regions' },
    lists: { url: `https://lists.${baseDomain}`, title: 'Species List' },
    spatial: { url: `https://spatial.${baseDomain}`, title: 'Spatial Portal' },
    images: { url: `https://images.${baseDomain}`, title: 'Images Service' },
    cas: { url: `https://auth.${baseDomain}`, title: 'CAS' }
  },
  loginUrl: "https://biodiversiteitsportaal-dev.auth.eu-west-1.amazoncognito.com/login?client_id=7072p1h0hnf2hiu7172iuqjsbb&response_type=code&scope=openid&redirect_uri=https%3A%2F%2Fwww.biodiversiteitsportaal.dev.svdev.be?auth-cookie-action=set",
  logoutUrl: "https://biodiversiteitsportaal-dev.auth.eu-west-1.amazoncognito.com/logout?client_id=7072p1h0hnf2hiu7172iuqjsbb&logout_uri=https%3A%2F%2Fwww.biodiversiteitsportaal.dev.svdev.be?auth-cookie-action=remove",
  otherLinks: [
    { title: 'Datasets', url: `https://collections.${baseDomain}/datasets` },
    { title: 'Explore your area', url: `https://records.${baseDomain}/explore/your-area/` }
  ]
}
