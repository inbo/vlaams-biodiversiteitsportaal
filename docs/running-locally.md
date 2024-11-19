# Running locally
To run the portal locally, you can use the docker-compose file in the [/docker folder](/docker).

However, a few additional manual steps are required.
## Steps
### 1. Build local docker image
A special tomcat container is used, "portal-full", which contains all the services required to run the portal in a single docker image.
This is to reduce the amount of resources needed, making it possible to run everything on a single laptop.

Next, to build the portal-full image, you can use the following command:
```commandline
cd docker && docker buildx bake portal-full --load
```

Be aware this can take a while, especially the first time.  
In order to speed up the build process, we customize the gradle builder image.  
Mostly so we can override the maven repositories used by the australian projects.  
Details can be found in the [gradle docker folder](./docker/gradle).

### 2. Add hostname
The platform requires a hostname that resolves to the same thing by both the services, running inside docker containers and the client browser.
On linux you need to add the following lines to your `/etc/hosts` file.

```commandline
127.0.0.1 localhost host.docker.internal
```

### 3. Build the front-end 
We need to generate the static front-end pages.  
These are used for the landing page and the custom UI branding.  
To do this, you need to run the following command in the [branding folder](./branding)

```commandline
cd branding
git submodule update --init --recursive
npm install
NODE_ENV=docker npx brunch build
```

### 4. Start the services
Finally, we can start the services using the following command:

```commandline
docker-compose -f docker/docker-compose.yml up
```

## Debugging
To allow easy debugging, the portal image can be started with `REMOTE_DEBUGGER_PORT: 5005` as environment variable.
This make it possible to attach a remote JVM debugger to the 5005 port.  
All the services, running in the portal-full image, can be debugged this way.

## Differences with the cloud environments
Because some AWS Cloud services are not available locally, alternatives are used in the local environment.
These are:
- **nginx**   
Instead of the AWS Application Load Balancer and the AWS CloudFront distribution with static pages.
- **mock-oauth2**  
Instead of AWS Cognito for user authentication and authorization.
- **mailhog**  
Instead of SES a smtp server.
