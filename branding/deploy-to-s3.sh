#!/usr/bin/env bash

npx brunch build --production
aws s3 sync --profile inbo-dev --delete public s3://biodiversiteitsportaal-dev-branding/
