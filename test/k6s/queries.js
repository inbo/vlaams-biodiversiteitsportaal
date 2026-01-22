import http from "k6/http";
import { check, sleep } from "k6";
import { Httpx } from "https://jslib.k6.io/httpx/0.1.0/index.js";
import { randomItem } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import exec from "k6/execution";

const K6_LOAD_TEST_BASE_URL =
  __ENV.K6_LOAD_TEST_BASE_URL || "https://natuurdata.inbo.be";

const K6_LOAD_TEST_CLIENT_ID = __ENV.K6_LOAD_TEST_CLIENT_ID;
const K6_LOAD_TEST_CLIENT_SECRET = __ENV.K6_LOAD_TEST_CLIENT_SECRET;

export const options = {
  scenarios: {
    queries: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 },
        { duration: "10m", target: 50 },
        { duration: "2m", target: 0 },
      ],
      gracefulRampDown: "0s",
    },
  },
};

let session = new Httpx({
  baseURL: K6_LOAD_TEST_BASE_URL,
});

export function setup() {
  if (K6_LOAD_TEST_CLIENT_ID) {
    const authResponse = session.post(
      "https://auth.inbo.be/realms/vbp/protocol/openid-connect/token",
      {
        grant_type: "client_credentials",
        client_id: K6_LOAD_TEST_CLIENT_ID,
        client_secret: K6_LOAD_TEST_CLIENT_SECRET,
      },
      {
        tags: {
          name: "auth",
        },
      },
    );

    // //printing out response body/status/access_token - for debug
    // console.log(authResponse.body);
    // console.log(authResponse.status);
    // console.log(authResponse.json("access_token"));

    //defining checks

    check(authResponse, { "status returned 200": (r) => r.status == 200 });

    let authToken = authResponse.json("access_token");
    // set the authorization header on the session for the subsequent requests.
    session.addHeader("Authorization", `Bearer ${authToken}`);
  }
}

export default () => {
  const query = randomItem(["q=*:*", "q=*:*&qualityProfile=VBP_algemeen"]);
  const urlRes = http.get(
    `${K6_LOAD_TEST_BASE_URL}/biocache-hub/occurrences/search?${query}`,
    {
      tags: {
        name: "occurrence query",
      },
    },
  );

  check(urlRes, { "status returned 200": (r) => r.status == 200 });
  if (urlRes.status == 405) {
    exec.test.abort("Hit Cloudfront Ratelimit");
  }

  const html = urlRes.html();
  const numberOfRecords = parseInt(
    html
      .find("#resultsReturned > #returnedText > strong")
      .get(0)
      .innerHTML()
      .replace(/\./g, ""),
  );

  check(numberOfRecords, {
    "Found some records": (number) => number > 0,
  });

  getFacets(query, [
    "locality",
    "country",
    "municipality",
    "event_id",
    "parent_event_id",
    "eventHierarchy",
    "eventTypeHierarchy",
    "multimedia",
    "data_resource_uid",
  ]);

  sleep(Math.random() * 5);
};

function getFacets(query, facets) {
  for (const facet of facets) {
    const urlRes = http.get(
      `${K6_LOAD_TEST_BASE_URL}/biocache-service/occurrences/search?${query}&facets=${facet}&qc=-_nest_parent_:*`,
      {
        tags: {
          name: "occurrence facet",
        },
      },
    );

    check(urlRes, { "status returned 200": (r) => r.status == 200 });

    console.log(facet);
    console.log(urlRes.body);
    const json = urlRes.json();

    check(json, {
      "Found some records": (j) => j.totalRecords > 0,
    });
  }
}
