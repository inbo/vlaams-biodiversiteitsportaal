import re
import tempfile

import requests
import logging

logging.basicConfig(level=logging.INFO)

LOGGER = logging.getLogger(__name__)

COLLECTORY_URL = "https://collections.biodiversiteitsportaal.dev.svdev.be"
TOKEN = "02b8538a-4910-45a0-99de-1fc5175dd015"

data_resources_response = requests.get(f"{COLLECTORY_URL}/ws/dataResource.json", headers={
    "Authorization": TOKEN
})

for dr in data_resources_response.json():
    data_resource_response = requests.get(dr["uri"], headers={
        "Authorization": TOKEN
    })
    data_resource = data_resource_response.json()

    requests.post(dr["uri"], json={
        **data_resource,

    })
    #
    # # if "connectionParameters" in data_resource and data_resource["connectionParameters"] is not None:
    # #     LOGGER.info("Archive already uploaded %s: %s, skipping", data_resource["uid"], data_resource["name"])
    # #     continue
    #
    # if data_resource["websiteUrl"] is None:
    #     LOGGER.warning("No Website url for %s: %s, skipping", data_resource["uid"], data_resource["name"])
    #     continue
    #
    # ipt_resource_name = data_resource["websiteUrl"].replace("https://ipt.inbo.be/resource?r=", "")
    #
    # ipt_page_response = requests.get(data_resource["websiteUrl"])
    # ipt_page = ipt_page_response.text
    #
    # match = re.search(r"(https://ipt\.inbo\.be/archive\.do\?r=[^\"]+)", ipt_page)
    # if match is None:
    #     LOGGER.warning("No Website url for %s: %s, skipping", data_resource["uid"], data_resource["name"])
    #     continue
    #
    # ipt_download_url = match.group(0)
    #
    # LOGGER.info("Downloading %s: %s from ipt: %s", data_resource["uid"], data_resource["name"], ipt_resource_name)
    #
    # with tempfile.TemporaryFile() as temp:
    #     with requests.get(ipt_download_url, stream=True) as download:
    #         download.raise_for_status()
    #         for chunk in download.iter_content(chunk_size=8192):
    #             temp.write(chunk)
    #
    #         temp.seek(0)
    #
    #     upload_response = requests.post(f"{COLLECTORY_URL}/dataResource/uploadDataFile", data={
    #         "id": data_resource["uid"],
    #         "protocol": "DwCA",
    #         "automation": False,
    #         "strip": False,
    #         "incremental": False,
    #         "termsForUniqueKey": "occurrenceID"
    #     }, files={"myFile": temp.read()})
    #
    #     if upload_response.status_code != 200:
    #         LOGGER.error("Failed uploading %s: %s | [%s]: %s",
    #                      data_resource["uid"], data_resource["name"],
    #                      upload_response.status_code, upload_response.text)
