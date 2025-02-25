# Running locally
To run the portal locally, you can use the docker-compose file in the [/docker folder](/docker).

However, a few additional manual steps are required.
## Steps
### 1. Build local docker image
A special tomcat container is used, "portal-full", which contains all the services required to run the portal in a single docker image.
This is to reduce the amount of resources needed, making it possible to run everything on a single laptop.

Next, to build the portal-full image, you can use the following command:
```commandline
cd docker && docker buildx bake local-dev --load
```

Be aware this can take a while, especially the first time.  
In order to speed up the build process, we customize the gradle builder image.  
Mostly so we can override the maven repositories used by the australian projects.  
Details can be found in the [gradle docker folder](./docker/gradle).

#### Limit resources needed for building the docker images
Building all these images, all at once can use a large amount of resources.
If you want to be able to do other things while building, you might want to limit the required reousrces.
That way your computer does not risk becoming entirely unresponsive.

To do this, create and use a custom buildx builder based on the builkitd config provided in the docker folder.
Like so:
```commandline
docker buildx create --use --bootstrap \
  --name vbp-builder \
  --driver docker-container \
  --config ./docker/buildkitd.toml
```
This limits the amount of tasks the builder will run in parallel to avoid overloading your computer.
(especially you memory)

### 2. Add hostname
The platform requires a hostname that resolves to the same thing by both the services, running inside docker containers and the client browser.  
On linux you can edit your `/etc/hosts` file to look something like this:  
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

cd commonui-bs3-2019
npm install
npx gulp build

cd ..
npm install
npm run build
```

### 4. Start the services
Finally, we can start the services using the following command:

```commandline
docker-compose -f docker/docker-compose.yaml up
```

## Data
The portal uses local databases, all initialized correctly, but entirely empty.
[We are still working on a way to provide a local database with some test data.](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/53)

Alternatively, you can use port-forwarding to use remote databases.
Especially for solr, this can be useful, as it can take a long time to index all the data.  
Simply comment out the solr docker instances and start a port-forwarding process:
```commandline
ssh ubuntu@<ip of bastion server> -N -L 0.0.0.0:8983:solr.biodiversiteitsportaal.dev.internal:8983
```

## Authentication
We use mock-oauth2 to simulate an openid-connect service.  
Simply use whatever name you want went prompted for a login.  
On order to access the platform as admin, simply adding the json below should work
```json
{
  "role": "ROLE_ADMIN"
}
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

## Reloading services without rebuilding and restarting everything
In order to quickly test changes to service code, a script is provided to quickly upload a new war file to the tomcat server and reload the service.
This can be done using the following command:
```commandline
./scripts/update-local-war.sh <service-name> <path-to-war>

# In order to quickly test spatial-hub changes for example, you can use:
cd ~/Projects/Inbo/spatial-hub
./gradlew assemble -x test -x integrationTest
~/Projects/Inbo/vlaams-biodiversiteitsportaal/scripts/update-local-war.sh "spatial-hub" build/libs/spatial-hub-2.1.2-SNAPSHOT-plain.war
```