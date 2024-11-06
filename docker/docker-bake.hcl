variable "TAG" {
  default = "dev"
}

target "tomcat-base" {
  context = "./tomcat"
  tags = ["tomcat:${TAG}"]
  target  = "base"
}

target "portal-full" {
  context = "./tomcat-base"
  contexts = {
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
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/alerts:${TAG}"]
}

target "apikey" {
  context = "./apikey"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:${TAG}"]
}

target "bie-hub" {
  context = "./bie-hub"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:${TAG}"]
}

target "bie-index" {
  context = "./bie-index"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:${TAG}"]
}

target "biocache-hub" {
  context = "./biocache-hub"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:${TAG}"]
}

target "biocache-service" {
  context = "./biocache-service"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:${TAG}"]
}

target "collectory" {
  context = "./collectory"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:${TAG}"]
}

target "doi-service" {
  context = "./doi-service"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:${TAG}"]
}

target "image-service" {
  context = "./image-service"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:${TAG}"]
}

target "logger" {
  context = "./logger"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:${TAG}"]
}

target "regions" {
  context = "./regions"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:${TAG}"]
}

target "spatial-hub" {
  context = "./spatial-hub"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:${TAG}"]
}

target "spatial-service" {
  context = "./spatial-service"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:${TAG}"]
}

target "species-list" {
  context = "./species-list"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:${TAG}"]
}

target "userdetails" {
  context = "./userdetails"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:${TAG}"]
}

target "portal-full" {
  context = "./tomcat"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
    "alerts"      = "target:alerts"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/portal-full:${TAG}"]
}

target "pipelines" {
  context = "./pipelines"
  contexts = {
    "tomcat-base" = "target:tomcat-base"
    "alerts"      = "target:alerts"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/pipelines:${TAG}"]
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
    "regions",
    "spatial-hub",
    "spatial-service",
    "species-list",
    "userdetails",
    "portal-full",
#     "pipelines"
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
    "regions",
    "spatial-hub",
    "spatial-service",
    "species-list",
    "userdetails",
  ]
}
