variable "TAG" {
  default = "dev"
}

variable "CACHE_TAG" {
  default = "dev"
}

variable "DOCKER_REPO" {
  default = "local"
}

target "custom-gradle-jdk11" {
  context = "./gradle"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-custom-gradle:jdk11-${CACHE_TAG}"]
  tags = ["custom-gradle-jdk11:${TAG}"]
  args = {
    JDK_VERSION = "11"
    GRADLE_VERSION = "7"
  }
}

target "custom-gradle-jdk17" {
  context = "./gradle"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-custom-gradle:jdk17-${CACHE_TAG}"]
  tags = ["custom-gradle-jdk17:${TAG}"]
  args = {
    JDK_VERSION = "17"
    GRADLE_VERSION = "7"
  }
}

target "custom-gradle-jdk21" {
  context = "./gradle"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-custom-gradle:jdk21-${CACHE_TAG}"]
  tags = ["custom-gradle-jdk21:${TAG}"]
  args = {
    JDK_VERSION = "21"
    GRADLE_VERSION = "8"
  }
}

target "custom-maven" {
  context = "./maven"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-custom-maven:${CACHE_TAG}"]
  tags = ["custom-maven:${TAG}"]
}

target "portal-full" {
  context = "./portal-full"
  contexts = {
    "alerts"                      = "target:alerts"
    "apikey"                      = "target:apikey"
    "bie-hub"                     = "target:bie-hub"
    "bie-index"                   = "target:bie-index"
    "biocache-hub"                = "target:biocache-hub"
    "biocache-service"            = "target:biocache-service"
    "collectory"                  = "target:collectory"
    "data-quality-filter-service" = "target:data-quality-filter-service"
    "image-service"               = "target:image-service"
    "logger"                      = "target:logger"
    "regions"                     = "target:regions"
    "spatial-hub"                 = "target:spatial-hub"
    "spatial-service"             = "target:spatial-service"
    "species-list"                = "target:species-list"
  }
  tags = ["${DOCKER_REPO}/inbo-vbp-portal-full:${TAG}"]
}

target "alerts" {
  context = "./alerts"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-alerts:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-alerts:${TAG}"]
}

target "apikey" {
  context = "./apikey"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-apikey:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-apikey:${TAG}"]
}

target "bie-hub" {
  context = "./bie-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-bie-hub:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-bie-hub:${TAG}"]
}

target "bie-index" {
  context = "./bie-index"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-bie-index:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-bie-index:${TAG}"]
}

target "biocache-hub" {
  context = "./biocache-hub"
  contexts = {
    "custom-gradle-jdk17" = "target:custom-gradle-jdk17"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-biocache-hub:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-biocache-hub:${TAG}"]
}

target "biocache-service" {
  context = "./biocache-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-biocache-service:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-biocache-service:${TAG}"]
}

target "collectory" {
  context = "./collectory"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-collectory:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-collectory:${TAG}"]
}

target "data-quality-filter-service" {
  context = "./data-quality-filter-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-data-quality-filter-service:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-data-quality-filter-service:${TAG}"]
}

target "image-service" {
  context = "./image-service"
  contexts = {
    "custom-gradle-jdk21" = "target:custom-gradle-jdk21"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-image-service:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-image-service:${TAG}"]
}

target "logger" {
  context = "./logger"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-logger:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-logger:${TAG}"]
}

target "namematching-service" {
  context = "./namematching-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-namematching-service:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-namematching-service:${TAG}"]
}

target "pipelines" {
  context = "./pipelines"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-pipelines:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-pipelines:${TAG}"]
}

target "regions" {
  context = "./regions"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-regions:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-regions:${TAG}"]
}

target "sensitive-data-service" {
  context = "./sensitive-data-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  tags = ["${DOCKER_REPO}/inbo-vbp-sensitive-data-service:${TAG}"]
}

target "spatial-hub" {
  context = "./spatial-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-spatial-hub:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-spatial-hub:${TAG}"]
}

target "spatial-service" {
  context = "./spatial-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-spatial-service:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-spatial-service:${TAG}"]
}

target "species-list" {
  context = "./species-list"
  contexts = {
    "custom-gradle" = "target:custom-gradle-jdk11"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-species-list:${CACHE_TAG}"]
  tags = ["${DOCKER_REPO}/inbo-vbp-species-list:${TAG}"]
}

group "all" {
  targets = [
    "alerts",
    "apikey",
    "bie-hub",
    "bie-index",
    "biocache-hub",
    "biocache-service",
    "collectory",
    "data-quality-filter-service",
    "image-service",
    "logger",
    "namematching-service",
    "pipelines",
    "regions",
    "sensitive-data-service",
    "spatial-hub",
    "spatial-service",
    "species-list",
    "portal-full",
  ]
}

group "services" {
  targets = [
    "alerts",
    "apikey",
    "bie-hub",
    "bie-index",
    "biocache-hub",
    "biocache-service",
    "collectory",
    "data-quality-filter-service",
    "image-service",
    "logger",
    "namematching-service",
    "regions",
    "sensitive-data-service",
    "spatial-hub",
    "spatial-service",
    "species-list",
  ]
}

group "local-dev" {
  targets = [
    "namematching-service",
    "portal-full",
    "sensitive-data-service",
  ]
}

