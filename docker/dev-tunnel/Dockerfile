# Local development only: an SSM port-forward to a host in the AWS VPC (through a running ECS task),
# exposed on the local docker network. Used by scripts/local-data/dev-data.sh.
FROM amazonlinux:2023

ARG TARGETARCH
## trivy:ignore:DS-0015  # using BuildKit dnf cache
RUN --mount=type=cache,target=/var/cache/dnf,sharing=locked \
    dnf -y install awscli-2 socat \
    && case "${TARGETARCH:-amd64}" in arm64) plugin_arch=linux_arm64 ;; *) plugin_arch=linux_64bit ;; esac \
    && dnf -y install "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/${plugin_arch}/session-manager-plugin.rpm" \
    && session-manager-plugin --version

COPY tunnel.sh /tunnel.sh

USER 1000:1000
ENTRYPOINT ["/tunnel.sh"]
