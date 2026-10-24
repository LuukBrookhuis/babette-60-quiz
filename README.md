# Babette 60 – live interactieve quiz

Een complete, Nederlandstalige ABBA-verjaardagsquiz met **26 vragen in 5 rondes**, gemaakt voor een quizmaster op de televisie en één telefoon per stel. Geen externe pakketten of database nodig.

## Zo werkt het

1. Open de quiz op de tv/laptop en klik **Ik ben de quizmaster**.
2. Er verschijnt een zescijferige quizcode.
3. Alle stellen openen dezelfde website op hun telefoon, kiezen **Wij spelen mee**, voeren de code en een teamnaam in.
4. Start de quiz. De stellen stemmen; de quizmaster sluit de stemming.
5. Babette noemt haar antwoord. De quizmaster klikt haar keuze aan. Iedereen ziet direct groen/rood, wie goed zat en de bijgewerkte score.
6. Na vraag 26 verschijnt de winnaar.

**Let op:** gebruik voor de quizmaster steeds dezelfde browser/tab. In de adresbalk staat na het aanmaken een geheime hostlink (`?host=...#...`). Bewaar deze eventueel, maar deel hem niet met spelers.

## Lokaal testen

Installeer Node.js 18 of nieuwer. Open een terminal in deze map en voer uit:

```sh
npm start
```

Open http://localhost:3000 op de computer. Voor telefoons op hetzelfde wifi-netwerk: gebruik het lokale IP-adres van de computer, bijvoorbeeld `http://192.168.1.10:3000`. De firewall moet inkomende verbindingen op poort 3000 toelaten.

## Online zetten

Publiceer de map als een **Node-webservice** op een hostingplatform (bijvoorbeeld Render of Railway):

- Build command: geen (of `npm install`)
- Start command: `npm start`
- Node-versie: 18+
- De server leest automatisch de `PORT`-omgevingsvariabele.

Gebruik één serverinstantie. Quizgegevens worden **alleen in het geheugen** bewaard: bij herstart/slapen van de hosting verdwijnen lopende quiz en scores. Gebruik voor de feestavond bij voorkeur hosting zonder automatische slaapstand en test met twee telefoons vóór het feest. Gratis hosting kan limieten of een slapende server hebben.

## Beperkingen

- Voor **live verbinding tussen telefoons en tv** moet iedereen de **zelfde draaiende server** bereiken. Een losse HTML-file openen zonder server werkt niet.
- Een pagina op statische hosting (zoals GitHub Pages of Netlify Static) is niet voldoende; er is een Node-server nodig.
- De server is bedoeld voor een privéfeest, niet voor grootschalig publiek gebruik. De quizcode en geheime quizmasterlink zijn de toegangsbeveiliging.
- Je kunt per vraag vóór het onthullen je stem wijzigen. Na de onthulling wordt er precies eenmaal gescoord.
