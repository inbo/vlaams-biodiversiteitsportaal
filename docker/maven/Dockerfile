# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
# Only used by namematching-service: its Lombok 1.18.32 builds on JDK 21 but
# not on JDK 25. Keep in line with the Corretto 21 runtime image.
FROM --platform=${BUILDPLATFORM} maven:3.9.16-amazoncorretto-21 AS builder

RUN mkdir ~/.m2
COPY settings.xml /root/.m2/settings.xml

# trivy:ignore:DS-0002 trivy:ignore:DS-0026 trivy:ignore:DS-0015
RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum -y install git unzip tar

# Download and opentelemetry agent for easy copy to runtime images
RUN mkdir /opt/opentelemetry-agent \
    && curl -fL https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.21.0/opentelemetry-javaagent.jar -o /opt/opentelemetry-agent/opentelemetry-javaagent.jar
