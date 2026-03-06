
from getpass import getpass
import os

import aiohttp


OIDC_CLIENT_ID = os.getenv("OIDC_CLIENT_ID", "create-user-script")
OIDC_CLIENT_SECRET = os.getenv("OIDC_CLIENT_SECRET")

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "https://auth.inbo.be")
KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME", "vbp")

KEYCLOAK_USERNAME = os.getenv("KEYCLOAK_USERNAME")
KEYCLOAK_PASSWORD = os.getenv("KEYCLOAK_PASSWORD")


async def get_oidc_token() -> str:
    if OIDC_CLIENT_SECRET:
        oidc_client_secret = OIDC_CLIENT_SECRET
    else:
        oidc_client_secret = input("Enter the oidc client secret: ")
    if KEYCLOAK_USERNAME:
        username = KEYCLOAK_USERNAME
    else:
        username = input("Enter your username: ")
    if KEYCLOAK_PASSWORD:
        password = KEYCLOAK_PASSWORD
    else:
        password = getpass("Enter your password: ")

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KEYCLOAK_URL}/realms/{KEYCLOAK_REALM_NAME}/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": OIDC_CLIENT_ID,
                "client_secret": oidc_client_secret,
                "username": username,
                "password": password,
                "scope": "openid",
            },
        ) as response:
            token_response = await response.json()
            if response.status != 200:
                raise Exception(
                    f"Failed to obtain access token. Status: {response.status}, Response: {token_response}"
                )
            return token_response["access_token"]
