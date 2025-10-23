#!/usr/bin/env bash

# This (very basic) script generates environment-specific Grafana provisioning files
# by templating existing "dev" files for "prod" environments. (uat is currently not running, so simlpy removed it)

function template() {
  file="$1"
  env="$2"
  newFile="${file//dev/"$env"}"
  newFile="${newFile//DEV/"${env^^}"}"
  echo "Generating $newFile from $file"

  mkdir -p "$(dirname "$newFile")"
  sed -e "s/-dev/-${env}/g" "$file" > "$newFile"
  sed -i -e "s/DEV/${env^^}/g" "$newFile"
}

# Loop over all files in provisioning directory and its subdirectories
while IFS= LC_ALL=C read -r -d '' -u 9 file
do
  # If the filepath contains "dev" (case insensitive), template it for other environments
  if [[ "${file,,}" == *"dev"* ]]; then
    for env in "uat" "prod"; do
      template "$file" "$env"
    done
  fi
done 9< <( find ./provisioning -type f -exec printf '%s\0' {} + )