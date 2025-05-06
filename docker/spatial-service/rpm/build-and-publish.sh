#!/usr/bin/env bash

set -e -o pipefail -x

PROJ_VERSION=6.1.1
GDAL_VERSION=3.2.1

RPM_ARCH=x86_64
DOCKER_ARCH=amd64

#RPM_ARCH=aarch64
#DOCKER_ARCH=arm64

docker buildx build -t "rpm-builder:${RPM_ARCH}" --load .
docker run --rm \
  -v $(pwd)/specs:/root/rpmbuild/SPECS \
  -v $(pwd)/output:/root/rpmbuild/RPMS \
  "rpm-builder:${RPM_ARCH}" "
set -e -o pipefail -x

curl -fL https://download.osgeo.org/proj/proj-${PROJ_VERSION}.tar.gz -o /root/rpmbuild/SOURCES/proj.tar.gz -z /root/rpmbuild/SOURCES/proj.tar.gz
rpmbuild -bb /root/rpmbuild/SPECS/proj.spec --define \"Version ${PROJ_VERSION}\" --target ${RPM_ARCH}
yum localinstall -y /root/rpmbuild/RPMS/${RPM_ARCH}/proj-6.1.1-1.amzn2.${RPM_ARCH}.rpm

curl -fL https://github.com/OSGeo/gdal/releases/download/v${GDAL_VERSION}/gdal-${GDAL_VERSION}.tar.gz -o /root/rpmbuild/SOURCES/gdal.tar.gz -z /root/rpmbuild/SOURCES/gdal.tar.gz
rpmbuild -bb /root/rpmbuild/SPECS/gdal.spec --define \"Version ${GDAL_VERSION}\" --target ${RPM_ARCH}
"

for filename in output/"${RPM_ARCH}"/*.rpm;
do
  BASE_NAME=$(basename "${filename}")
  S3_KEY=${BASE_NAME//${RPM_ARCH}/${DOCKER_ARCH}}
  aws s3 cp "${filename}" "s3://inbo-vbp-global-public-artifacts/spatial-service/gdal/${S3_KEY}"
  aws s3api put-object-tagging --bucket inbo-vbp-global-public-artifacts --key "spatial-service/gdal/${S3_KEY}" --tagging 'TagSet=[{Key=public,Value=yes}]'
done
