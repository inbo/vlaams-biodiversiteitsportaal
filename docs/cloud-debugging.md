# Cloud Debugging

## Logs
A grafana instance is running at [monitoring.biodiversiteitsportaal.dev.svdev.be](https://monitoring.biodiversiteitsportaal.dev.svdev.be/).
It allows you to look at the logs for the platform services, as well as the pipeline batch and EMR processing.
In order to have access, you need to login using your atlas user and have the _ADMIN_ role.

## Connecting to remote containers
All of the running ecs and batch containers have been configured to allow remote debugging using SSM.
This means we can open a shell in the running container to see what is going on.

The command needed to start a bash shell in a running ecs-container looks something like this:
```commandline
aws ecs execute-command --cluster inbo-biodiversiteitsportaal-cluster --command '/bin/bash' --interactive --container <name of the container> --task <name of the ecs task>
```

## Connecting to the databases (port-forwarding)
The databases are not directly accessible from the internet, because they are running in a private subnet.
To access them, we need to setup a port-forwarding using the bastion host.

A script has been provided in the scripts folder to make this a little easier:
```commandline
./scripts/port-forward.sh <host name> <remote port> <local port>

# e.g. example to conenct to the postgres RDS
./scripts/port-forward.sh tf-20240617092958781900000003.ccdv8uvkk6xd.eu-west-1.rds.amazonaws.com 5432 5432
```

This should allow you to connect to the database locally using your favorite database client.
To find the correct host, port and DB credentials, you can look at the [AWS console](https://eu-west-1.console.aws.amazon.com/rds/home?region=eu-west-1).