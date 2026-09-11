# Fiori scomposti

Un solo Fiore in pagina: la passiflora, mostrata attraverso le sue Parti.

## Language

**Fiore**:
La passiflora, unico soggetto del sito. In pagina il Titolo è «Passiflora»; sotto va il Nome scientifico.
_Avoid_: studio, illustrazione, asset, SVG

**Nome scientifico**:
*Passiflora caerulea*, sottotitolo sotto «Passiflora».
_Avoid_: latino, specie (da soli)

**Parte**:
Una delle quattro regioni anatomiche del Fiore: tepali, corona, stami, pistillo.
_Avoid_: oggetto, pezzo, organo

**Stami**:
La Parte dell’androceo. Nel file SVG l’id resta `strami`; nel modello e in interfaccia il nome è Stami.
_Avoid_: strami, stamen, antere (come nome della Parte intera)

**Nome**:
Il titolo di una Parte attiva: Tepali, Corona, Stami, Pistillo.
_Avoid_: scheda, tooltip

**Descrizione**:
Una frase breve sotto il Nome, che dice a cosa serve quella Parte.
_Avoid_: saggio, scheda lunga, didascalia tecnica

**Invito**:
Il messaggio a riposo sopra il canvas, quando nessuna Parte è in evidenza. Il testo è «sFIORami».
_Avoid_: intro, help, «Passa sulle parti»

**ASCII**:
La resa in caratteri del Fiore, a riposo e sulle Parti non attive.
_Avoid_: filtro, shader, testo (come nome del rendering)

**Immagine**:
La resa fotografica di una Parte, visibile solo quando quella Parte è attiva.
_Avoid_: SVG, PNG, raster (come nome del concetto)

**Parte attiva**:
L’unica Parte in evidenza: si vede la sua Immagine con bordo ASCII sfumato, le altre restano ASCII, e in alto compaiono Nome + Descrizione al posto dell’Invito. Hover e fissaggio sono lo stesso stato visivo; il tap su un’altra Parte sposta il fissaggio.
_Avoid_: hover state, selezione, focus (come nome del concetto)

**Vuoto**:
Ogni punto che non colpisce una Parte. Un tap sul Vuoto toglie la Parte attiva e fa tornare l’Invito.
_Avoid_: background, canvas, margine
