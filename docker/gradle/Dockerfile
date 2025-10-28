# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
ARG GRADLE_VERSION=8
ARG JDK_VERSION=21
FROM --platform=${BUILDPLATFORM} gradle:${GRADLE_VERSION}-jdk${JDK_VERSION}-corretto AS builder

COPY gradle.properties /home/gradle/.gradle/gradle.properties
COPY init.gradle /home/gradle/.gradle/init.gradle

ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum update -y && \
    yum install -y \
        rsync

# Download opentelemetry agent for easy copy to runtime images
RUN mkdir /opt/opentelemetry-agent \
    && curl -fL https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v2.21.0/opentelemetry-javaagent.jar -o /opt/opentelemetry-agent/opentelemetry-javaagent.jar
