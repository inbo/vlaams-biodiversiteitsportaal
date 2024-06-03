#!/usr/bin/env python
import requests

PROTOCOL = 'https'
DOMAIN = 'biodiversiteitsportaal.dev.svdev.be'

# Service specific OIDC clients
clients = [
    {
        "client_id": "collectory",
        "name": "OidcClient",
        "client_secret": "1b5515b804ab42427475ae9949e77d23d0db",
        "url": f"^{PROTOCOL}://collections.{DOMAIN}/.*$"
    },
    {
        "client_id": "ala_hub",
        "name": "OidcClient",
        "client_secret": "a42e365c8a3dc80b6e7c93a1485ae22aa4c0",
        "url": f"^{PROTOCOL}://records.{DOMAIN}/.*$"
    },
    {
        "client_id": "biocache_service",
        "name": "OidcClient",
        "client_secret": "24152db197bdf9d24dea3386475ec8b8adcd",
        "url": f"^{PROTOCOL}://records-ws.{DOMAIN}/.*$"
    },
    {
        "client_id": "ala_bie",
        "name": "OidcClient",
        "client_secret": "0efee21e743303cd49a78deca397ae98256c",
        "url": f"^{PROTOCOL}://species.{DOMAIN}/.*$"
    },
    {
        "client_id": "bie_index",
        "name": "OidcClient",
        "client_secret": "895c1a54c053b38953b5b3d3466f7a171659",
        "url": f"^{PROTOCOL}://species-ws.{DOMAIN}/.*$"
    },
    {
        "client_id": "images",
        "name": "OidcClient",
        "client_secret": "a6d3aed6a75bcfa6da9ff8d58ce0eb23babc",
        "url": f"^{PROTOCOL}://images.{DOMAIN}/.*$"
    },
    {
        "client_id": "logger",
        "name": "OidcClient",
        "client_secret": "de3ac90fc3b664e5a702e666f04659a96513",
        "url": f"^{PROTOCOL}://logger.{DOMAIN}/.*$"
    },
    {
        "client_id": "lists",
        "name": "OidcClient",
        "client_secret": "a0e1ea16f5f638a4cd0e0a7a2f1a81a5ede5",
        "url": f"^{PROTOCOL}://lists.{DOMAIN}/.*$"
    },
    {
        "client_id": "regions",
        "name": "OidcClient",
        "client_secret": f"eca12458af7e2bc51dcd4215c439ee8f6916",
        "url": f"^{PROTOCOL}://regions.{DOMAIN}/.*$"
    },
    {
        "client_id": "alerts",
        "name": "OidcClient",
        "client_secret": "1633dafc26d940e53b36f7160a6d1eef7158",
        "url": ""
    },
    {
        "client_id": "doi",
        "name": "OidcClient",
        "client_secret": "d6b37b81af70b9bf2ebd728d92ed80bd75ed",
        "url": "https://doi.ala.org.au"
    },
    {
        "client_id": "dashboard",
        "name": "OidcClient",
        "client_secret": "9b7b0f7d9e2a45b9720cd0875d575e85606f",
        "url": ""
    },
    {
        "client_id": "sds",
        "name": "OidcClient",
        "client_secret": "bcf8f757d8cd99cb34ea1346f738908bf6be",
        "url": ""
    },
    {
        "client_id": "spatial",
        "name": "OidcClient",
        "client_secret": "8f0bff11d9aa5572aa7c6e990a6cdbf728cd",
        "url": ".*"
    },
    {
        "client_id": "data_quality",
        "name": "OidcClient",
        "client_secret": "f12829acab4dd0bf67b043fa04347d999828",
        "url": ""
    },
    {
        "client_id": "biocollect",
        "name": "OidcClient",
        "client_secret": "aea25ffb7024a8c7c373326204bcd315e26d",
        "url": ""
    },
    {
        "client_id": "ecodata",
        "name": "OidcClient",
        "client_secret": "6f43e208e416890b3c7fe38e4f5992c0b45e",
        "url": ""
    }
]

i = 1000
for client in clients:
    response = requests.post(f"{PROTOCOL}://auth.{DOMAIN}/cas/actuator/registeredServices/import", json={
        "@class": "org.apereo.cas.services.OidcRegisteredService",
        "clientId": client['client_id'],
        "clientSecret": f"{client['client_id']}-oidc-super-secret",
        "serviceId": client['url'],
        "name": client['name'],
        "id": i,
        "scopes": ["java.util.HashSet", ["users/read", "Openid", "Email", "Profile", "ala", "roles"]]
    })
    print(f"{client['name']}: {response.status_code} | {response.text}")

    i += 1
#
# # General CAS Service
# response = requests.post(f"{PROTOCOL}://auth.{DOMAIN}/cas/actuator/registeredServices/import", json={
#     "@class": "org.apereo.cas.services.RegexRegisteredService",
#     "serviceId": "^https?://.*",
#     "name": "Atlas of Living Australia",
#     "theme": "ala",
#     "id": "10000003",
#     "description": "All Atlas Services",
#     "expirationPolicy": {
#         "@class": "org.apereo.cas.services.DefaultRegisteredServiceExpirationPolicy",
#         "deleteWhenExpired": "false",
#         "notifyWhenDeleted": "false"
#     },
#     "proxyPolicy": {
#         "@class": "org.apereo.cas.services.RefuseRegisteredServiceProxyPolicy"
#     },
#     "evaluationOrder": "1",
#     "usernameAttributeProvider": {
#         "@class": "org.apereo.cas.services.DefaultRegisteredServiceUsernameProvider",
#         "canonicalizationMode": "NONE",
#         "encryptUsername": "false"
#     },
#     "logoutType": "BACK_CHANNEL",
#     "attributeReleasePolicy": {
#         "@class": "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
#         "principalAttributesRepository": {
#             "@class": "org.apereo.cas.authentication.principal.DefaultPrincipalAttributesRepository",
#             "expiration": "2",
#             "timeUnit": "HOURS"
#         },
#         "consentPolicy": {
#             "@class": "org.apereo.cas.services.consent.DefaultRegisteredServiceConsentPolicy",
#             "enabled": "true"
#         },
#         "authorizedToReleaseCredentialPassword": "false",
#         "authorizedToReleaseProxyGrantingTicket": "false",
#         "excludeDefaultAttributes": "false",
#         "authorizedToReleaseAuthenticationAttributes": "true"
#     },
#     "multifactorPolicy": {
#         "@class": "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
#         "failureMode": "UNDEFINED",
#         "bypassEnabled": "false"
#     },
#     "accessStrategy": {
#         "@class": "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
#         "order": "0",
#         "enabled": "true",
#         "ssoEnabled": "true",
#         "delegatedAuthenticationPolicy": {
#             "@class": "org.apereo.cas.services.DefaultRegisteredServiceDelegatedAuthenticationPolicy"
#         },
#         "requireAllAttributes": "true",
#         "caseInsensitive": "false"
#     }
# })
# print(f"General CAS service: {response.status_code} | {response.text}")
