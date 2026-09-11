# Paper.js su canvas, non SVG nel DOM

Il Fiore arriva da Illustrator come SVG di PNG ritagliate. L’interazione (Parte attiva, fade, Nome) basterebbe il DOM, ma il rendering deve finire su canvas perché in un passo successivo ci va un filtro ASCII sull’immagine. Paper.js è il ponte: import dell’SVG, item per Parte, poi pixel del canvas.

**Considered Options**: SVG nel DOM (hit-test naturale sulle clip, niente Paper.js); canvas 2D a mano; Paper.js.

**Consequences**: hit-test e clipPath non sono automatici come nel DOM; Nome e Invito non possono vivere sul canvas se il filtro ASCII deve colpire solo il Fiore.
