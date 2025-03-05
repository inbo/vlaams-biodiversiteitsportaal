<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vlaams Biodiversiteitsportaal - Over, Data en Partners</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }
        .container {
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2, h3 {
            color: #b02586;
        }
        .logos {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .logos img {
            max-width: 150px;
            margin: 10px;
        }
        .natuurfoto-container {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 20px 0;
        }
        .natuurfoto {
            width: 20%; /* Groter formaat zodat ze mooi naast elkaar staan */
            border-radius: 30px;
        }
        .partners a {
            display: block;
            margin: 10px 0;
            color: #d1006c;
            text-decoration: none;
        }
        .watermerk {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 100px;
            color: rgba(150, 150, 150, 0.5);
            font-weight: bold;
            z-index: 1000;
            white-space: nowrap;
        }
        .iframe-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            width: 100%;
        }
        iframe {
            width: 80%;
            height: 600px;
            border: none;
        }
    </style>
    <div class="watermerk">DRAFT</div> 
</head>
<body>
    <div class="container">
        <h2>Over</h2>
        <h2>Het Vlaams Biodiversiteitsportaal is de centrale biodiversiteitsdatabank van Vlaanderen.</h2>
        <p>Het Vlaams Biodiversiteitsportaal fungeert als de centrale hub voor open biodiversiteitsdata in Vlaanderen.
Het verzamelt en integreert betrouwbare data uit uiteenlopende bronnen – van wetenschappelijke instellingen tot burgerwetenschappers – en maakt deze vrij toegankelijk via een gebruiksvriendelijk platform.<br> Cruciaal hierbij is dat de data voldoen aan de Darwin Core-standaard, een internationaal erkend framework voor het uitwisselen van biodiversiteitsinformatie. Dankzij deze standaard zijn gegevens zoals soortnamen, locaties en tijdsstippen gestandaardiseerd, waardoor datasets naadloos gecombineerd en vergeleken kunnen worden.<br> Het portaal werd niet enkel gelanceerd om een overzicht te bieden van de Vlaamse biodiversiteit, maar ook om transparantie en herbruikbaarheid van data te garanderen. Of het nu gaat om historische museumcollecties, recente veldstudies, of foto’s uit citizen science-projecten: alle informatie wordt omgezet naar hetzelfde formaat.</p>

 <div class="natuurfoto-container">
        <img src="https://inaturalist-open-data.s3.amazonaws.com/photos/431119134/medium.jpeg" alt="Aeshna mixta" class="natuurfoto">
        <img src="https://inaturalist-open-data.s3.amazonaws.com/photos/285252232/medium.jpg" alt="Xylocopa violacea" class="natuurfoto">
        <img src="https://inaturalist-open-data.s3.amazonaws.com/photos/244910202/medium.jpg" alt="Ardea cinerea" class="natuurfoto">
        <img src="https://inaturalist-open-data.s3.amazonaws.com/photos/219432858/medium.jpg" alt="Drosera intermedia" class="natuurfoto">
    </div>
        
  <h2>Data</h2>
        <p>Het Vlaams Biodiversiteitsportaal verzamelt data van:</p>
        <ul>
            <li>Natuurhistorische collecties</li>
            <li>Overheidsdiensten</li>
            <li>Onderzoekers</li>
            <li>Individuele burgers (via platformen zoals INaturalist en Waarnemingen.be)</li>
         </ul>
        <p>Het grootste deel van deze data bestaat uit soortwaarnemingen – bewijzen van een plant of dier op een specifieke plaats en tijd. Het portaal bevat ook referentiedata voor analyse en visualisatie.</p>
        
  <h3>Zoeken in het Vlaams Biodiversiteitsportaal</h3>
        <p>Je kan zoeken op:</p>
        <ul>
            <li>Soortnaam</li>
            <li>Dataset</li>
            <li>Locatie (bijv. een gemeente of natuurgebied)</li>
            <li>Beschermingsstatus</li>
            <li>Organisatie</li>
        </ul>
        <p>Filter je zoekresultaten om enkel de gewenste data te zien, en download vervolgens eenvoudig je records mét bronvermelding en licentie-informatie.</p>
        
  <h3>Kaarttools</h3>
        <p>Met de kaarttools ontdek je relaties tussen soorten, locaties en hun omgeving, zoals de verspreiding van bedreigde soorten in Vlaanderen.</p>
        
  <h3>Data delen</h3>
        <p>Er zijn veel manieren om data met het portaal te delen:</p>
        <ul>
            <li>Automatische datatransfers (via GBIF)</li>
            <li>Individuele waarnemingen doorgeven via apps zoals iNaturalist of Pl@ntnet</li>
            <li>Aanleveren van datasets (vnl door onderzoekers)</li>
        </ul>
        <p>Alle data worden gestandaardiseerd met gemeenschappelijke termen, waardoor ze als één dataset doorzocht en tussen platformen gedeeld kunnen worden. De data zijn wereldwijd toegankelijk via het Global Biodiversity Information Facility (GBIF).</p>
        
  <h3>Wie gebruikt het Vlaams Biodiversiteitsportaal?</h3>
        <ul>
            <li><strong>Onderzoekers:</strong> Voor samenwerking en innovatief onderzoek naar Vlaamse ecosystemen.</li>
            <li><strong>Overheden en terreinbeheerders:</strong> Voor beleidsondersteuning en oplossingen voor milieu-uitdagingen, zoals stikstofdepositie of habitatverlies.</li>
            <li><strong>Scholen en burgers:</strong> Om bij te dragen aan citizen science-projecten en het behoud van Vlaamse natuur.</li>
        </ul>
        
  <h3>Ondersteuning</h3>
        <p>Het portaal wordt gefinancierd door de Vlaamse overheid en wordt technisch beheerd door INBO (Instituut voor Natuur- en Bosonderzoek).</p>
        
  <h3>Waarom dit portaal?</h3>
        <p>Net zoals de Australische Atlas of Living Australia biodiversiteitsdata centraliseert, doet het Vlaams Biodiversiteitsportaal dit voor Vlaanderen. Het is een onmisbare tool voor het beschermen van onze lokale natuur!</p>
        
  <h3>Meer weten of meedoen?</h3>
        <p>Bezoek het Vlaams Biodiversiteitsportaal voor actuele data, handleidingen en manieren om zelf waarnemingen in te voeren.</p>
        
  <h2>Partners</h2>
        
  <h3>Living Atlas Community</h3>
        <div class="logos">
            <img src="https://www.ala.org.au/app/uploads/2020/06/ALA_Logo_StackedTagline_RGB-768x336.png" alt="Atlas of Living Australia (ALA) logo">
            <img src="https://www.biodiversity.be/5127/download" alt="GBIF logo">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt_KbGGLyO14N_JNp_LtzMi0dbbDzRH4JvKw&s" alt="TDWG logo">
        </div>
        
  <h3>Departement Omgeving</h3>
        <div class="logos">
            <img src="https://www.vlaanderen.be/inbo/images/INBO-logo.svg" alt="INBO logo">
            <img src="https://www.ikzoekfsc.be/wp-content/uploads/2016/08/ANB-logo.jpg" alt="ANB logo">
            <img src="https://curieuzeneuzen.be/wp-content/uploads/2020/12/logo-vmm.png" alt="VMM logo">
            <img src="https://www.vlm.be/nl/Style%20Library/VLM%20Styles/Images/vlaanderen_openruimte.png" alt="VLM logo">
        </div>
    </div>
</body>
<P ALIGN="center">Het Vlaams Biodiversiteitsportaal maakt deel uit van de Living Atlas Community</p>
<div class="iframe-container">
        <iframe src="https://living-atlases.gbif.org/"></iframe>
    </div>

</html>
