"""Phase 2: read the CSV produced by ``extract_contacts.py`` and apply it.

For every (dataResource, contact) row in the CSV the script will:

* find or create the contact in the collectory (looked up by email),
* link the contact to the data resource if not already linked.

Contact lookups and per-data-resource contact lists are cached in-process so
that repeated emails / data resources do not cause redundant REST traffic.
"""

import asyncio
import csv
import logging
import os

import aiohttp

from keycloak import get_oidc_token

logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger(__name__)

BASE_URL = os.getenv("COLLECTORY_BASE_URL", "https://natuurdata.inbo.be/collectory/ws/")
if not BASE_URL.endswith("/"):
    BASE_URL += "/"

CSV_PATH = os.getenv("CONTACTS_CSV", "contacts.csv")


async def main() -> None:
    LOGGER.info("Reading rows from %s", CSV_PATH)
    rows = read_rows(CSV_PATH)
    LOGGER.info("Loaded %d rows", len(rows))

    if not rows:
        return

    LOGGER.info("Starting sync against %s", BASE_URL)
    oidc_token = await get_oidc_token()

    auth_headers = {
        "Authorization": f"Bearer {oidc_token}",
        "Accept": "application/json",
    }

    contact_id_by_email: dict[str, int | None] = {}
    existing_by_uid: dict[str, set[int]] = {}

    async with aiohttp.ClientSession(
        base_url=BASE_URL, headers=auth_headers
    ) as session:
        for row in rows:
            uid = row.get("dataResourceUid", "").strip()
            email = (row.get("email") or "").strip()
            if not uid:
                LOGGER.warning("Skipping row without dataResourceUid: %r", row)
                continue
            if not email:
                LOGGER.info(
                    "%s: skipping contact without email: %s",
                    uid,
                    row.get("firstName") or row.get("lastName"),
                )
                continue

            if email not in contact_id_by_email:
                contact_id_by_email[email] = await find_or_create_contact(
                    session, row
                )
            contact_id = contact_id_by_email[email]
            if contact_id is None:
                continue

            if uid not in existing_by_uid:
                existing_by_uid[uid] = await get_existing_contact_ids(session, uid)
            existing = existing_by_uid[uid]

            if contact_id in existing:
                LOGGER.info(
                    "%s: contact %s (%s) already linked",
                    uid,
                    contact_id,
                    email,
                )
                continue

            await link_contact_to_dataresource(session, uid, contact_id)
            existing.add(contact_id)
            LOGGER.info("%s: linked contact %s (%s)", uid, contact_id, email)


def read_rows(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


async def get_existing_contact_ids(
    session: aiohttp.ClientSession, uid: str
) -> set[int]:
    async with session.get(f"dataResource/{uid}/contacts") as response:
        if response.status != 200:
            return set()
        data = await response.json()
    ids: set[int] = set()
    for entry in data:
        c = entry.get("contact") or entry
        cid = c.get("id") or entry.get("id")
        if cid is not None:
            try:
                ids.add(int(cid))
            except (TypeError, ValueError):
                pass
    return ids


async def find_or_create_contact(
    session: aiohttp.ClientSession, contact: dict
) -> int | None:
    email = (contact.get("email") or "").strip()
    if not email:
        return None
    existing = await find_contact_by_email(session, email)
    if existing is not None:
        return existing

    payload = {
        k: v
        for k, v in {
            "firstName": (contact.get("firstName") or "").strip() or None,
            "lastName": (contact.get("lastName") or "").strip() or None,
            "email": email,
            "phone": (contact.get("phone") or "").strip() or None,
        }.items()
        if v
    }
    LOGGER.info("Creating contact %r", payload)
    async with session.post("contacts", json=payload) as response:
        if response.status not in (200, 201):
            body = await response.text()
            LOGGER.warning(
                "Failed to create contact %s: HTTP %s %s",
                email,
                response.status,
                body[:200],
            )
            return None
        data = await response.json()
        cid = data.get("id")
        if cid is None:
            # Fallback: look up after create
            return await find_contact_by_email(session, email)
        return int(cid)


async def find_contact_by_email(
    session: aiohttp.ClientSession, email: str
) -> int | None:
    LOGGER.info("Finding contact by e-mail %s", email)
    async with session.get(f"contacts/email/{email}") as response:
        if response.status == 404:
            return None
        if response.status != 200:
            return None
        data = await response.json()
    if isinstance(data, list):
        if not data:
            return None
        data = data[0]
    cid = data.get("id") if isinstance(data, dict) else None
    return int(cid) if cid is not None else None


async def link_contact_to_dataresource(
    session: aiohttp.ClientSession, uid: str, contact_id: int
) -> None:
    LOGGER.info("linking contact %s to %s", contact_id, uid)
    async with session.post(
        f"dataResource/{uid}/contacts/{contact_id}"
    ) as response:
        if response.status not in (200, 201, 204):
            body = await response.text()
            LOGGER.warning(
                "Failed to link contact %s to %s: HTTP %s %s",
                contact_id,
                uid,
                response.status,
                body[:200],
            )


if __name__ == "__main__":
    asyncio.run(main())
