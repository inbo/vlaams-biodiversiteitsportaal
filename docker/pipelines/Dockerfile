# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG VERSION=fixed-stuff
ARG COMMIT=15db71c4357e9f3d644aa6ca38e697b74815b416
ARG SOURCE=https://github.com/StefanVanDyck/pipelines.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /app
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn --batch-mode --no-transfer-progress \
        clean install -DskipTests -DskipITs -T 10 -U \
    && cd livingatlas \
    && mvn --batch-mode --no-transfer-progress \
        clean package -P livingatlas-artifacts -DskipTests -DskipITs -T 10 -U

# ARG VERSION=pipelines-parent-2.18.5
# RUN git clone --branch ${VERSION} --depth 1 https://github.com/gbif/pipelines.git /app
# WORKDIR /app
#
# RUN --mount=type=cache,target=/root/.m2/repository \
#     cd livingatlas && mvn clean package -P livingatlas-artifacts -DskipTests -DskipITs -T 10 -U

# ARG test=2
# RUN ls -la livingatlas/pipelines/target/pipelines-2.18.6-SNAPSHOT.jar
#
FROM amazoncorretto:8

ARG COMMIT=15db71c4357e9f3d644aa6ca38e697b74815b416
LABEL ala.version=inbo-${COMMIT}
#
# ARG VERSION=2.18.6-SNAPSHOT
RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum update -y && \
    yum install -y \
    nano \
    file \
    curl \
    unzip \
    which \
    shadow-utils

RUN mkdir /data && chown 1000:1000 /data
VOLUME /data

ARG TARGETARCH

RUN curl -o /usr/bin/yq -LJO https://github.com/mikefarah/yq/releases/download/v4.44.3/yq_linux_$TARGETARCH \
    && chmod +x /usr/bin/yq

RUN if [ $TARGETARCH = "amd64" ] ; then curl -o /usr/bin/docopts -LJO https://github.com/docopt/docopts/releases/download/v0.6.3-rc2/docopts_linux_amd64 ; fi
RUN if [ $TARGETARCH = "arm64" ] ; then curl -o /usr/bin/docopts -LJO https://github.com/docopt/docopts/releases/download/v0.6.3-rc2/docopts_linux_arm ; fi
RUN chmod +x /usr/bin/docopts

RUN if [ $TARGETARCH = "amd64" ] ; then curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o "awscliv2.zip" ; fi
RUN if [ $TARGETARCH = "arm64" ] ; then curl https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip -o "awscliv2.zip" ; fi
RUN unzip -q awscliv2.zip && \
    ./aws/install

USER 1000

COPY --from=builder --chown=1000:1000 /app /app

WORKDIR /app/livingatlas/scripts

ENTRYPOINT ["bash", "-c"]
