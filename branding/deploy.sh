#!/bin/bash

# Stop on any failure
set -e

echo ">>>>> yarn install"
yarn install

echo ">>>>> Updating git submodules"
git submodule update --init --recursive

echo ">>>>> Building the branding with brunch for production"
brunch build --production

echo ">>>>> Creating remote directory if needed"

ssh vm-3 sudo mkdir -p /srv/branding.la-flanders.org/www/

echo ">>>>> Rsync the builded branding"

rsync -a --delete --rsync-path="sudo rsync" --info=progress2 public/ vm-3:/srv/branding.la-flanders.org/www/

# Renabling stop on error as maybe some of this urls are not up
set +e
echo ">>>>> Clearing the LA modules header/footer caches:"
for url in $(grep "url:" app/js/settings.js  | sed "s/.*url: '//g" | awk -F "'" '{print $1}' | egrep -Ev "^$|twitter|your-area|datasets")
do
    echo "--- Clearing $url/headerFooter/clearCache"
    curl -s --output /dev/null  $url/headerFooter/clearCache 2>&1 || true
done
