# ASCII con textmode.js sopra Paper.js

A riposo il Fiore è ASCII; la Parte attiva torna Immagine, le altre restano ASCII in trasparenza. **textmode.js** 0.18 campiona un canvas esistente, è indipendente dal framework, e gira in WebGL2 senza Three.js o p5.

**Considered Options**: filtro ASCII di Three.js/`postprocessing` (troppa scena 3D); p5.asciify (non più mantenuto, richiede p5); conversione `getImageData` a mano; textmode.js.

**Consequences**: serve un canvas sorgente con tutte le Parti visibili da campionare, distinto dal canvas Paper.js di display; Nome e Invito restano HTML.
