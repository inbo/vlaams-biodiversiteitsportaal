import argparse
import logging
from os.path import basename

import requests

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)
LOGGER = logging.getLogger(__name__)

SPATIAL_SERVICE_URL = "https://natuurdata.dev.inbo.be/spatial-service"
OAUTH2_TOKEN_URL = "https://auth-dev.inbo.be/realms/vbp/protocol/openid-connect/token"
OAUTH2_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJUQUtwbUlfMXB4aDBiY0dUOV84UGJkanBUdFlpZ1otRDU5anlXSHVaMFpVIn0.eyJleHAiOjE3NDkxOTgxNjgsImlhdCI6MTc0OTE5Nzg2OCwiYXV0aF90aW1lIjoxNzQ5MTk3ODY3LCJqdGkiOiIwNGEzNDA2NS04NmRkLTQ1ZGMtYmQxMS04YmYzZTk4MjQ2ZDEiLCJpc3MiOiJodHRwczovL2F1dGgtZGV2LmluYm8uYmUvcmVhbG1zL3ZicCIsInN1YiI6IjQyMWM5NTk4LTI2OWUtNDdiOC1hNTU4LTg5MGMxNTFiYmFkNSIsInR5cCI6IkJlYXJlciIsImF6cCI6InZicC1icmFuZGluZyIsInNpZCI6IjQ2YWIyZDZhLWVmOGUtNDVjMS05OTQ1LWM4ZGYyYjMxZDBlOSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9uYXR1dXJkYXRhLmRldi5pbmJvLmJlIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJFRElUT1IiLCJBRE1JTiIsIkRBVEFfSElHSFJFUyJdfSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiU3RlZmFuIFZhbiBEeWNrIiwicHJlZmVycmVkX3VzZXJuYW1lIjoic3RlZmFuIiwiZ2l2ZW5fbmFtZSI6IlN0ZWZhbiIsImZhbWlseV9uYW1lIjoiVmFuIER5Y2siLCJlbWFpbCI6InN0ZWZhbi52YW5keWNrQGluYm8uYmUifQ.o-AlAIHT5Upas_SAbeUvz68NpPmckRp6G46zoUhD3APDk-MGycc_JAMhSiFTFXbME1ifnDGKiDbE2ThpGfQPIUEY7fUn-zx9Ue11QNQNexiOXnx1L0ftCcnZE1YkZb2ZoenREPZhsdk-hJAEriC3OcIj2QIf8VGtphj0J7jpk-M8JkESmowM4GTNjd3RxFcxYfxNU7ZfLNdAwbarYMucViEa02Ad0J_OJhSBO0STWJzqWQEo5kSWyC6Ol9j1et2lZjtNZU7K0DDwnNKdOxZoipUVXG518M0ZAvH4lNNBjxYBUNbpOgAWgwxkjb16bFrLT1H7DS7OgEBvcaK7rhjQ_w"
OAUTH2_CLIENT_ID = "upload_layers"
OAUTH2_CLIENT_SECRET = "Gx30KuM73KoaeEcToy3c4JfdpKyBTacx"
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
                'Authorization': f'Bearer {get_access_token(OAUTH2_TOKEN_URL, OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, OAUTH2_TOKEN)}'
            },
            cookies={
                'JSESSIONID': '6ED0B4A8DD91E10132F6B5EF05FCD02A',
                'pac4jCsrfToken': '538373351c61427e932d67dbc7aec29e'
            },
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
