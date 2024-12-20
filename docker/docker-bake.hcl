variable "TAG" {
  default = "dev"
}

target "custom-gradle" {
  context = "./gradle"
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/custom-gradle:cache-github"]
  tags = ["custom-gradle:${TAG}"]
}

target "custom-maven" {
  context = "./maven"
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/custom-maven:cache-github"]
  tags = ["custom-maven:${TAG}"]
}


target "tomcat-base" {
  context = "./tomcat"
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/tomcat-base:cache-github"]
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
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/portal-full:${TAG}"]
  target = "portal"
}

target "alerts" {
  context = "./alerts"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/alerts:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/alerts:${TAG}"]
}

target "apikey" {
  context = "./apikey"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:${TAG}"]
}

target "bie-hub" {
  context = "./bie-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:${TAG}"]
}

target "bie-index" {
  context = "./bie-index"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:${TAG}"]
}

target "biocache-hub" {
  context = "./biocache-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:${TAG}"]
}

target "biocache-service" {
  context = "./biocache-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:${TAG}"]
}

target "collectory" {
  context = "./collectory"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:${TAG}"]
}

target "doi-service" {
  context = "./doi-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:${TAG}"]
}

target "image-service" {
  context = "./image-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:${TAG}"]
}

target "logger" {
  context = "./logger"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:${TAG}"]
}

target "namematching-service" {
  context = "./namematching-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/namematching-service:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/namematching-service:${TAG}"]
}

target "pipelines" {
  context = "./pipelines"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/pipelines:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/pipelines:${TAG}"]
}

target "regions" {
  context = "./regions"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:${TAG}"]
}

target "sensitive-data-service" {
  context = "./sensitive-data-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/sensitive-data-service:${TAG}"]
}

target "spatial-hub" {
  context = "./spatial-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:${TAG}"]
}

target "spatial-service" {
  context = "./spatial-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:${TAG}"]
}

target "species-list" {
  context = "./species-list"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:${TAG}"]
}

target "userdetails" {
  context = "./userdetails"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  cache-from = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:cache-github"]
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:${TAG}"]
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

