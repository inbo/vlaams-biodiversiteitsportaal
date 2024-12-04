# Data Pipeline
To add data to the platform, it requires processing first.

##  Code
The actual logic for processing the data is maintained in the [gbif-pipelines project](https://github.com/gbif/pipelines/tree/dev/livingatlas)

## Adding a data resource
The raw data is added in the form of Darwin Core Archives (DwC-A).  
These are configured in [the _collectory_ service admin interface](https://collections.biodiversiteitsportaal.dev.svdev.be/admin).

Once a Data Source is added there, it will be picked up by the data ingestion pipeline.

### Important settings
Some Data Resource settings in the _collectory_ service the must be set correctly for the data to be properly processed.

#### Connection Parameters
- **Service URL**  
  This must be set to a valid public URL to download the archive.
  Alternatively the archive can be uploaded directly to the _collectory_ service.
- **Darwin core terms that uniquely identify a record**  
  This must be set to the name of the column used to uniquely identify a row in the archive.
  For almost all of our data this should be `occurrenceID`.

### Data Processing
The pipeline uses AWS step functions to manage the processing of the data.  
[It's definition is currently maintained in the terraform project](https://github.com/inbo/inbo-aws-biodiversiteitsportaal-terraform/blob/master/region/common-region/la-pipelines-deployment/step-function/pipeline.json).

You can launch a new round of processing by starting a new execution of the step function.
[This can be done from the AWS console](https://eu-west-1.console.aws.amazon.com/states/home?region=eu-west-1#/statemachines/view/arn%3Aaws%3Astates%3Aeu-west-1%3A632683202044%3AstateMachine%3Abiodiversiteitsportaal-dev-pipeline?type=standard), or by using the AWS CLI:
```commandline
aws stepfunctions start-execution \
    --state-machine-arn 'arn:aws:states:eu-west-1:632683202044:stateMachine:biodiversiteitsportaal-dev-pipeline' \
    --input '{"SolrCollection" : "pipeline-20241203"}'
```

Be aware that running the pipeline multiple times on the same solr collection will result in duplicate data.
Better to create a new collection for each run, through [the SOLR management interface](https://index.natuurdata.dev.inbo.be).

#### Inputs
The step function can be executed from the AWS console.
It requires the following inputs, passed as json keys:
- **SolrCollection**  
  The name of the Solr collection to ultimately upload the data to.
  This collection must be manually created in the Solr service.
  No effort is made to clean up any previous data.
- **DataResources**  _(Optional)_  
  A list of the Data Resource IDs to process.  
  If not provided, all Data Resources, registered in the collectory service, will be processed.
  Providing an empty list will result in the "interpretation" step for all dataresource being skipped.
  
Example:
```json
{
  "SolrCollection": "pipeline-20241010",
  "DataResources": [
    "dr627",
    "dr550"
  ]
}
```
#### Small vs Large Data Resources
A distinction is made between small and large data resources.
This is done to avoid the overhead and additional costs of using AWS EMR when it is not necessary.

The choice is made based on the size of the downloaded Darwin Core Archive.  
The threshold is currently set at 10MB.

#### Monitoring
The progress of the pipeline can be monitored in the AWS console.  
Additionally, the logs of the EMR steps for large data resources and the batch processing for smaller ones can be consulted using [grafana dashboards](https://monitoring.natuurdata.dev.inbo.be/d/edvde1ewzfitcd/emr-logs).

### Data
The data, used to process the DwC-A, is stored on a single AWS EFS volume.  
This volume is mounted on both the EMR instances and the AWS Batch jobs.  
This is necessary as some steps seem to require all the data to be present for correct processing.
Intermediary data is therefor synced from the EMR cluster hdfs, back to the EFS volume when needed.

This should also make it so some steps can be skipped when the data has already been processed.
In order to determine if a Data Resource was already processed, the pipeline uses a DynamoDB table to keep track of the last succesful processing time, together with a hash of the downloaded archive of each Data Resource.
