"""Phase 1: extract dataset contacts from collectory DwC-A archives into a CSV.

For every data resource exposed by the collectory the EML metadata of the
DwC-A archive is downloaded and inspected. Every ``<contact>`` party found in
the EML is written to a CSV row together with the data resource it should be
attached to. No contacts are created and no links are made; that is the job
of ``apply_contacts.py``.
"""

import asyncio
import csv
import io
import logging
import os
import re
import xml.etree.ElementTree as ET
import zipfile

import aiohttp

from keycloak import get_oidc_token

logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger(__name__)

BASE_URL = os.getenv("COLLECTORY_BASE_URL", "https://natuurdata.inbo.be/collectory/ws/")
if not BASE_URL.endswith("/"):
    BASE_URL += "/"

GBIF_API_BASE = "https://api.gbif.org/v1"

CSV_PATH = os.getenv("CONTACTS_CSV", "contacts.csv")

# EML uses several namespaces but the elements we care about are unprefixed
# inside the default namespace of the <dataset> children. We parse without
# namespace awareness by stripping namespaces on read.
EML_FILENAME_CANDIDATES = ("eml.xml", "metadata.xml")

CSV_FIELDS = [
    "dataResourceUid",
    "firstName",
    "lastName",
    "email",
    "phone",
    "organisation",
    "userIds",
]


async def main() -> None:
    LOGGER.info("Starting extraction against %s", BASE_URL)
    oidc_token = await get_oidc_token()

    auth_headers = {
        "Authorization": f"Bearer {oidc_token}",
        "Accept": "application/json",
    }

    rows: list[dict] = []

    async with (
        aiohttp.ClientSession(base_url=BASE_URL, headers=auth_headers) as session,
        aiohttp.ClientSession(headers=auth_headers) as download_session,
        aiohttp.ClientSession() as gbif_session,
    ):
        dataresources = await get_data_resources(session)
        LOGGER.info("Found %d data resources", len(dataresources))

        for dr in dataresources:
            uid = dr["uid"]
            try:
                rows.extend(
                    await extract_for_data_resource(
                        session, download_session, gbif_session, uid
                    )
                )
            except Exception:
                LOGGER.exception("Failed to extract contacts for %s", uid)

    LOGGER.info("Writing %d rows to %s", len(rows), CSV_PATH)
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


async def get_data_resources(session: aiohttp.ClientSession) -> list[dict]:
    async with session.get("dataResource") as response:
        response.raise_for_status()
        return await response.json()


async def get_data_resource_detail(session: aiohttp.ClientSession, uid: str) -> dict:
    async with session.get(f"dataResource/{uid}") as response:
        response.raise_for_status()
        return await response.json()


def _extract_gbif_dataset_key(url: str) -> str | None:
    """Try to extract a GBIF dataset UUID from various GBIF URL patterns."""
    uuid_pat = r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
    for pattern in [
        rf"hosted-datasets\.gbif\.org/({uuid_pat})",
        rf"api\.gbif\.org/v1/dataset/({uuid_pat})",
        rf"gbif\.org/dataset/({uuid_pat})",
    ]:
        m = re.search(pattern, url, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def _get_gbif_dataset_key(detail: dict) -> str | None:
    return detail.get("gbifRegistryKey")


async def get_contacts_from_gbif(
    gbif_session: aiohttp.ClientSession, dataset_key: str
) -> list[dict]:
    """Fetch contacts for a GBIF dataset via the GBIF public API."""
    url = f"{GBIF_API_BASE}/dataset/{dataset_key}/contact"
    LOGGER.info("Fetching GBIF contacts from %s", url)
    async with gbif_session.get(url) as response:
        if response.status != 200:
            LOGGER.warning(
                "GBIF API returned HTTP %s for dataset %s", response.status, dataset_key
            )
            return []
        data = await response.json()

    contacts: list[dict] = []
    for item in data:
        first_name = item.get("firstName") or ""
        last_name = item.get("lastName") or ""
        emails: list[str] = item.get("email") or []
        phones: list[str] = item.get("phone") or []
        organisation = item.get("organization") or ""
        user_ids: list[str] = item.get("userId") or []

        if not (first_name or last_name or emails or organisation):
            continue

        contacts.append(
            {
                "firstName": first_name,
                "lastName": last_name,
                "email": emails[0] if emails else "",
                "phone": phones[0] if phones else "",
                "organisation": organisation,
                "userIds": user_ids,
            }
        )

    return contacts


def _archive_url_from_detail(detail: dict) -> str | None:
    cp = detail.get("connectionParameters") or {}
    if isinstance(cp, dict):
        url = cp.get("url")
        if url:
            return re.sub(
                r"https://natuurdata.*\.be\/collectory",
                r"http://localhost:8080/collectory/ws",
                url,
            )

    return None


async def extract_for_data_resource(
    session: aiohttp.ClientSession,
    download_session: aiohttp.ClientSession,
    gbif_session: aiohttp.ClientSession,
    uid: str,
) -> list[dict]:
    LOGGER.info("Processing %s", uid)
    detail = await get_data_resource_detail(session, uid)

    # ------------------------------------------------------------------
    # If the archive originates from GBIF, use the GBIF contacts API
    # directly instead of downloading and unpacking the zip.
    # ------------------------------------------------------------------
    if detail.get("gbifDataset"):
        gbif_key = _get_gbif_dataset_key(detail)
        if gbif_key:
            LOGGER.info(
                "%s: GBIF dataset detected (key=%s), using GBIF API", uid, gbif_key
            )
            contacts = await get_contacts_from_gbif(gbif_session, gbif_key)
            LOGGER.info("%s: extracted %d contacts from GBIF API", uid, len(contacts))
        else:
            LOGGER.warning("Could not extract contacts fro GBIF")
            return []
    else:
        archive_url = _archive_url_from_detail(detail)
        if not archive_url:
            LOGGER.warning("%s: no archive url", uid)
            return []

        archive_bytes = await download_archive(download_session, archive_url)
        if archive_bytes is None:
            LOGGER.warning("%s: could not download any archive (%s)", uid, archive_url)
            return []

        contacts = extract_contacts_from_archive(archive_bytes)
        LOGGER.info("%s: extracted %d contacts from DwCA", uid, len(contacts))

    rows: list[dict] = []
    for contact in contacts:
        if not contact.get("email"):
            LOGGER.info(
                "%s: skipping contact without email: %s",
                uid,
                contact.get("firstName") or contact.get("lastName"),
            )
            continue
        rows.append(
            {
                "dataResourceUid": uid,
                "firstName": contact.get("firstName") or "",
                "lastName": contact.get("lastName") or "",
                "email": contact.get("email") or "",
                "phone": contact.get("phone") or "",
                "organisation": contact.get("organisation") or "",
                "userIds": ";".join(contact.get("userIds") or []),
            }
        )
    return rows


async def download_archive(session: aiohttp.ClientSession, url: str) -> bytes | None:
    # The session is bound to BASE_URL; use absolute URL via a separate request.
    try:
        LOGGER.info("Downloading %s", url)
        async with session.get(url) as response:
            if response.status != 200:
                LOGGER.warning(
                    "Failed to download archive %s: HTTP %s",
                    url,
                    response.status,
                )
                return None
            return await response.read()
    except aiohttp.ClientError as e:
        LOGGER.warning("Error downloading %s: %s", url, e)
        return None


def extract_contacts_from_archive(archive_bytes: bytes) -> list[dict]:
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as zf:
        eml_name = None
        for candidate in EML_FILENAME_CANDIDATES:
            if candidate in zf.namelist():
                eml_name = candidate
                break
        if eml_name is None:
            # fallback: find any *.xml that looks like eml
            for name in zf.namelist():
                if name.lower().endswith("eml.xml"):
                    eml_name = name
                    break
        if eml_name is None:
            LOGGER.warning("No eml.xml found in archive")
            return []
        with zf.open(eml_name) as f:
            eml_bytes = f.read()

    return parse_contacts_from_eml(eml_bytes)


def _strip_ns(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def parse_contacts_from_eml(eml_bytes: bytes) -> list[dict]:
    try:
        root = ET.fromstring(eml_bytes)
    except ET.ParseError as e:
        LOGGER.warning("Failed to parse eml.xml: %s", e)
        return []

    contacts: list[dict] = []
    # Iterate all <contact> elements regardless of namespace
    for element in root.iter():
        if _strip_ns(element.tag) != "contact":
            continue
        contact = _eml_party_to_contact(element)
        if contact:
            contacts.append(contact)
    return contacts


def _eml_party_to_contact(party: ET.Element) -> dict | None:
    first_name = None
    last_name = None
    email = None
    phone = None
    organisation = None
    user_ids: list[str] = []

    for child in party.iter():
        tag = _strip_ns(child.tag)
        if tag == "givenName" and child.text:
            first_name = child.text.strip()
        elif tag == "surName" and child.text:
            last_name = child.text.strip()
        elif tag == "electronicMailAddress" and child.text:
            email = child.text.strip()
        elif tag == "phone" and child.text:
            phone = child.text.strip()
        elif tag == "organizationName" and child.text and not organisation:
            organisation = child.text.strip()
        elif tag == "userId" and child.text:
            directory = child.attrib.get("directory", "").rstrip("/")
            identifier = child.text.strip()
            if directory:
                user_ids.append(f"{directory}/{identifier}")
            else:
                user_ids.append(identifier)

    if not (first_name or last_name or email or organisation):
        return None

    return {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "phone": phone,
        "organisation": organisation,
        "userIds": user_ids,
    }


if __name__ == "__main__":
    asyncio.run(main())
