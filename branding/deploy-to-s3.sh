#!/usr/bin/env bash

npm run build:prod
aws s3 sync --delete public s3://biodiversiteitsportaal-dev-branding/
