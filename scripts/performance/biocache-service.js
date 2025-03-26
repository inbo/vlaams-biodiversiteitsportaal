import http from 'k6/http';
import { URL, URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const DURATION = __ENV.DURATION || '1m';

const ACCESS_TOKEN = __ENV.ACCESS_TOKEN;;

export const options = {
//  duration: DURATION,
  iterations: 1,
};

const searchUrl = new URL(`${BASE_URL}/biocache-service/occurrences/search`).toString();
const allBunnies = new URLSearchParams([
    ['q', 'taxa:konijn'],
]).toString()
const allDimiFullText = new URLSearchParams([
    ['q', 'Dimitri'],
]).toString();
const multipleConditions = new URLSearchParams([
    ['q', 'species_group:Animals AND state:Flanders AND country:Belgium AND basis_of_record:HUMAN_OBSERVATION AND (taxa:"Konijn" OR taxa:"Wolf")'],
]).toString();
const multipleFilterQueries = new URLSearchParams([
    ['q', '*:*'],
    ['fq', 'multimedia:"Image"'],
    ['fq', 'taxon_name:"Abramis+brama"'],
    ['fq', '-event_id:*'],
    ['fq', 'genus:"Abramis"'],
    ['fq', 'order:"Cypriniformes"'],
    ['qc', '-_nest_parent_:*']
]).toString();

const requestOptions = ACCESS_TOKEN === undefined ? {} : { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }

// The default exported function is gonna be picked up by k6 as the entry point for the test script. It will be executed repeatedly in "iterations" for the whole duration of the test.
export default function () {
  http.batch([
    ['GET', `${searchUrl}?${allBunnies}`, null, requestOptions],
    ['GET', `${searchUrl}?${allDimiFullText}`, null, requestOptions],
    ['GET', `${searchUrl}?${multipleConditions}`, null, requestOptions],
    ['GET', `${searchUrl}?${multipleFilterQueries}`, null, requestOptions],
  ])
}


function getAccessToken() {
  const response = http.post(`${BASE_URL}/biocache-service/auth/token`, {
    username: 'admin',
    password: 'admin',
  });
  if (response.status !== 200) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }
  return response.json().access_token;
}

export function handleSummary(data) {
  return {
    [`/output/reports/test.html`]: htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}