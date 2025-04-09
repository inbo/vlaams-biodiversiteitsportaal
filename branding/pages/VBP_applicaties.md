---
title: Applicaties
_options:
  layout: public/pagesLayout.html
---

  <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #b02586;
        margin: 0;
    }
    header {
        background-color: #b02586;
        padding: 20px;
        text-align: center;
    }
    header h1 {
        color: white;
    }
    
    header h2 {
        color: #b02586;
    }
    main {
        padding: 20px;
        margin-bottom: 80px;
    }
    main h2 {
        color: #b02586;
    }
    footer {
        background-color: #003b5c;
        padding: 10px;
        color: white;
        text-align: center;
        position: fixed;
        bottom: 0;
        width: 100%;
        margin-top: 20px;
    }
    .container {
        display: grid;
        grid-template-columns: repeat(4, 1fr); /* Ensure 4 tiles per row */
        gap: 20px;
        justify-items: center;
        max-width: 100%; /* Make sure it uses the full width available */
        margin: 0 auto; /* Center the container */
    }
    .tile {
        background-color: #ffffff;
        border: 1px solid #b02586;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .tile:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .tile h3 {
        color: #b02586;
    }
    .tile a {
        text-decoration: none;
        color: #003b5c;
        font-weight: bold;
        margin-top: 10px;
        display: inline-block;
    }
    .tile p {
        font-size: 0.9em;
        color: #666;
    }
    .tile img {
    width: 130px;
    height: 130px;
    object-fit: contain; /* Zorgt ervoor dat de afbeelding niet vervormt */
    border-radius: 8px; /* Optioneel: afgeronde hoeken */
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
   </style>
   <div class="watermerk">DRAFT</div> 
<header>
        <h1>INBO Applicaties</h1>
    </header>
    <main>
        <h2>Ontdek de INBO-applicaties</h2>
        <p>Bekijk hier meer applicaties voor biodiversiteit en natuurbeheer die door INBO worden aangeboden. In functie van kwaliteitsvolle opslag, beheer en ontsluiting van gegevens beheert en/of ondersteunt het INBO verschillende databanken, datasystemen en interactieve toepassingen. Hieronder een overzicht van de belangrijke systemen. <br>Het INBO hanteert een opendatabeleid en een openaccess-beleid voor het ontsluiten van onderzoeksresultaten. Gegevens uit deze datasystemen worden per dataset ontsloten, een overzicht per thema is hier te vinden. Vindt u niet wat u zocht, dan kan u contact opnemen om uw datavraag door te geven.</p>
        <div class="container">
            <div class="tile"></div>
            <div class="tile"></div>
            <div class="tile"></div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1181/anb_agouti.png" alt="Placeholder agouti">
                <h3>AGOUTI</h3>
                <p>Platform voor het beheren van projecten met cameravallen.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/agouti/">Meer informatie</a><br>
                <a href="https://www.agouti.eu/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1071/vis.png" alt="Placeholder VIS">
                <h3>VIS 2</h3>
                <p>Databank en invoersysteem voor data en informatie over vissen in Vlaanderen.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/vis-informatiesysteem/">Meer informatie</a><br>
                <a href="https://vis2.inbo.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1072/vogel.png" alt="Placeholder Broedvogelmonitoring">
                <h3>Algemene Broedvogelmonitoring (ABV)</h3>
                <p>Monitoring van algemene broedvogels in Vlaanderen.</p>
                <a href="https://www.meetnetten.be/">Meer informatie</a><br>
                <a href="https://www.meetnetten.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1198/anb_vlinder.png" alt="Placeholder vlindermonitoring">
                <h3>Algemene Dagvlindermonitoring</h3>
                <p>Monitoring van dagvlinders in Vlaanderen.</p>
                <a href="https://www.meetnetten.be/">Meer informatie</a><br>
                <a href="https://www.meetnetten.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1183/anb_boboplus.png" alt="Placeholder bobo">
                <h3>BOBO+</h3>
                <p>BOdemgeschiktheid van BOmen en struiken in Vlaanderen.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/boboplus/">Meer informatie</a><br>
                <a href="https://bobo.inbo.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1067/groenesleutel.png" alt="Placeholder ecosysteemdiensten">
                <h3>Ecosysteemdiensten Vlaanderen</h3>
                <p>Geoloket met kaarten van vraag, aanbod en waardering van 16 ecosysteemdiensten.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/ecosysteemdiensten-vlaanderen/">Meer informatie</a><br>
                <a href="https://geo.inbo.be/ecosysteemdiensten/index.html">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1028/botanisch_beheer.png" alt="Placeholder florabank">
                <h3>Florabank</h3>
                <p>Databank met verspreidingsgegevens van wilde planten in Vlaanderen.</p>
                <a href="https://flora.inbo.be/">Meer informatie</a><br>
                <a href="https://flora.inbo.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1064/bioveiligheid.png" alt="Placeholder ecotoopkwetsbaarheid">
                <h3>Geoloket Ecotoopkwetsbaarheid</h3>
                <p>Geoloket met ecotoopkwetsbaarheidskaarten van Vlaanderen.</p>
                <a href="https://geo.inbo.be/ecotoopkwetsbaarheid/index.html">Meer informatie</a><br>
                <a href="https://geo.inbo.be/ecotoopkwetsbaarheid/index.html">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1190/anb_grofwild.png" alt="Placeholder grofwild">
                <h3>Grofwild</h3>
                <p>Webapplicatie voor het consulteren van gegevens over afschot van grofwild en wildschade.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/grofwild/">Meer informatie</a><br>
                <a href="https://faunabeheer.inbo.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1027/bio-energie.png" alt="Placeholder inboveg">
                <h3>INBOVEG</h3>
                <p>Systeem voor invoer en beheer van vegetatie-opnames in de Vlaamse Vegetatiedatabank.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/inboveg/">Meer informatie</a><br>
                <a href="https://inboveg.inbo.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1194/anb_verrekijker.png" alt="Placeholder meetnetten">
                <h3>Meetnetten.be</h3>
                <p>Invoersysteem voor gegevens over prioritaire plant- en diersoorten.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/meetnettenbe/">Meer informatie</a><br>
                <a href="https://meetnetten.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1192/anb_overwinterende-watervogels.png" alt="Placeholder watervogelmonitoring">
                <h3>Overwinterende Watervogels in Vlaanderen</h3>
                <p>Invoersysteem voor gegevens van watervogeltellingen.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/overwinterende-watervogels-in-vlaanderen/">Meer informatie</a><br>
                <a href="https://watervogels.inbo.be/info">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1197/anb_vespa-watch.png" alt="Placeholder vespawatch">
                <h3>Vespa-Watch</h3>
                <p>Help de invasie van de Aziatische hoornaar in kaart brengen.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/vespa-watch/">Meer informatie</a><br>
                <a href="https://vespawatch.be/">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1071/vis.png" alt="Placeholder VIS">
                <h3>Vis Informatie Systeem</h3>
                <p>Databank en invoersysteem voor data en informatie over vissen in Vlaanderen.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/vis-informatiesysteem/">Meer informatie</a><br>
                <a href="https://vis.inbo.be/Pages/Common/Default.aspx">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1074/windenergie.png" alt="Placeholder risicoatlas">
                <h3>Vlaamse Risicoatlas Vogels / Vleermuizen - Windturbines</h3>
                <p>Geoloket met kaarten van de Vlaamse Risicoatlas vogels/vleermuizen - windturbines.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/de-vlaamse-risicoatlas-vogelsvleermuizen-windturbines/">Meer informatie</a><br>
                <a href="https://geo.inbo.be/windturbines/index.html">Applicatie</a>
            </div>
            <div class="tile">
                <img src="https://www.vlaanderen.be/inbo/media/1068/hergebruik-water.png" alt="Placeholder watina">
                <h3>WATINA</h3>
                <p>Systeem voor de invoer in en consultatie van de “WATer In NAtuur” databank.</p>
                <a href="https://www.vlaanderen.be/inbo/datasets/watina/">Meer informatie</a><br>
                <a href="https://watina.inbo.be/">Applicatie</a>
            </div>
            <div class="tile"></div>
            <div class="tile"></div>
            <div class="tile"></div>
            <div class="tile"></div>
        </div>
    </main>
</html>
