# Open issues: pipelines, data processing and repatriation

Overview of open issues in [inbo/vlaams-biodiversiteitsportaal](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues), generated 2026-11-05 from titles and labels only (issue bodies and closed issues not reviewed).

## Pipelines (label `pipelines`)

| Issue                                                                      | Title                                                                                    | Notes       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------- |
| [#41](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/41)     | Schedule automatic processing of a dataresource in case of changes                       | Enhancement |
| [#887](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/887)   | Clear service caches after successful pipeline                                           | Enhancement |
| [#927](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/927)   | Basic script to remove indexed data after a data resource is removed from the collectory | Enhancement |
| [#1068](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1068) | Incremental loading of updated data resource                                             | Enhancement |
| [#1248](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1248) | Activate Duplicate Detection in VBP                                                      | Enhancement |
| [#671](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/671)   | CONTINENT_COORDINATE_MISMATCH flagged for all records                                    | Bug         |

TODO: Create issue to trigger bie-index automatically to re-index record counts

## Repatriation and GBIF sync (labels `Repatriate`, `collections`)

| Issue                                                                    | Title                                                                           | Notes               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ------------------- |
| [#926](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/926) | GBIF repatriate does not match with existing data-resource                      | Bug                 |
| [#924](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/924) | "Nog te beoordelen -> to be confirmed" does not work after repatriate/reprocess | Bug                 |
| [#725](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/725) | Removing datasets                                                               | Enhancement         |
| [#674](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/674) | Improve data sync with GBIF: add or update external resources                   |                     |
| [#673](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/673) | Improve data sync with GBIF: repatriate gegevens                                |                     |
| [#700](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/700) | Investigate how to add generalization / verified attributes to datasets         | Label `collections` |
| [#966](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/966) | Metadata template/wiki for GBIF uploads, with the minimum fields INBO requires  |                     |

## Indexing, cleanup and data lifecycle

| Issue                                                                      | Title                                                             | Notes                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| [#1270](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1270) | Bie-index not updating automatically anymore                      | Likely live production problem     |
| [#423](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/423)   | Progress of bie-index tasks not showing in web UI                 |                                    |
| [#304](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/304)   | Automatically cleanup data                                        |                                    |
| [#958](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/958)   | Cleanup downloads after 1 week, check if we can use S3 and TTL    |                                    |
| [#1302](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1302) | Xeno-Canto no longer contains any sound                           |                                    |
| [#1303](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1303) | Audio assets should not show up in the Images tab of biocache-hub |                                    |
| [#1304](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1304) | Add species image to preferred image species list                 | Bug                                |
| [#1268](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1268) | Not all alerts are working                                        | Possibly pipeline/indexing related |

## Data quality and processing rules

| Issue                                                                      | Title                                                           | Notes                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------ |
| [#822](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/822)   | Data Quality Profiles                                           |                          |
| [#839](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/839)   | ANB data quality profiles maintenance                           |                          |
| [#846](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/846)   | Dataset Quality tag                                             |                          |
| [#843](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/843)   | Indicate data quality on the records page                       |                          |
| [#915](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/915)   | Fix data quality interface                                      |                          |
| [#647](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/647)   | Disclaimer on data quality on the portal                        |                          |
| [#682](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/682)   | Data generalizations                                            |                          |
| [#688](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/688)   | Make clear that imported data points will be publicly available |                          |
| [#335](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/335)   | DwC extensions: measurements or facts                           | Label `occurrences`      |
| [#1233](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1233) | Custom download is missing contextual layer properties          | Bug, label `occurrences` |

## Taxonomy backbone (touches processing and name matching)

| Issue                                                                      | Title                                                              | Notes |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----- |
| [#1159](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1159) | Varens vs. Bedektzadigen                                           |       |
| [#819](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/819)   | Useless species in the taxonomic backbone                          |       |
| [#837](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/837)   | Vernacular name in GBIF backbone but not shown on the species page |       |
| [#600](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/600)   | Vernacular names should all be lowercase                           |       |

## Related infrastructure (possibly relevant)

- **Data sources and integrations:** [#816](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/816) (Check iNaturalist), [#384](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/384) (INBO DOI service), [#394](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/394) (Search on GBIF), [#385](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/385) (Link with other biodiversity infrastructures)
- **Resilience and ops:** [#899](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/899) (Make keyspace connection more resilient), [#900](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/900) (Validate auto-scaling policy), [#734](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/734) (Document VBP deployment procedures), [#1171](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1171) (Replace image-service AWS keys)
- **Sensitive data:** [#507](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/507) (Sensitive Data PoC: user token and roles in front-end queries), [#809](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/809) (Override for username/password high-res restrictions)

## Suggested priorities

1. [#1270](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1270) and [#1268](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1268) (bie-index not updating, alerts not working) look like live production problems.
2. [#926](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/926) and [#924](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/924) are the two open repatriation bugs, and both involve reprocessing.
3. [#1068](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1068), [#41](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/41), [#887](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/887) and [#927](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/927) would make the pipeline run more automatically: incremental and scheduled processing, cache clearing, and removing deleted resources.
4. [#1248](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1248) (duplicate detection) is the largest pipeline feature on the list.

MALO Todo
-------------------------------------

- Look at automating detection of changes in upstream gbif dataresources:
  - Look at the different ways "reaptriating" works: there are multiple locations / menus / etc.
  - Check how Dimi does things now, and if we can use the same approach for other dataresources.
  - Try to cleanup the changes we made, ensure all repatriation works the same way, and document it.
  - automate it (daily / weekly Schedule)
  - Add a notification???

- Fix pipeline processing:
  - cleanup caches
  - Trigger bie-index processing automatically?
  - see if there is a way to reduce costs ? Incremental processing? (also if bie-index reprocessing is expensive)
