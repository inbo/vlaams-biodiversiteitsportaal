# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} maven:3.9-amazoncorretto-8 AS builder

RUN mkdir ~/.m2
COPY settings.xml /root/.m2/settings.xml

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum -y install git unzip

# Download and unzip aws x-ray agent for easy copy to runtime images
RUN mkdir /opt/aws-xray-agent \
    && curl -fL https://github.com/aws/aws-xray-java-agent/releases/latest/download/xray-agent.zip -o /opt/aws-xray-agent/xray-agent.zip \
    && unzip /opt/aws-xray-agent/xray-agent.zip -d /opt/aws-xray-agent \
    && rm /opt/aws-xray-agent/xray-agent.zip