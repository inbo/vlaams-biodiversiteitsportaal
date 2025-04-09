// FIXME import { locale } from "./i18n_init";
import { CountUp } from "countup.js";

async function setCounter(id: string, val: number): Promise<void> {
  const options = {
    separator: ",", // FIXME  locale === 'en' ? ',': '.',
    duration: 1,
    startVal: Math.round(val - val * 4 / 100),
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
  const dataResourceCount = await fetch(`/collectory/ws/dataResource/count`);
  const dataResourceCountJson = await dataResourceCount.json();
  setCounter("stats_datasets", dataResourceCountJson.total || 0);

  const institutionCount = await fetch(`/collectory/ws/institution/count`);
  const institutionCountJson = await institutionCount.json();
  setCounter("stats_institutions", institutionCountJson.total || 0);

  const speciesCount = await fetch(
    `/biocache-service/occurrence/facets?q=*:*&facets=species&pageSize=0`,
  );
  const speciesCountJson = await speciesCount.json();
  setCounter("stats_species", speciesCountJson[0]?.count || 0);

  const occurrenceCount = await fetch(
    `/biocache-service/occurrences/search?q=*:*&pageSize=0`,
  );

  const occurrenceCountJson = await occurrenceCount.json();
  setCounter("stats_occurrences", occurrenceCountJson.totalRecords || 0);
}

$(() => {
  loadStats();
});
