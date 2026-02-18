from collections.abc import AsyncGenerator
import enum
import gzip
import logging
from typing import NamedTuple
import asyncpg
import os
import aiohttp

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'testdb')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

DATA_RESOURCE_UID = "dr10"

BATCH_SIZE = 20

class ArtifactType(enum.Enum):
    IMAGE = "IMAGE"
    SOUND = "SOUND"
    VIDEO = "VIDEO"
    OTHER = "OTHER"


CsvEntry = NamedTuple("CsvEntry", [("gbif_id", str), ("image_url", str)])
SolrEntry = NamedTuple("SolrEntry", [("solr_id", str), ("occurrence_id", str)])
DbEntry = NamedTuple("DbEntry", [("image_identifier", str), ("occurrence_id", str), ("type", ArtifactType)])
SolrUpdateEntry = NamedTuple("SolrUpdateEntry", [("solr_id", str), ("images", list[tuple[str, ArtifactType]])])

async def get_image_mappings() -> dict[str, str]:
    if not os.path.exists("mapping.csv"):
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://natuurdata.inbo.be/image-service/ws/exportDatasetMapping/{DATA_RESOURCE_UID}") as response:
                if response.status != 200:
                    raise Exception(f"Failed to get mappings from image-service: {response.status} - {response.text}")

                with open("mapping.csv", "wb") as file:
                    compressed_data = await response.read()
                    decompressed_data = gzip.decompress(compressed_data)
                    file.write(decompressed_data)

    if not os.path.exists("mapping.sorted.csv"):
        mappings = []
        with open("mapping.csv", "r") as file:
            for line in file:
                mappings.append(line.strip().split(","))

            sorted_mappings = sorted(mappings, key=lambda x: x[1])  # Sort by the first column (data_resource_uid)
            with open("mapping_sorted.csv", "w") as file:
                for mapping in sorted_mappings:
                    file.write(",".join(mapping) + "\n")

    result: dict[str, str] = dict()
    with open("mapping_sorted.csv", "r") as file:
        for line in file:
            value = line.strip().split(",")
            result[value[1].strip("\"")] = value[0].strip("\"")
    return result

async def read_multimedia_csv() -> AsyncGenerator[list[CsvEntry], None]:
    with open("multimedia.txt", "r") as file:
        next(file)  # Skip header
        batch = []
        for line in file:
            value= line.strip().split("\t")
            batch.append((value[0].strip("\""), value[3].strip("\"")))
            if len(batch) >= BATCH_SIZE:
                yield batch
                batch = []

async def get_solr_occurrence_id(session: aiohttp.ClientSession, gbif_ids: list[str]) -> dict[str, SolrEntry]:
    response = await session.post("http://localhost:8983/solr/biocache/select", json={
        "query": f"dataResourceUid:{DATA_RESOURCE_UID} AND dynamicProperties_gbifID:({" ".join(gbif_ids)})",
        "fields": "id,occurrenceID,dynamicProperties_gbifID",
        "limit": BATCH_SIZE
    })

    if response.status != 200:
        raise Exception(f"Failed to get data from Solr: {response.status} - {response.text}")

    result = await response.json()
    # if result["response"]["numFound"] != BATCH_SIZE:
    #     logging.warning(f"Non matching number of records found in Solr for GBIF IDs {gbif_ids}: {result['response']['numFound']} found")

    result = { doc["dynamicProperties_gbifID"]: SolrEntry(doc["id"], doc["occurrenceID"]) for doc in result["response"]["docs"] }


    return   result  

async def updat_solr_image_id(session: aiohttp.ClientSession, ids: list[SolrUpdateEntry]) -> str:
    updates = []
    for id in ids:

        doc_update: dict[str,str | dict[str,str] | dict[str, list[str]]] = {
            "id": id.solr_id, 
        }

        multimedia_types = set()
        for image_id, artifact_type in id.images:
            if artifact_type == ArtifactType.IMAGE:
                multimedia_types.add("Image")
                has_images = True
                doc_update["imageID"] = {"set": image_id}
                if "imageIDs" not in doc_update:
                    doc_update["imageIDs"] = {"add-distinct": [image_id]}
                else:
                    doc_update["imageIDs"]["add-distinct"] +=  [image_id]
            elif artifact_type == ArtifactType.SOUND:
                multimedia_types.add("Sound")
                if "soundIDs" not in doc_update:
                    doc_update["soundIDs"] = {"add-distinct": [image_id]}
                else:
                    doc_update["soundIDs"]["add-distinct"] +=  [image_id]
            elif artifact_type == ArtifactType.VIDEO:
                multimedia_types.add("Video")
                if "videoIDs" not in doc_update:
                    doc_update["videoIDs"] = {"add-distinct": [image_id]}
                else:
                    doc_update["videoIDs"]["add-distinct"] +=  [image_id]
            else:
                logging.warning(f"Unknown artifact type {artifact_type} for image ID {image_id}")

        if len(multimedia_types) > 0:
            doc_update["multimedia"] = {"add-distinct": list(multimedia_types)}


        updates.append(doc_update)
    

    response = await session.post("http://localhost:8983/solr/biocache/update", json=updates)

    if response.status != 200:
        raise Exception(f"Failed to get data from Solr: {response.status} - {await response.text()}")

    result = await response.text()
    return result

def map_type(mime_type: str) -> ArtifactType:
    if mime_type.startswith("image/"):
        return ArtifactType.IMAGE
    elif mime_type.startswith("audio/"):
        return ArtifactType.SOUND
    elif mime_type.startswith("video/"):
        return ArtifactType.VIDEO
    else:
        return ArtifactType.OTHER

async def update_image_db_and_get_image_id(connection: asyncpg.Connection, ids: list[tuple[str,str,str]]) -> dict[str, list[DbEntry]]:
    updated_records =  await connection.fetchmany("""
        UPDATE image
        SET occurrence_id = $2
        WHERE original_filename = $3
        RETURNING $1 as gbif_id, image_identifier, occurrence_id, mime_type
    """, ids)

    result = dict()
    for id in ids:
        gbif_id, _, _ = id
        images = [record for record in updated_records if record["gbif_id"] == gbif_id] 
        if len(images) == 0:
            logging.warning(f"No DB record found for {gbif_id}, {id[2]}")
        else:
            result[gbif_id] = [DbEntry(record["image_identifier"], record["occurrence_id"], map_type(record["mime_type"])) for record in images]
        
    return result 

async def main():
    mappings = await get_image_mappings()
    http_session = aiohttp.ClientSession()
    connection = None
    
    try:
        connection =  await asyncpg.connect(user=DB_USER, password=DB_PASSWORD, database=DB_NAME, host=DB_HOST, port=DB_PORT)
        
        update_count = 0
        async for batch in read_multimedia_csv():
            solr_ids = await get_solr_occurrence_id(http_session, [gbif_id for gbif_id, _ in batch])
            image_ids = await update_image_db_and_get_image_id(connection, [(gbif_id, solr_ids[gbif_id].occurrence_id, image_url) for gbif_id, image_url in batch if  gbif_id in solr_ids])

            for gbif_id, image_url in batch:
                if gbif_id not in solr_ids:
                    logging.warning(f"Could not find Solr record for {gbif_id}, {image_url}")
                if gbif_id not in image_ids:
                    logging.warning(f"Could not find DB record for {gbif_id}, {image_url}")


            _ = await updat_solr_image_id(http_session, [SolrUpdateEntry(solr_ids[gbif_id].solr_id, [(image.image_identifier, image.type) for image in image_ids[gbif_id]]) for gbif_id in solr_ids if gbif_id in image_ids and gbif_id in solr_ids])

            update_count += len(batch) 

            if update_count % 2000 == 0:
                logging.info(f"Updated {update_count} records of {len(mappings)}")

    finally:
        if http_session:
            await http_session.close()
        if connection:
             await connection.close()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
