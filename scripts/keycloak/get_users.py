
#! /usr/bin/env python3

import asyncio
import csv
import os
import aiohttp
import logging

from common.keycloak import KEYCLOAK_REALM_NAME, KEYCLOAK_URL, KEYCLOAK_USERNAME, get_oidc_token


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)



async def main():
    try:
        access_token = await get_oidc_token()
        async with aiohttp.ClientSession() as session:
            users = await get_users(session, access_token)
            logging.info(f"Users: {users}")

            with open('users.csv', 'w', newline='') as csvfile:
                user_writer = csv.writer(csvfile, delimiter=';',
                                        quotechar='"', quoting=csv.QUOTE_MINIMAL)
                for user in users:
                    user_writer.writerow([user['id'], user['username'], user['email']])
    except Exception:
        logging.exception(f"An error occurred: ", exc_info=True)


async def get_users(
    session: aiohttp.ClientSession, access_token: str
) -> str | None:
    async with session.get(
        f"{KEYCLOAK_URL}/admin/realms/{KEYCLOAK_REALM_NAME}/users?max=1000",
        headers={"Authorization": f"Bearer {access_token}"},
    ) as response:
        return await response.json()




if __name__ == "__main__":
    asyncio.run(main())
