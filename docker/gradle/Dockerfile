# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
ARG JDK_VERSION=11
FROM --platform=${BUILDPLATFORM} gradle:7-jdk${JDK_VERSION}-corretto AS builder

COPY gradle.properties /home/gradle/.gradle/gradle.properties
COPY init.gradle /home/gradle/.gradle/init.gradle

ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum update -y && \
    yum install -y \
        rsync