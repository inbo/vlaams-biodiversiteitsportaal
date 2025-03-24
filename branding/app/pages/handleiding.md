---
title: Handleiding
_options:
  layout: public/pagesLayout.html
---


<html lang="nl">

  <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handleiding - Vlaams Biodiversiteitsportaal</title>
    <style>
        header {
            background-color: #b02586;
            padding: 20px;
            text-align: center;
        }
        header h1 {
            color: white;
        }
        h2, h3 {
            color: #b02586;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        a {
            color: #2980b9;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .logo {
            width: 150px;
            margin: 10px 0;
        }
        .natuurfoto-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
        }
        .natuurfoto {
            width: 100%;
            max-width: 600px; /* Past zich aan de paginabreedte aan */
            height: auto;
            border-radius: 10px;
        }
        .infofoto-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        }
        .infofoto {
        max-width: none; /* Behoudt originele breedte */
        height: auto; /* Houdt de originele hoogte */
        border-radius: 10px;
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
        <h1>Beknopte Handleiding voor het Vlaams Biodiversiteitsportaal</h1>
    </header>
  <h2>1. Toegang tot het Portaal</h2>
    <p><strong>URL:</strong> <a href="#">Vlaams Biodiversiteitsportaal</a> </p>
    <p><strong>Inloggen / Registreren:</strong></p>
    <ul>
        <li>Registreren: Mail naar <a href="mailto:support.natuurdata@inbo.be">support.natuurdata@inbo.be</a>.</li>
        <li>Inloggen: Klik op "Inloggen" rechtsboven op de startpagina.</li>
    </ul>
    <div class="infofoto-container">
        <img src="/images/Afbeelding1.png" class="infofoto" alt="Inlogscherm">
        <img src="/images/Afbeelding2.png" class="infofoto" alt="Startpagina">
    </div>
    <h2>2. Navigatie</h2>
    <p>Het portaal is ingedeeld in verschillende secties:</p>
    <div class="natuurfoto-container">
        <img src="/images/Afbeelding3.png" class="natuurfoto" alt="Navigatiemenu">
    </div>
    <h2>3. Belangrijkste Modules</h2>
    <h3>Verzamelingen (Natuurhistorische collecties)</h3>
    <p>Bekijk en beheer collectie data. Toegang tot gedigitaliseerde collecties.</p>
    <h3>Waarnemingen</h3>
    <p>Doorzoek en analyseer waarnemingsdata van soorten.</p>
    <div class="natuurfoto-container">
        <img src="/images/Afbeelding4.png" class="natuurfoto" alt="Waarnemingen">
    </div>
    <h3>Soorten</h3>
    <p>Zoek informatie over specifieke soorten.</p>
    <div class="natuurfoto-container">
        <img src="/images/Afbeelding5.png" class="natuurfoto" alt="Soorten">
    </div>
    <h3>Geografisch Portaal</h3>
    <p>Visualiseer gegevens op interactieve kaarten.</p>
    <div class="natuurfoto-container">
        <img src="/images/Afbeelding8.png" class="natuurfoto" alt="Geografisch portaal">
    </div>
    <h3>Afbeeldingen</h3>
    <p>Bekijk afbeeldingen die gekoppeld zijn aan soorten.</p>
    <div class="natuurfoto-container">
        <img src="/images/Afbeelding10.png" class="natuurfoto" alt="Afbeeldingen">
    </div>
    <h2>4. Tips voor Gebruik</h2>
    <p>Gebruik de geavanceerde zoekfunctie en stel voorkeuren in.</p>
    <div class="natuurfoto-container">
        <img src="/images/Afbeelding13.png" class="natuurfoto" alt="Zoekfunctie">
        <img src="/images/Afbeelding14.png" class="natuurfoto" alt="Geografische analyse">
    </div>
    <p>We nodigen u uit om het portaal te verkennen en feedback te geven via de <a href="https://github.com/inbo/vlaams-biodiversiteitsportaal/issues">GitHub Issue Tracker</a>.</p>
    <p><strong>Vriendelijke groet,</strong><br>Het Vlaams Biodiversiteitsportaal Team</p>
</body>
</html>
