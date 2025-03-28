#!/usr/bin/env sh
# Link to external jar libraries
mkdir -p /data/spatial-data/modelling/aloc
ln -sf /opt/vbp/spatial-service/libs/aloc.jar /data/spatial-data/modelling/aloc/aloc.jar
mkdir -p /data/spatial-data/modelling/maxent/
ln -sf /opt/vbp/spatial-service/libs/maxent.jar /data/spatial-data/modelling/maxent/maxent.jar