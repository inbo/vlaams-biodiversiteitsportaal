# VBP issue cleanup and priority plan

Based on issue titles, labels, ages, and (for the cleanup candidates) the first 500 characters of each body. Generated 2026-11-03. Nothing has been changed on GitHub yet.

Base URL: <https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/>

---

# Part 1: Cleanup

## 1.1 Close as duplicate

- [x] Close [#941](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/941) as duplicate of [#887](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/887). First copy #941's examples (`recordCounts` in collectory, `excludeDataQualityCounts` in biocache-hub) into #887.
- [x] Close [#1021](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1021) as duplicate of [#1003](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1003) (species lists should not trigger or show up in pipelines).
- [ ] Close [#544](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/544) as duplicate of [#542](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/542) (same collectory location-update error, collections vs. organisations).
- [x] Fold [#434](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/434) (more map export options) into [#669](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/669) (spatial: export map) and close #434.

## 1.2 Close as not planned or resolved

- [x] [#141](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/141) Identification filters: empty stub ("We definitely need:" with nothing after it).
- [x] [#144](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/144) Publication filters: empty stub.
- [x] [#146](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/146) Assertions filters: empty stub.
- [x] [#142](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/142) occurrences filters: comment says "nothing for the moment".
- [x] [#147](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/147) Attribution filters: comment says "no action needed at the moment".
- [x] [#554](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/554) Raw scientific name search: comment says the option was removed as a workaround. Confirm it is gone from the UI first.

## 1.3 Retest or verify, then close if resolved

- [x] [#84](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/84) Institution coordinates error: comment says "cannot reproduce". Retest on current main.
- [ ] [#351](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/351) Sound does not play: "cannot replicate". Retest. Optionally open a separate enhancement for xeno-canto.
- [ ] [#1171](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1171) Image-service AWS keys: check whether it is already done in the repo/infra config.
- [x] [#86](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/86) "List my institutions" error: comment says "kinda fixed", needs cleanup and an upstream PR. Keep open if the PR has not been made.

## 1.4 Create an epic: occurrence search filters

- [ ] Create one epic issue "Occurrence search filters" with a checklist linking:
  - [x] [#143](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/143) Event filters (samplingProtocol)
  - [ ] [#145](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/145) Record filters (InstitutionCode, Collection, BasisOfRecord)
  - [ ] [#707](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/707) Location filters (DataGeneralizations, CoordinateUncertaintyInMeters)
  - [x] [#742](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/742) Search inside long filter lists
  - [x] [#838](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/838) Add location filter (stub, overlaps #707)

## 1.5 Fix titles and descriptions

- [ ] [#1234](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1234) Rename "Portal crash" to something like "Crash when viewing filtered shapefile occurrences in the spatial portal".
- [ ] [#1161](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1161) Rename to something like "Previous user is logged back in after logout (ACM/IDM)".
- [x] [#848](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/848) Rename to something like "Colour-by 'municipality' on all records overloads the portal".
- [ ] [#1270](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1270) Add detail (which services/indexes were stale, since when).
- [ ] [#1268](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1268) Add detail (which alerts, expected vs. actual).
- [x] [#1033](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1033) Body is empty. Add a scope or close it.

## 1.6 Cross-link only (related, not duplicates)

- [ ] [#673](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/673) and [#674](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/674): both GBIF sync with a Flanders WKT. #673 already has a chosen WKT in its comments, so it may only need implementing.
- [ ] [#668](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/668), [#669](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/669), [#665](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/665): spatial portal redesign, export and layer fields. Link under a spatial-portal tracking note.
- [ ] Kept open on purpose (real content or discussion): [#378](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/378), [#380](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/380), [#381](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/381), [#371](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/371), [#385](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/385), [#394](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/394), [#509](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/509), [#996](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/996), [#670](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/670), [#818](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/818), [#843](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/843).

## 1.7 Labels

Existing label names are not all confirmed; check `gh label list` before creating new ones.

- [ ] Add `duplicate` to [#941](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/941), [#1021](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1021), [#544](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/544), [#434](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/434) (before closing).
- [ ] Add `bug` to [#1234](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1234) (already has it), [#848](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/848), [#1270](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1270), [#1268](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1268), [#542](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/542), [#665](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/665), [#669](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/669).
- [ ] Add `security` (new label) to [#1002](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1002), [#1171](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1171), [#745](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/745), [#1161](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1161).
- [ ] Add `pipelines` to [#941](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/941)/[#887](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/887), [#1003](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1003), [#1057](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1057), [#1068](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1068), [#927](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/927), [#926](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/926), [#924](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/924).
- [ ] Add `spatial` to [#804](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/804), [#1234](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1234).
- [ ] Add `translation` to [#784](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/784), [#569](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/569).
- [ ] Add `mobile` to [#677](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/677) (already labelled), check [#35](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/35) and [#882](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/882).
- [ ] Add `Repatriate` to [#926](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/926), [#924](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/924).
- [ ] Normalise `uat_feedback` into `user-feedback` ([#335](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/335), [#334](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/334)) and `suggestion` into `enhancement` ([#398](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/398), [#392](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/392), [#385](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/385), [#383](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/383)).
- [ ] Create priority labels `P0`, `P1`, `P2`, `P3` and apply them per Part 2.
- [ ] Mark good-first-issue candidates: [#1158](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1158) (already), [#1223](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1223), [#394](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/394), [#844](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/844).

---

# Part 2: Priorities

Assigned issues are marked with the assignee in parentheses.

## P0: Production stability and security (do first)

Alerts and freshness:

- [ ] [#1270](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1270) Bie-index not updating automatically anymore
- [ ] [#1268](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1268) Not all alerts are working

Crashes and timeouts:

- [ ] [#1234](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1234) Portal crash (StefanVanDyck)
- [x] [#848](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/848) Crash or overload on colour-by
- [x] [#831](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/831) Request taking too long, cancelled (StefanVanDyck)
- [x] [#868](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/868) Timed out waiting on access token (StefanVanDyck)

Security and hardening (one sprint):

- [x] [#1002](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1002) Add authentication to SOLR
- [ ] [#1171](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1171) Replace image-service AWS keys with ECS credentials
- [x] [#745](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/745) ReadOnlyRoot on ECS containers (StefanVanDyck)
- [ ] [#1161](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1161) Previous user logged back in after logout (StefanVanDyck)
- [x] [#893](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/893) Limit SOLR query complexity
- [ ] [#900](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/900) Validate auto-scaling policy
- [ ] [#899](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/899) Make keyspace connection more resilient

## P1: Pipeline and data correctness

Caches and pipeline noise (one sprint):

- [ ] [#887](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/887) Clear service caches after successful pipeline
- [ ] [#1003](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1003) Ignore user species lists in pipelines
- [-] [#1057](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1057) Allow running a pipeline while one is in progress
- [ ] [#1068](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1068) Incremental loading of updated data resource (katya-shaleninova)
- [ ] [#41](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/41) Schedule automatic processing on changes (StefanVanDyck)
- [ ] [#927](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/927) Remove indexed data after a data resource is removed

Repatriate / GBIF sync:

- [ ] [#926](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/926) Repatriate does not match existing data resource
- [ ] [#924](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/924) "To be confirmed" broken after repatriate/reprocess
- [ ] [#725](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/725) Removing datasets
- [ ] [#673](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/673), [#674](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/674) GBIF sync WKT improvements

Data correctness:

- [ ] [#671](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/671) CONTINENT_COORDINATE_MISMATCH flagged on all records (katya-shaleninova)
- [ ] [#894](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/894) Validate matchTaxonId
- [ ] [#1067](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1067) Count discrepancy between regions and explore-your-area
- [ ] [#1159](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1159) Ferns vs. clubmosses
- [ ] [#819](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/819) Unhelpful species in taxonomic backbone

## P2: Open bugs and user feedback

Auth and sessions:

- [ ] [#804](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/804) Access token expires in spatial portal
- [ ] [#764](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/764) Forced to log back in immediately after logout
- [ ] [#1061](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1061) "Accessing insecure page" warning

Downloads:

- [ ] [#1233](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1233) Custom download (StefanVanDyck)
- [ ] [#678](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/678) "Pas uw download aan"
- [ ] [#563](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/563) Custom download save preferences (katya-shaleninova)
- [ ] [#566](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/566) Custom download format missing translations (katya-shaleninova)
- [ ] [#958](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/958) Clean up downloads after a week

Occurrence search and graphs:

- [ ] [#976](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/976) Occurrence filters not paging
- [ ] [#1103](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1103) Error alert when opening graphs on a stale page
- [ ] [#1096](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1096) Colour by year does not work
- [ ] [#1095](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1095) Cannot select info text on large image
- [ ] [#1098](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1098) Year slider should allow a specific date (katya-shaleninova)

Species lists:

- [ ] [#642](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/642) Lists give different results in spatial portal and biocache
- [ ] [#909](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/909) Same list referenced multiple times on species page (katya-shaleninova)
- [ ] [#1053](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1053) Species lists all-occurrences query (katya-shaleninova)

Spatial:

- [ ] [#732](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/732), [#733](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/733) MaxEnt workflow and layers
- [ ] [#590](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/590) Proper MultiLineString fix
- [ ] [#379](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/379) Time series animation bug (katya-shaleninova)
- [ ] [#355](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/355) Areas not fully visualised
- [ ] [#665](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/665) Add a second field to a layer
- [ ] [#669](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/669) Export map

Collections / collectory:

- [ ] [#542](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/542) Location update error (organisations and collections)
- [ ] [#86](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/86) "List my institutions" error (upstream PR pending)
- [ ] [#423](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/423) bie-index task progress not shown in web UI
- [ ] [#902](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/902) Custom/translated errors for circuit breakers

## P3: Planned features

Species lists next generation:

- [ ] [#1168](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1168) Deploy next-gen species lists
- [ ] [#959](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/959) More admin control (katya-shaleninova)
- [ ] [#962](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/962) User permissions
- [ ] [#961](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/961) Source attribution on lists
- [ ] [#654](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/654) Spatial portal and species lists
- [ ] [#1247](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1247) Occurrences of selected species
- [ ] [#1259](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1259) Filter on regional red lists
- [ ] [#62](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/62), [#632](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/632) Link species lists to taxon lists, clustering

Duplicate detection and high-resolution data:

- [ ] [#1248](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1248) Activate duplicate detection (StefanVanDyck)
- [ ] [#1066](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1066) Easier high-resolution requests for government employees
- [ ] [#809](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/809) Override high-resolution restrictions
- [ ] [#736](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/736) Open/closed icon for high resolution
- [ ] [#507](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/507) Sensitive data PoC: user token and roles in all queries

Data quality:

- [ ] [#822](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/822) Data quality profiles
- [ ] [#839](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/839) ANB data quality profiles maintenance (DimEvil, katya-shaleninova)
- [ ] [#915](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/915) Fix data quality interface
- [ ] [#843](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/843) Data-quality indication on records page
- [ ] [#846](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/846) Dataset quality tag
- [ ] [#1158](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1158) Validation definition (docs)

## P4: UX and enhancement backlog

Quick wins:

- [ ] [#1099](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1099) Default to "open in new window"
- [ ] [#1223](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1223) Ecopedia tab missing whitespace
- [ ] [#968](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/968) Refresh-page option
- [ ] [#971](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/971) Flanders vs. the world buttons
- [ ] [#960](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/960) Link in observation details
- [ ] [#844](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/844) Extra email address in footer
- [ ] [#394](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/394) "Search on GBIF" button
- [ ] [#1006](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1006) Homepage pictures
- [ ] [#383](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/383) Homepage: state it is a consultation portal

Translations:

- [ ] [#784](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/784), [#485](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/485), [#569](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/569), [#660](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/660), [#730](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/730) (katya-shaleninova), [#643](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/643), [#285](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/285)

Mobile:

- [ ] [#35](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/35), [#677](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/677), [#882](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/882)

Species page and search:

- [ ] [#815](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/815), [#818](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/818), [#670](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/670), [#837](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/837) (katya-shaleninova), [#600](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/600) (katya-shaleninova), [#313](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/313) (StefanVanDyck), [#334](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/334)

Occurrence page and filters (epic from 1.4):

- [ ] [#838](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/838), [#555](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/555), [#330](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/330), [#335](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/335), [#397](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/397), [#392](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/392) (DimEvil), [#457](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/457) (DimEvil, katya-shaleninova), [#917](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/917)

## P5: Compliance, docs and long-term

Compliance (move up if there is a launch or audit deadline):

- [ ] [#120](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/120) Cookie policy and consent
- [ ] [#56](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/56) Legal check
- [ ] [#688](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/688) Make clear imported data becomes public
- [ ] [#682](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/682), [#700](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/700) Data generalizations and verified attributes

Documentation:

- [ ] [#734](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/734) Deployment procedures (StefanVanDyck)
- [ ] [#657](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/657), [#647](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/647), [#57](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/57), [#638](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/638), [#966](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/966), [#1033](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1033)

Operations backlog:

- [ ] [#304](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/304) Automatic data cleanup, [#473](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/473) Check ala/admin, [#95](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/95) Institution types list (DimEvil), [#398](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/398) Datasets page (DimEvil)

Research and wishlist:

- [ ] [#996](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/996) ALA lens (StefanVanDyck), [#1143](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1143) galah-python, [#1075](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1075) ArcGIS spatial data, [#816](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/816) iNaturalist, [#663](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/663) BHL, [#509](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/509) dashboards (DimEvil), [#385](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/385), [#384](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/384) DOI service
- [ ] Spatial and mapping ideas: [#284](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/284), [#847](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/847), [#749](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/749), [#668](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/668), [#646](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/646), [#649](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/649), [#672](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/672), [#571](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/571), [#388](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/388), [#378](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/378), [#380](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/380), [#381](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/381), [#371](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/371)
- [ ] Other: [#1033](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/1033), [#351](https://github.com/inbo/vlaams-biodiversiteitsportaal/issues/351)

---

## Suggested working order

1. [ ] Part 1.1 to 1.3 (cleanup, closing last), then 1.4 and 1.5.
2. [ ] Labels (1.7), including the priority labels.
3. [ ] P0 sprint: alerts and freshness first, then the security cluster.
4. [ ] P1 sprint: caches and pipelines, then repatriate.
5. [ ] P2 bugs, picking up the already-assigned ones first.
6. [ ] P3 features alongside the P4 quick wins.
