#!/usr/bin/env bash
set -e -o pipefail

# Required env vars
CROWDIN_TOKEN=${CROWDIN_TOKEN:?Missing required CROWDIN_TOKEN environment variable}

# Optional env vars
PROJECT_ID=${PROJECT_ID:-"54276"}
LANGUAGES=${LANGUAGES:-"es-ES fr"} # Also tested with es-ES and fr and it should work

# Download translations from Crowdin
docker run -i -v "$(pwd)":/project -w /project -u "$(id -u)" crowdin/cli:4.4.1 sh -c "
## List languages
# Uncomment to get a list of available languages
#crowdin language list --project-id=${PROJECT_ID} --token=${CROWDIN_TOKEN}

for lang in ${LANGUAGES}; do

  # alerts
  rm ./config/alerts/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" alerts/messages.properties -d ./config/alerts/i18n
  mv ./config/alerts/i18n/messages.properties ./config/alerts/i18n/messages_\${lang//-/_}.properties

  # bie-hub
  rm ./config/bie-hub/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" bie-hub/messages.properties -d ./config/bie-hub/i18n
  mv ./config/bie-hub/i18n/messages.properties ./config/bie-hub/i18n/messages_\${lang//-/_}.properties

  # bie-index
  rm ./config/bie-index/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" bie-index/messages.properties -d ./config/bie-index/i18n
  mv ./config/bie-index/i18n/messages.properties ./config/bie-index/i18n/messages_\${lang//-/_}.properties

  # biocache-hub
  rm ./config/biocache-hub/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" biocache-hub/messages_en.properties -d ./config/biocache-hub/i18n
  mv ./config/biocache-hub/i18n/messages_en.properties ./config/biocache-hub/i18n/messages_\${lang//-/_}.properties
  rm ./config/alerts/i18n/downloads-plugin/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" downloads-plugin/messages.properties -d ./config/biocache-hub/i18n/downloads-plugin
  mv ./config/biocache-hub/i18n/downloads-plugin/messages.properties ./config/biocache-hub/i18n/downloads-plugin/messages_\${lang//-/_}.properties

  # biocache-service
  rm ./config/biocache-service/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" biocache-service/messages.properties -d ./config/biocache-service/i18n
  mv ./config/biocache-service/i18n/messages.properties ./config/biocache-service/i18n/messages_\${lang//-/_}.properties

  # collectory
  rm ./config/collectory/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" collectory/messages.properties -d ./config/collectory/i18n
  mv ./config/collectory/i18n/messages.properties ./config/collectory/i18n/messages_\${lang//-/_}.properties

  # doi-service
  rm ./config/doi-service/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" doi-service/messages.properties -d ./config/doi-service/i18n
  mv ./config/doi-service/i18n/messages.properties ./config/doi-service/i18n/messages_\${lang//-/_}.properties

  # image-service
  rm ./config/image-service/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" image-service/messages.properties -d ./config/image-service/i18n
  mv ./config/image-service/i18n/messages.properties ./config/image-service/i18n/messages_\${lang//-/_}.properties

  # regions
  rm ./config/regions/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" regions/messages.properties -d ./config/regions/i18n
  mv ./config/regions/i18n/messages.properties ./config/regions/i18n/messages_\${lang//-/_}.properties

  # spatial-hub
  rm ./config/spatial-hub/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" spatial-hub/messages.properties -d ./config/spatial-hub/i18n
  mv ./config/spatial-hub/i18n/messages.properties ./config/spatial-hub/i18n/messages_\${lang//-/_}.properties

  # spatial-service
  rm ./config/spatial-service/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" spatial-service/messages.properties -d ./config/spatial-service/i18n
  mv ./config/spatial-service/i18n/messages.properties ./config/spatial-service/i18n/messages_\${lang//-/_}.properties

  # species-list
  rm ./config/species-list/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" specieslist-webapp/messages.properties -d ./config/species-list/i18n
  mv ./config/species-list/i18n/messages.properties ./config/species-list/i18n/messages_\${lang//-/_}.properties

  # userdetails
  rm ./config/userdetails/i18n/messages_*
  crowdin file download -l \${lang} --project-id=${PROJECT_ID} --token="${CROWDIN_TOKEN}" userdetails/messages.properties -d ./config/userdetails/i18n
  mv ./config/userdetails/i18n/messages.properties ./config/userdetails/i18n/messages_\${lang//-/_}.properties

done
"