# Vlaams Biodiversiteitsportaal

This project is the main source for developing the Flemish Biodiversity Portal.  
It is a customisation of the [Atlas of Living Australia](https://www.ala.org.au/) project.  
That project, started in 2008 in Australia, was aimed at providing easy access to all their biodiversity data.  
It has since been made open-source and [is currently used by a number of countries around the world](https://living-atlases.gbif.org/).

## Architecture
A DrawIO diagram showing an overview of the current architecture can be found [in the /docs folder](/docs/architecture.drawio).

### Web Application
The platform is made up of a number of microservices.  
Almost all of them use [Grails](https://grails.org/) as a framework.  
These are all containerised using docker and deployed to AWS ECS.
You can find the Dockerfiles in the [/docker folder](/docker).  
Internet access to the services is managed by an AWS Application Load Balancer.

Config files are stored separately in the [/config folder](/config).  
This keeps us from needing to rebuild the docker images every time the configuration or environment of a service is changed.  
One special config folder is [/config/common](/config/common), which contains common configuration shared between most of the services.

Finally, the static landing page, together with the custom UI Theming is stored in the [/branding folder](/branding).  
These files are served by an S3 bucket together with an AWS CloudFront distribution.

### Data pipelines
Data is ingested into the platform using a single AWS step function.  
[Its definition is currently maintained in the terraform project](https://github.com/inbo/inbo-aws-biodiversiteitsportaal-terraform/blob/master/region/common-region/la-pipelines-deployment/step-function-rule-them-all.tf).

It uses a combination of AWS Batch and EMR to index all occurrence data, managed in the _collectory_ service,  
and sample it against the species taxonomy, species list, and spatial layers.  
The data-processing logic can be found in the [gbif-pipelines project](https://github.com/gbif/pipelines/tree/dev/livingatlas).

The indexed data is finally uploaded to the SOLR service for use by the web platform.

### User Authentication and Authorization
User authentication and authorization uses openID connect.
It is currently provided by [AWS Cognito](https://github.com/inbo/inbo-aws-biodiversiteitsportaal-terraform/blob/master/region/common-region/cognito.tf).  
[But we plan on switching to keycloak before launch.](https://github.com/orgs/inbo/projects/15/views/6?sliceBy%5Bvalue%5D=authentication&pane=issue&itemId=72746929&issue=inbo%7Cvlaams-biodiversiteitsportaal%7C49)

## Running the portal

### Cloud
The portal is currently deployed to AWS using terraform.  
That logic is maintained in a separate, private project: [inbo-aws-biodiversiteitsportaal-terraform](https://github.com/inbo/inbo-aws-biodiversiteitsportaal-terraform)  
Look there for more information on how to make changes to the cloud environments.

#### Docker images
The definition of the docker images can be found in the [/docker folder](/docker).
To build them and release them to the AWS Elastic Container Registry, simply run the command below:

```commandline
# Get AWS ECR authorization token
aws ecr get-login-password --profile <aws profile name> | docker login --username AWS --password-stdin 632683202044.dkr.ecr.eu-west-1.amazonaws.com

# Build and push the images
cd docker && docker buildx bake --push all
```

Be aware that the first time building the images can take a long time, 
as all the services need to be built form scratch. 

### Local

Please refer to the [running locally documentation](docs/running-locally.md) for more information on how to run the portal locally.

## Making changes to the actual code
This project only contains the things needed to build and configure the platform.  
No actual code is managed here.

The code for the different components can be found in their respective repositories.  
We try to use the latest officially released versions, maintained by the [Atlas of Living Australia community](https://github.com/AtlasOfLivingAustralia).

However, when needed, some of those repositories are forked in order to make things work for us.  
Hopefully these forks are temporary and will be merged back into the original repositories.  
Or until we figure out what is wrong with our configuration to necessitate the changes.

To check with version of a component is being used, look at their Dockerfile in the [/docker folder](/docker).

## Contributing
We use Github issues to track all the work on the portal.  
Feel free to create an issue if you have a question or want to suggest a change.
