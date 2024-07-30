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
    LOGGER.info("Get %s", dr["uid"])
    data_resource_response = requests.get(f"{COLLECTORY_URL}/dataResource/show/{dr['uid']}", headers={
        "Authorization": TOKEN
    })
    data_resource = data_resource_response.text
    data_resource_id_match = re.search(r'<input type="hidden" name="id" value="(\d+)" id="id" />', data_resource)

    data_resource_instance_id = data_resource_id_match.group(1)
    LOGGER.info("Delete %s with instance id: %s", dr["uid"], data_resource_instance_id)
    data_resource_delete_response = requests.post(f"{COLLECTORY_URL}/dataResource/index", headers={
        "Authorization": TOKEN
    }, data={
        "id": data_resource_instance_id,
        "_action_delete": "Verwijderen"
    })
    # print(data_resource_delete_response.text)
    # assert data_resource_delete_response.status_code == 302
