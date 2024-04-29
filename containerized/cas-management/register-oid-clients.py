#!/usr/bin/env python
import requests

clients = [
    {
        "name": "collectory",
        "client_id": "485e3a6ecfa6065ab728eb9fe63fe91e62d1",
        "client_secret": "1b5515b804ab42427475ae9949e77d23d0db",
        "url": "http://collections.la-flanders.org"
    },
    {
        "name": "ala_hub",
        "client_id": "7e4d70b59b38cf455269a8746bcac610d333",
        "client_secret": "a42e365c8a3dc80b6e7c93a1485ae22aa4c0",
        "url": "http://records.la-flanders.org"
    },
    {
        "name": "biocache_service",
        "client_id": "5cf9d53d91a957ee041996c2073be302d267",
        "client_secret": "24152db197bdf9d24dea3386475ec8b8adcd",
        "url": "http://records-ws.la-flanders.org"
    },
    {
        "name": "ala_bie",
        "client_id": "753e71420a67ddb24cbc10d85a87d6073414",
        "client_secret": "0efee21e743303cd49a78deca397ae98256c",
        "url": "http://species.la-flanders.org/callback?client_name=OidcClient"
    },
    {
        "name": "bie_index",
        "client_id": "0cf3eff57958b4bb76eca5055021bcf59bc5",
        "client_secret": "895c1a54c053b38953b5b3d3466f7a171659",
        "url": "http://species-ws.la-flanders.org"
    },
    {
        "name": "images",
        "client_id": "871aeec889021f0fb4b587b0bfb0af1cf7d3",
        "client_secret": "a6d3aed6a75bcfa6da9ff8d58ce0eb23babc",
        "url": "http://images.la-flanders.org"
    },
    {
        "name": "logger",
        "client_id": "46956e0f3417a06b084dfd6725fdb27b4988",
        "client_secret": "de3ac90fc3b664e5a702e666f04659a96513",
        "url": "http://logger.la-flanders.org"
    },
    {
        "name": "lists",
        "client_id": "0f36a12c63bda969b11f332e659a69f2589c",
        "client_secret": "a0e1ea16f5f638a4cd0e0a7a2f1a81a5ede5",
        "url": "http://lists.la-flanders.org"
    },
    {
        "name": "regions",
        "client_id": "71f929bf8941808865862db302697a865f8d",
        "client_secret": "eca12458af7e2bc51dcd4215c439ee8f6916",
        "url": "http://regions.la-flanders.org"
    },
    {
        "name": "alerts",
        "client_id": "681414ffab5755f0253922f302225206cb75",
        "client_secret": "1633dafc26d940e53b36f7160a6d1eef7158",
        "url": ""
    },
    {
        "name": "doi",
        "client_id": "0c32c45efc90f5610605358d0537a285d55b",
        "client_secret": "d6b37b81af70b9bf2ebd728d92ed80bd75ed",
        "url": "https://doi.ala.org.au"
    },
    {
        "name": "dashboard",
        "client_id": "3f57e42a14595403746e1c2be5c1f7ec86e2",
        "client_secret": "9b7b0f7d9e2a45b9720cd0875d575e85606f",
        "url": ""
    },
    {
        "name": "sds",
        "client_id": "f266aa1eb862018285f14dcfea717c4bd6a8",
        "client_secret": "bcf8f757d8cd99cb34ea1346f738908bf6be",
        "url": ""
    },
    {
        "name": "spatial",
        "client_id": "5c7e3ed9991e67050d626edc2068fb16f584",
        "client_secret": "8f0bff11d9aa5572aa7c6e990a6cdbf728cd",
        "url": "http://spatial.la-flanders.org"
    },
    {
        "name": "data_quality",
        "client_id": "bcfd50e0f54f61894d792a4e3559be07e3fb",
        "client_secret": "f12829acab4dd0bf67b043fa04347d999828",
        "url": ""
    },
    {
        "name": "biocollect",
        "client_id": "37df1ad6165740ecd05014eab9657fbc20df",
        "client_secret": "aea25ffb7024a8c7c373326204bcd315e26d",
        "url": ""
    },
    {
        "name": "ecodata",
        "client_id": "cd7ee4e70c4d509d25ac13ffba9638f0cf73",
        "client_secret": "6f43e208e416890b3c7fe38e4f5992c0b45e",
        "url": ""
    }
]

i = 1000
for client in clients:
    response = requests.post("http://auth.la-flanders.org/cas/actuator/registeredServices/import", json={
        "@class": "org.apereo.cas.services.OidcRegisteredService",
        "clientId": client['name'],
        "clientSecret": f"{client['name']}-oidc-super-secret",
        "serviceId": client['url'],
        "name": client['name'],
        "id": i,
        "scopes": ["java.util.HashSet", ["users/read", "Openid", "Email", "Profile", "ala", "roles"]]
    })
    print(f"{client['name']}: {response.status_code} | {response.text}")

    i += 1
