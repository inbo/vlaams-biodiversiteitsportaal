#!/usr/bin/env bash
set -e -o pipefail

# Required env vars
CROWDIN_TOKEN=${CROWDIN_TOKEN:?Missing required CROWDIN_TOKEN environment variable}

# Optional env vars
PROJECT_ID=${PROJECT_ID:-"54276"}
LANGUAGES=${LANGUAGES:-"nl"} # Also tested with es-ES and fr and it should work
CROWDIN_CLI_VERSION=${CROWDIN_CLI_VERSION:-"4.4.1"}


## List languages
# Uncomment to get a list of available languages
#crowdin language list --project-id=${PROJECT_ID} --token=${CROWDIN_TOKEN}

# Cleanup previous crowdin translations
for folder in ./config/*/i18n/crowdin; do
  echo "Cleaning ${folder}"
  rm -rf ${folder}
  mkdir -p ${folder}
done
rm -rf ./config/biocache-hub/i18n/downloads-plugin/crowdin
mkdir -p ./config/biocache-hub/i18n/downloads-plugin/crowdin

# Download latest crowdin translations
for lang in ${LANGUAGES}; do

  # alerts
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" alerts/messages.properties -d ./config/alerts/i18n/crowdin
  mv ./config/alerts/i18n/crowdin/messages.properties ./config/alerts/i18n/crowdin/messages_${lang//-/_}.properties

  # bie-hub
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" bie-hub/messages.properties -d ./config/bie-hub/i18n/crowdin
  mv ./config/bie-hub/i18n/crowdin/messages.properties ./config/bie-hub/i18n/crowdin/messages_${lang//-/_}.properties

  # bie-index
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" bie-index/messages.properties -d ./config/bie-index/i18n/crowdin
  mv ./config/bie-index/i18n/crowdin/messages.properties ./config/bie-index/i18n/crowdin/messages_${lang//-/_}.properties

  # biocache-hub
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" biocache-hub/messages_en.properties -d ./config/biocache-hub/i18n/crowdin
  mv ./config/biocache-hub/i18n/crowdin/messages_en.properties ./config/biocache-hub/i18n/crowdin/messages_${lang//-/_}.properties
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" downloads-plugin/messages.properties -d ./config/biocache-hub/i18n/crowdin/downloads-plugin
  mv ./config/biocache-hub/i18n/crowdin/downloads-plugin/messages.properties ./config/biocache-hub/i18n/downloads-plugin/crowdin/messages_${lang//-/_}.properties

  # biocache-service
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" biocache-service/messages.properties -d ./config/biocache-service/i18n/crowdin
  mv ./config/biocache-service/i18n/crowdin/messages.properties ./config/biocache-service/i18n/crowdin/messages_${lang//-/_}.properties

  # collectory
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" collectory/messages.properties -d ./config/collectory/i18n/crowdin
  mv ./config/collectory/i18n/crowdin/messages.properties ./config/collectory/i18n/crowdin/messages_${lang//-/_}.properties

  # doi-service
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" doi-service/messages.properties -d ./config/doi-service/i18n/crowdin
  mv ./config/doi-service/i18n/crowdin/messages.properties ./config/doi-service/i18n/crowdin/messages_${lang//-/_}.properties

  # image-service
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" image-service/messages.properties -d ./config/image-service/i18n/crowdin
  mv ./config/image-service/i18n/crowdin/messages.properties ./config/image-service/i18n/crowdin/messages_${lang//-/_}.properties

  # regions
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" regions/messages.properties -d ./config/regions/i18n/crowdin
  mv ./config/regions/i18n/crowdin/messages.properties ./config/regions/i18n/crowdin/messages_${lang//-/_}.properties

  # spatial-hub
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" spatial-hub/messages.properties -d ./config/spatial-hub/i18n/crowdin
  mv ./config/spatial-hub/i18n/crowdin/messages.properties ./config/spatial-hub/i18n/crowdin/messages_${lang//-/_}.properties

  # spatial-service
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" spatial-service/messages.properties -d ./config/spatial-service/i18n/crowdin
  mv ./config/spatial-service/i18n/crowdin/messages.properties ./config/spatial-service/i18n/crowdin/messages_${lang//-/_}.properties

  # species-list
  crowdin file download -l ${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" specieslist-webapp/messages.properties -d ./config/species-list/i18n/crowdin
  mv ./config/species-list/i18n/crowdin/messages.properties ./config/species-list/i18n/crowdin/messages_${lang//-/_}.properties

done
