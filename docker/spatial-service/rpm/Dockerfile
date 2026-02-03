FROM amazoncorretto:11

# trivy:ignore:DS-0015  # using BuildKit yum cache
RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum -y install \
    gcc-c++ \
    cpp \
    sqlite-devel \
    libtiff \
    libpng-devel \
    cmake3 \
    make \
    tar \
    gzip \
    rpmdevtools \
    rpm-build

RUN rpmdev-setuptree

ENTRYPOINT ["bash", "-c"]
