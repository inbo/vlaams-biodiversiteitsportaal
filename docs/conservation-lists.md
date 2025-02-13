Nog te doen voor de conservation statussen:

# 1. De conservation-lists.json aanvullen.

config/bie-index/conservation-lists.json

Hierin komen alle soortenlijsten die conservation status bevatten.

Uitleg van de syntax

```json lines
{
  "defaultSourceField": "status",
  "lists": [
    {
      "uid": "drt1738675870749",
      "field": "threatStatus_s",
      "sourceField": "threatStatus",
      "term": "threatStatus",
      "label": "VLINDERS_TEST_LIJST"
    }
  ]
}
```

* "defaultSourceField": field in soortenlijst die voor de conservation status staat (zoals bvb nu in Vlinders lijst)
* "uid": te halen uit https://natuurdata.dev.inbo.be/species-list/ws/speciesList > lijst in kwestie > 'dataResourceUid' attribute
* "field": attribute in Solr
* "sourceField: field in soortenlijst die voor de conservation status staat (zoals bvb 'threatStatus' nu in Vlinders lijst)
* "term": ik zou zeggen gelijk aan 'sourceField' zetten, wordt nu niet gebruikt
* "label": de text die op de IUCN bol zal verschijnen. De bol is vrij klein, dus kort en krachtig label is aangeraden (oogt anders lelijk).

# 2. Wat als een soort bij meerdere conservation lijsten hoort en daarin verschillende conservation statussen heeft?

Zie als voorbeeld: https://bie.ala.org.au/species/https://biodiversity.org.au/afd/taxa/4cb195fd-b127-44cb-ad85-a62d224e9a96

Diezelfde dier is 'Endangered' of 'Critically Endangered' afhankelijk van de regio.

Voorbeeld uit VBP

Stel dat soort 'Leptidea sinapis' heeft status 'Least Concern' in RodeLijsVlaanderen en status 'Near Threatened' in _SpecialeVlindersLijstVlaanderen_

Dan moeten wij onderscheid maken door verschillende 'field' te gebruiken; dan kunnen meerdere CS in een Solr record naast elkaar bewaard worden.

Dwz in de conservation-lists.json zo de conservation lijsts definieeëren

```json lines
{
  "defaultSourceField": "status",
  "lists": [
    {
      "uid": "drt1738675870749",
      "field": "threatStatus_RedList_s",
      "sourceField": "threatStatus",
      "term": "threatStatus",
      "label": "RODE_LIJST"
    },
    {
      "uid": "drt123123123123",
      "field": "threatStatus_SpecialeVlindersLijst_s",
      "sourceField": "threatStatus",
      "term": "threatStatus",
      "label": "SPECIALE_VLINDERS_LIJST"
    }
  ]
}
```

# 3. De look van IUCN bollen

De IUCN 'bol' heeft:

* achtergrond en font kleur
* label

Hoe worden ze momenteel bepaald?

### - achtergrond en font kleur:
  Berekend op basis van CS:
```groovy
  switch ( status ) {
  case ~/(?i)extinct/:
  colour = "extinct"
  break
  case ~/(?i).*extinct.*/:
  colour = "black"
  break
  case ~/(?i)critically\sendangered.*/:
  colour = "red"
  break
  case ~/(?i)endangered.*/:
  colour = "orange"
  break
  case ~/(?i)vulnerable.*/:
  colour = "yellow"
  break
  case ~/(?i)near\sthreatened.*/:
  colour = "near-threatened"
  break
  //case ~/(?i)least\sconcern.*/:
  default:
  colour = "green"
  break
  }
```

De 'colour' bepaalt CSS stijl, en CSS stijl bepaalt achtergrond en font kleuren. (ala-bie-hub/grails-app/assets/stylesheets/species.css)

!!! DWZ dat wij een custom mapping moeten voorzien voor non-IUCN statussen (anders is alles altijd prima groen)

### - label

De 'label' attribute van de conservation lijst die de conservation status heeft gecommit.

DWZ het liefst kort en krachtig label gebruiken die in de 40x40px circel past. Anders overvloeit de text en oogt het lelijk.

# 4. Best oude bie index dan weggooien en opnieuw bie-index opbouwen en dan pas de conservation lijsten opnieuw importeren.




