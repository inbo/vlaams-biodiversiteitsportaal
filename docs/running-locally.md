# Running locally
To run the portal locally, you can use the docker-compose file in the [/docker folder](/docker).

However, a few additional manual steps are required.
## Steps
### 1. Build local docker image
A special tomcat container is used, "portal-full", which contains all the services required to run the portal in a single docker image.
This is to reduce the amount of resources needed, making it possible to run everything on a single laptop.

Most of the projects have the Australian gradle repo hard coded and this makes downloading the dependencies very slow.
To mitigate this we use a custom docker cache for gradle.  
Unfortunately it is not possible to share this cache between different instances of gradle.    
That means we can only build a single image at a time.    

To accomplish this, a specific buildx builder can be used.  
(This should also allow for multi-platform builds)
The command to create the builder and immediately use it as the default is this:
```commandline
docker buildx create --use \                                                                                                                            ✔  09:23:28 ▓▒░
  --name living-atlas \
  --driver docker-container \
  --config ./buildkitd.toml
```

Next, to build the portal-full image, you can use the following command:
```commandline
cd docker && docker buildx bake portal-full --load
```

Be aware this can take quite a while the first time.  
It requires checking out all of the services one-by-one and building them from scratch.


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
