ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} maven:3.8-openjdk-8 AS builder

RUN mkdir ~/.m2
COPY settings.xml /root/.m2/settings.xml
