variable "TAG" {
  default = "dev"
}
variable "CACHE_TAG" {
  default = "cache-${TAG}"
}

target "custom-gradle" {
  context = "./gradle"
  tags = ["custom-gradle:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/custom-gradle:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/custom-gradle:${CACHE_TAG}"]
}

target "custom-maven" {
  context = "./maven"
  tags = ["custom-maven:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/custom-maven:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/custom-maven:${CACHE_TAG}"]
}


target "tomcat-base" {
  context = "./tomcat"
  tags = ["tomcat:${TAG}"]
  target  = "base"
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/tomcat-base:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/tomcat-base:${CACHE_TAG}"]
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
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/portal-full:${TAG}"]
  target = "portal"
}

target "alerts" {
  context = "./alerts"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/alerts:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/alerts:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/alerts:${CACHE_TAG}"]
}

target "apikey" {
  context = "./apikey"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:${CACHE_TAG}"]
}

target "bie-hub" {
  context = "./bie-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:${CACHE_TAG}"]
}

target "bie-index" {
  context = "./bie-index"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:${CACHE_TAG}"]
}

target "biocache-hub" {
  context = "./biocache-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:${CACHE_TAG}"]
}

target "biocache-service" {
  context = "./biocache-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:${CACHE_TAG}"]
}

target "collectory" {
  context = "./collectory"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:${CACHE_TAG}"]
}

target "doi-service" {
  context = "./doi-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:${CACHE_TAG}"]
}

target "image-service" {
  context = "./image-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:${CACHE_TAG}"]
}

target "logger" {
  context = "./logger"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:${CACHE_TAG}"]
}

target "namematching-service" {
  context = "./namematching-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
    "tomcat-base"  = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/namematching-service:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/namematching-service:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/namematching-service:${CACHE_TAG}"]
}

target "pipelines" {
  context = "./pipelines"
  contexts = {
    "custom-maven" = "target:custom-maven"
    "tomcat-base"  = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/la-pipelines:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/pipelines:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/pipelines:${CACHE_TAG}"]
}

target "regions" {
  context = "./regions"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:${CACHE_TAG}"]
}

target "spatial-hub" {
  context = "./spatial-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:${CACHE_TAG}"]
}

target "spatial-service" {
  context = "./spatial-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:${CACHE_TAG}"]
}

target "species-list" {
  context = "./species-list"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:${CACHE_TAG}"]
}

target "userdetails" {
  context = "./userdetails"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:${TAG}"]
  cache-to = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:${CACHE_TAG},image-manifest=true,mode=max"]
  cache-from = ["type=registry,ref=632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:${CACHE_TAG}"]
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
  ]
}
