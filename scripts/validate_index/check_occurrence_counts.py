#!/usr/bin/env python
import botocore
import requests
import boto3
import yaml

s3 = boto3.client('s3')

def main():
    data_resources = get_collectory_data_resources()
    solr_counts = get_solr_counts()

    mismatches = []

    for data_resource in data_resources:
        data_resource_id = data_resource["uid"]
        #print(f"Checking [{data_resource_id}] {data_resource["name"]}")
        s3_count = get_s3_counts(data_resource_id)
        solr_count = 0
        if data_resource_id in solr_counts:
           solr_count = solr_counts[data_resource_id]

        if solr_count != s3_count:
            print(f"MISMATCH! {data_resource_id} - {data_resource['name']}") 
            print(f"{solr_count} - {s3_count}") 
            mismatches.append(data_resource_id)

    print(f"Total number of mismatches: {len(mismatches)}")
    print(", ".join(mismatches))

def get_collectory_data_resources():
    url = 'https://natuurdata.inbo.be/collectory/ws/dataResource'
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception(f"Collectory call failed [{response.status_code}]: {response.text}")
    
    data_resources = response.json()
    return data_resources

def get_solr_counts():
    url = 'http://localhost:8983/solr/biocache/select?facet.field=dataResourceUid&facet=true&indent=true&q.op=OR&q=*%3A*&rows=0'
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception(f"Solr call failed [{response.status_code}]: {response.text}")
    
    data_resources = response.json()["facet_counts"]["facet_fields"]["dataResourceUid"]
    return {data_resources[i]: data_resources[i+1] for i in range(0, len(data_resources), 2)}

def get_s3_counts(data_resource_id: str):
    try:
        response = s3.get_object(
            Bucket="inbo-vbp-prod-pipelines",
            Key=f"data/pipelines-data/{data_resource_id}/0/interpretation-metrics.yml",
        )
        if response["ResponseMetadata"]["HTTPStatusCode"] != 200:
            raise Exception(f"S3 Get failed {response}")

        metrics = yaml.safe_load(response["Body"].read())
        if "basicRecordsCountAttempted" in metrics:
            return metrics["basicRecordsCountAttempted"]
        else:
            return 0
    except Exception:
        return 0

if __name__ == "__main__":
    main()
