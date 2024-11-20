
db = db.getSiblingDB('cas-audit-repository');
db.createUser(
    {
        user: "audit",
        pwd: "my-super-secret-password",
        roles: [
            {
                role: "readWrite",
                db: "cas-audit-repository"
            }
        ]
    }
);

db = db.getSiblingDB('cas-service-registry');
db.createUser(
    {
        user: "services",
        pwd: "my-super-secret-password",
        roles: [
            {
                role: "readWrite",
                db: "cas-service-registry"
            }
        ]
    }
);

db = db.getSiblingDB('cas-ticket-registry');
db.createUser(
    {
        user: "tickets",
        pwd: "my-super-secret-password",
        roles: [
            {
                role: "readWrite",
                db: "cas-ticket-registry"
            }
        ]
    }
);