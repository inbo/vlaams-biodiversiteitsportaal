#! /usr/bin/env python3

import asyncio
import aiohttp
import logging

from keycloak import  KEYCLOAK_REALM_NAME, KEYCLOAK_URL,get_oidc_token

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

USERS = {
    "Test": {
        "email": "support.natuurdata+test@inbo.be",
        "first_name": "Testerde",
        "last_name": "Test",
    },
}


async def main():
    try:
        access_token = await get_oidc_token()
        async with aiohttp.ClientSession() as session:
            for username, user_info in USERS.items():
                user_id = await get_user_id(session, access_token, username)
                if user_id is None:
                    user_id = await create_user(
                        session,
                        access_token,
                        {"username": username, **user_info}, 
                    )
                user_id = await get_user_id(session, access_token, username)
                assert user_id is not None, f"User ID for {username} should not be None after creation."
                await send_email(session, access_token, user_id)

    except Exception:
        logging.exception(f"An error occurred: ", exc_info=True)


async def get_user_id(
    session: aiohttp.ClientSession, access_token: str, username: str
) -> str | None:
    async with session.get(
        f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM_NAME}/users",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"username": username},
    ) as response:
        users = await response.json()
        if users:
            return users[0]["id"]
        return None


async def create_user(
    session: aiohttp.ClientSession, access_token: str, user_info: dict
):
    async with session.post(
        f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM_NAME}/users",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json={
            "username": user_info["username"],
            "firstName": user_info["first_name"],
            "lastName": user_info["last_name"],
            "email": user_info["email"],
            "enabled": True,
            "emailVerified": True,
            "credentials": [
                {
                    "type": "password",
                    "value": "securepassword",
                    "temporary": True,
                }
            ],
        },
    ) as response:
        if response.status == 201:
            logging.info(f"User {user_info['username']} created successfully.")
        else:
            error_response = await response.text()
            raise Exception(
                f"Failed to create user {user_info['username']}. Status: {response.status}, Response: {error_response}"
            )


async def send_email(session: aiohttp.ClientSession, access_token: str, user_id: str):
    async with session.put(
        f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM_NAME}/users/{user_id}/execute-actions-email",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json=["UPDATE_PASSWORD"],
    ) as response:
        if response.status == 204:
            logging.info(f"Email sent successfully to user ID {user_id}.")
        else:
            error_response = await response.text()
            raise Exception(
                f"Failed to send email to user ID {user_id}. Status: {response.status}, Response: {error_response}"
            )


if __name__ == "__main__":
    asyncio.run(main())
