import argparse
import logging
import os
from os.path import basename

import requests

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)
LOGGER = logging.getLogger(__name__)

SPATIAL_SERVICE_URL = "https://natuurdata.inbo.be/spatial-service"
OAUTH2_TOKEN = os.getenv("OAUTH2_TOKEN")
access_token_cache = None


def upload_layer(filename: str, is_bioclim: bool = False):
    # Placeholder for the upload logic
    LOGGER.info(f"Uploading {filename} to {SPATIAL_SERVICE_URL}")

    upload_filename = basename(filename)
    # if is_bioclim:
    #     match = re.match(r"^(.*)_bio_([0-9]+)\.zip$", upload_filename)
    #     if match is None:
    #         raise ValueError(f"Invalid filename for bioclim layer: {upload_filename}")
    #
    #     upload_filename = f"{match.group(1)}_bio_{match.group(1)}.zip"
    #
    #     upload_filename = upload_filename.re

    with open(filename, 'rb') as file:
        response = requests.post(
            f"{SPATIAL_SERVICE_URL}/manageLayers/upload",
            headers={
                'Authorization': f'Bearer {OAUTH2_TOKEN}'
            },
            # cookies={
            #     'JSESSIONID': 'xxx',
            #     'pac4jCsrfToken': 'xxx'
            # },
            files={'file': (upload_filename, file.read())},
        )
        # Check if the response is successful, with url to verify no redirect to authentication page
        if response.status_code == 200 and response.url.startswith(SPATIAL_SERVICE_URL):
            LOGGER.info("Successfully uploaded %s", upload_filename)
        else:
            LOGGER.error("Failed to upload layer %s: [%s] %s", upload_filename, response.status_code, response.url)
            exit(-1)


def get_access_token(url, client_id, client_secret, token):
    global access_token_cache
    if token is not None:
        return token

    if access_token_cache is not None:
        return access_token_cache

    response = requests.post(
        url,
        data={"grant_type": "client_credentials"},
        auth=(client_id, client_secret),
    )
    access_token_cache = response.json()["access_token"]
    LOGGER.warning("Access token obtained: %s", access_token_cache)
    return access_token_cache


if __name__ == "__main__":
    parser = argparse.ArgumentParser(prog='Upload GIS layers')
    parser.add_argument('filenames', nargs='*', help='Input files')
    args = parser.parse_args()

    for input_file in args.filenames:
        LOGGER.info(f"Uploading {input_file}")
        upload_layer(input_file)
