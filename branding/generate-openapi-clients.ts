import { createClient, defaultPlugins } from "@hey-api/openapi-ts";

import fg from "fast-glob";
import { console } from "node:inspector";
import { basename } from "node:path";

fg.globSync("./src/common/clients/*.yml").forEach((schema) => {
    const serviceName = basename(schema, ".yml");
    createClient({
        input: schema,
        output: `./src/common/clients/.generated/${serviceName}`,
        plugins: [
            ...defaultPlugins,
            "@hey-api/client-fetch",
        ],
    });
});
