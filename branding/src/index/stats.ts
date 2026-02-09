// FIXME import { locale } from "./i18n_init";
import { CountUp } from "countup.js";

async function setCounter(id: string, val: number): Promise<void> {
  const options = {
    separator: ",", // FIXME  locale === 'en' ? ',': '.',
    duration: 1,
    startVal: Math.round(val - (val * 4) / 100),
  };

  const countUp = new CountUp(id, val, options);
  if (!countUp.error) {
    return new Promise((resolve) => {
      countUp.start(() => {
        $(`#${id}`).addClass("loaded_stats");
        resolve();
      });
    });
  } else {
    console.error(countUp.error);
  }
}

async function loadStats(): Promise<void> {
  fetch(`/collectory/ws/dataResource/count`).then(async (response) => {
    const dataResourceCountJson = await response.json();
    setCounter("stats_datasets", dataResourceCountJson.total || 0);
  });

  fetch(`/species-list/ws/speciesList?max=0`).then(async (response) => {
    const listCountJson = await response.json();
    setCounter("stats_lists", listCountJson.listCount || 0);
  });

  fetch(
    `/biocache-service/occurrence/facets?q=*%3A*&fq=cl102%3A%22Vlaams%20Gewest%22&facets=species&pageSize=0&flimit=0`,
  ).then(async (response) => {
    const speciesCountJson = await response.json();
    setCounter("stats_species", speciesCountJson[0]?.count || 0);
  });
  fetch(
    `/biocache-service/occurrences/search?q=*%3A*&fq=cl102%3A%22Vlaams%20Gewest%22&pageSize=0`,
  ).then(async (response) => {
    const occurrenceCountJson = await response.json();
    setCounter("stats_occurrences", occurrenceCountJson.totalRecords || 0);
  });
}

$(() => {
  loadStats();
});
