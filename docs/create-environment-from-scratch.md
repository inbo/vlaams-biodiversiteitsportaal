# Setting up a new environment

Manual steps required:
- TF apply
- Create solr collections and aliases:
  - required aliases: biocache, bie, bie-offline
- Add taxonomy:
  - Download the GBIF taxon to the bie-index container and extract to `/data/bie/imports`
  - Go to the bie-index admin page and start processing (process-all can take multiple days)
  - Switch bie and bie-offline alias
- Spatial layers:
  - Start init-geoserver task on spatial-service
  - upload layers
- Occurence data:
  - Add dataresources using collectory admin
- Start pipeline using AWS step-function