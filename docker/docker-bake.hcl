variable "TAG" {
  default = "dev"
}

target "custom-gradle" {
  context = "./gradle"
  tags = ["custom-gradle:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=custom-gradle,prefix=custom-gradle/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=custom-gradle,prefix=custom-gradle/"]
}

target "custom-maven" {
  context = "./maven"
  tags = ["custom-maven:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=custom-maven,prefix=custom-maven/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=custom-maven,prefix=custom-maven/"]
}


target "tomcat-base" {
  context = "./tomcat"
  tags = ["tomcat:${TAG}"]
  target  = "base"
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=tomcat-base,prefix=tomcat-base/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=tomcat-base,prefix=tomcat-base/"]
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
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=alerts,prefix=alerts/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=alerts,prefix=alerts/"]
}

target "apikey" {
  context = "./apikey"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/apikey:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=apikey,prefix=apikey/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=apikey,prefix=apikey/"]
}

target "bie-hub" {
  context = "./bie-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-hub:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=bie-hub,prefix=bie-hub/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=bie-hub,prefix=bie-hub/"]
}

target "bie-index" {
  context = "./bie-index"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/bie-index:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=bie-index,prefix=bie-index/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=bie-index,prefix=bie-index/"]
}

target "biocache-hub" {
  context = "./biocache-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-hub:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=biocache-hub,prefix=biocache-hub/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=biocache-hub,prefix=biocache-hub/"]
}

target "biocache-service" {
  context = "./biocache-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/biocache-service:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=biocache-service,prefix=biocache-service/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=biocache-service,prefix=biocache-service/"]
}

target "collectory" {
  context = "./collectory"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/collectory:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=collectory,prefix=collectory/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=collectory,prefix=collectory/"]
}

target "doi-service" {
  context = "./doi-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/doi-service:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=doi-service,prefix=doi-service/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=doi-service,prefix=doi-service/"]
}

target "image-service" {
  context = "./image-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/image-service:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=image-service,prefix=image-service/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=image-service,prefix=image-service/"]
}

target "logger" {
  context = "./logger"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/logger:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=logger,prefix=logger/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=logger,prefix=logger/"]
}

target "namematching-service" {
  context = "./namematching-service"
  contexts = {
    "custom-maven" = "target:custom-maven"
    "tomcat-base"  = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/namematching-service:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=namematching-service,prefix=namematching-service/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=namematching-service,prefix=namematching-service/"]
}

target "pipelines" {
  context = "./pipelines"
  contexts = {
    "custom-maven" = "target:custom-maven"
    "tomcat-base"  = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/la-pipelines:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=pipelines,prefix=pipelines/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=pipelines,prefix=pipelines/"]
}

target "regions" {
  context = "./regions"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/regions:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=regions,prefix=regions/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=regions,prefix=regions/"]
}

target "spatial-hub" {
  context = "./spatial-hub"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-hub:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=spatial-hub,prefix=spatial-hub/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=spatial-hub,prefix=spatial-hub/"]
}

target "spatial-service" {
  context = "./spatial-service"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/spatial-service:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=spatial-service,prefix=spatial-service/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=spatial-service,prefix=spatial-service/"]
}

target "species-list" {
  context = "./species-list"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/species-list:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=species-list,prefix=species-list/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=species-list,prefix=species-list/"]
}

target "userdetails" {
  context = "./userdetails"
  contexts = {
    "custom-gradle" = "target:custom-gradle"
    "tomcat-base"   = "target:tomcat-base"
  }
  tags = ["632683202044.dkr.ecr.eu-west-1.amazonaws.com/userdetails:${TAG}"]
  cache-to = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=userdetails,prefix=userdetails/,mode=max"]
  cache-from = ["type=s3,region=eu-west-1,bucket=biodiversiteitsportaal-docker-build-cache,name=userdetails,prefix=userdetails/"]
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
