# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} maven:3.9-amazoncorretto-8 AS builder

RUN mkdir ~/.m2
COPY settings.xml /root/.m2/settings.xml

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum -y install git