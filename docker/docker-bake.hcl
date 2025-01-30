variable "TAG" {
  default = "dev"
}

variable "DOCKER_REPO" {
  default = "local"
}

target "custom-gradle" {
  context = "./gradle"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-custom-gradle:cache-github"]
  tags = ["custom-gradle:${TAG}"]
}

target "custom-maven" {
  context = "./maven"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-custom-maven:cache-github"]
  tags = ["custom-maven:${TAG}"]
}


target "tomcat-base" {
  context = "./tomcat"
  cache-from = ["${DOCKER_REPO}/inbo-vbp-tomcat-base:cache-github"]
  tags = ["tomcat:${TAG}"]
  target  = "base"
}

target "portal-full" {
  context = "./tomcat"
  contexts = {
    "tomcat-base"      = "target:tomcat-base"
    "alerts"           = "target:alerts"
    "apikey"           = "target:apikey"
    "bie-hub"          = "target:bie-hub"
    "bie-index"        = "target:bie-index"
    "biocache-hub"     = "target:biocache-hub"
    "biocache-service" = "target:biocache-service"
    "collectory"       = "target:collectory"
    "doi-service"      = "target:doi-service"
    "image-service"    = "target:image-service"
    "logger"           = "target:logger"
    "regions"          = "target:regions"
    "spatial-hub"      = "target:spatial-hub"
    "spatial-service"  = "target:spatial-service"
    "species-list"     = "target:species-list"
    "userdetails"      = "target:userdetails"
  }
  tags = ["${DOCKER_REPO}/inbo-vbp-portal-full:${TAG}"]
  target = "portal"
}

target "alerts" {
  context = "./alerts"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-alerts:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-alerts:${TAG}"]
}

target "apikey" {
  context = "./apikey"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-apikey:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-apikey:${TAG}"]
}

target "bie-hub" {
  context = "./bie-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-bie-hub:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-bie-hub:${TAG}"]
}

target "bie-index" {
  context = "./bie-index"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-bie-index:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-bie-index:${TAG}"]
}

target "biocache-hub" {
  context = "./biocache-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-biocache-hub:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-biocache-hub:${TAG}"]
}

target "biocache-service" {
  context = "./biocache-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-biocache-service:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-biocache-service:${TAG}"]
}

target "collectory" {
  context = "./collectory"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-collectory:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-collectory:${TAG}"]
}

target "doi-service" {
  context = "./doi-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-doi-service:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-doi-service:${TAG}"]
}

target "image-service" {
  context = "./image-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-image-service:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-image-service:${TAG}"]
}

target "logger" {
  context = "./logger"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-logger:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-logger:${TAG}"]
}

target "namematching-service" {
  context = "./namematching-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-namematching-service:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-namematching-service:${TAG}"]
}

target "pipelines" {
  context = "./pipelines"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-pipelines:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-pipelines:${TAG}"]
}

target "regions" {
  context = "./regions"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-regions:cache-github"]
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
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-spatial-hub:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-spatial-hub:${TAG}"]
}

target "spatial-service" {
  context = "./spatial-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-spatial-service:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-spatial-service:${TAG}"]
}

target "species-list" {
  context = "./species-list"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-species-list:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-species-list:${TAG}"]
}

target "userdetails" {
  context = "./userdetails"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["${DOCKER_REPO}/inbo-vbp-userdetails:cache-github"]
  tags = ["${DOCKER_REPO}/inbo-vbp-userdetails:${TAG}"]
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
    "doi-service",
    "image-service",
    "logger",
    "namematching-service",
    "pipelines",
    "regions",
    "sensitive-data-service",
    "spatial-hub",
    "spatial-service",
    "species-list",
    "userdetails",
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
    "doi-service",
    "image-service",
    "logger",
    "namematching-service",
    "regions",
    "sensitive-data-service",
    "spatial-hub",
    "spatial-service",
    "species-list",
    "userdetails",
  ]
}

group "local-dev" {
  targets = [
    "namematching-service",
    "portal-full",
    "sensitive-data-service",
  ]
}
