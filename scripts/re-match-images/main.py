from collections.abc import AsyncGenerator
import gzip
import logging
import asyncpg
import os
import aiohttp

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
DB_NAME = os.getenv('DB_NAME', 'testdb')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

async def get_image_mappings() -> dict[str, str]:
    if not os.path.exists("mapping.csv"):
        async with aiohttp.ClientSession() as session:
            async with session.get("https://natuurdata.inbo.be/image-service/ws/exportDatasetMapping/dr12") as response:
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

async def read_multimedia_csv() -> AsyncGenerator[tuple[str,str], None]:
    with open("multimedia.txt", "r") as file:
        next(file)  # Skip header
        for line in file:
            value = line.strip().split("\t")
            yield value[0].strip("\""), value[3].strip("\"")

async def get_solr_occurrence_id(session: aiohttp.ClientSession, gbif_id: str) -> tuple[str, str]:
    response = await session.post("http://localhost:8983/solr/biocache/select", json={
        "query": f"dataResourceUid:dr12 AND dynamicProperties_gbifID:{gbif_id}",
        "fields": "id,occurrenceID",
        "limit": 2
    })

    if response.status != 200:
        raise Exception(f"Failed to get data from Solr: {response.status} - {response.text}")

    result = await response.json()
    if result["response"]["numFound"] == 0:
        raise Exception(f"No results found in Solr for gbif_id {gbif_id}")
    elif result["response"]["numFound"] > 1:
        raise Exception(f"Multiple results found in Solr for gbif_id {gbif_id}: {result['response']['numFound']}")

    return result["response"]["docs"][0]["id"], result["response"]["docs"][0]["occurrenceID"]
    

async def updat_solr_image_id(session: aiohttp.ClientSession, solr_id: str, image_id: str):
    response = await session.post("http://localhost:8983/solr/biocache/update", json=[{
        "id": solr_id, 
        "imageID": { "set": image_id },
        "imageIDs": { "add-distinct": image_id }
    }])

    if response.status != 200:
        raise Exception(f"Failed to get data from Solr: {response.status} - {await response.text()}")

    result = await response.text()
    return result

async def update_image_db_and_get_image_id(connection: asyncpg.Connection, image_url: str, occurrence_id: str) -> str:
    updated_record =  await connection.fetchrow("""
        UPDATE image
        SET occurrence_id = $1
        WHERE original_filename = $2
        RETURNING image_identifier
    """, occurrence_id, image_url)
    if not updated_record:
        raise Exception(f"No record found in the database for image URL {image_url}")

    return updated_record["image_identifier"] 

async def main():
    mappings = await get_image_mappings()
    http_session = aiohttp.ClientSession()
    connection = None
    
    try:
        connection =  await asyncpg.connect(user=DB_USER, password=DB_PASSWORD, database=DB_NAME, host=DB_HOST, port=DB_PORT)
        
        update_count = 0
        async for gbif_id, image_url in read_multimedia_csv():
            try:
                solr_id, occurrence_id = await get_solr_occurrence_id(http_session, gbif_id)
                image_id = await update_image_db_and_get_image_id(connection, image_url, occurrence_id)
                _ = await updat_solr_image_id(http_session, solr_id, image_id)
                update_count += 1
            except:
                logging.error(f"Failed to process record with gbif_id {gbif_id} and image_url {image_url}")

            if update_count % 100 == 0:
                logging.info(f"Updated {update_count} records of {len(mappings)}")

    finally:
        if connection:
             await connection.close()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
