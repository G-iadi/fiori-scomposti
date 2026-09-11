(() => {
  const SVG_URL = "asset/passiflora/passiflora.svg";
  const VIEW_RATIO = 506.5 / 751.76;
  const INACTIVE_OPACITY = 1;
  const FEATHER_PX = 28;
  const FADE_MS = 420;
  const ASCII_CHAR_MS = 1000;
  const ASCII_CHAR_POOL =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%*+=";
  const ASCII_RAMP_LEN = 64;
  const PAPER_RGB = [243, 239, 228];
  const HIT_ORDER = ["pistillo", "strami", "corona", "tepali"];
  const DRAW_ORDER = ["tepali", "corona", "strami", "pistillo"];
  const NOMI = {
    tepali: "Tepali",
    corona: "Corona",
    strami: "Stami",
    pistillo: "Pistillo",
  };
  const DESCRIZIONI = {
    tepali: "Petali e sepali quasi uguali: l’involucro esterno del fiore.",
    corona: "Corona di filamenti colorati, tipica della passiflora.",
    strami: "Organi maschili: filamenti e antere che portano il polline.",
    pistillo: "Organo femminile: ovario, stilo e stigmi al centro del fiore.",
  };

  const canvas = document.getElementById("flower");
  const asciiCanvas = document.getElementById("ascii");
  const stage = document.getElementById("stage");
  const nomeEl = document.getElementById("nome");
  const nomeLabelEl = document.getElementById("nome-label");
  const nomeDescEl = document.getElementById("nome-desc");
  const invitoEl = document.getElementById("invito");
  const asciiSource = document.createElement("canvas");
  const maskCanvas = document.createElement("canvas");
  const softCanvas = document.createElement("canvas");

  paper.setup(canvas);
  paper.view.backgroundColor = new paper.Color(243 / 255, 239 / 255, 228 / 255);

  /** @type {Record<string, paper.Item>} */
  const parti = {};
  /** @type {Record<string, paper.PathItem>} */
  const clip = {};
  /** @type {paper.Item | null} */
  let fiore = null;
  /** @type {string | null} */
  let hovered = null;
  /** @type {string | null} */
  let fissata = null;
  /** @type {Record<string, number>} */
  const opacityNow = {};
  /** @type {Record<string, number>} */
  const opacityTarget = {};
  /** @type {number | null} */
  let fadeRaf = null;
  let fadeLast = 0;
  /** @type {string | null} */
  let holeApplied = null;
  let tm = null;
  let asciiTexture = null;
  /** @type {ReturnType<typeof setInterval> | null} */
  let asciiCharTimer = null;

  function randomCharRamp() {
    let ramp = " ";
    for (let i = 1; i < ASCII_RAMP_LEN; i++) {
      ramp += ASCII_CHAR_POOL[(Math.random() * ASCII_CHAR_POOL.length) | 0];
    }
    return ramp;
  }

  function walk(item, fn) {
    fn(item);
    if (!item.children) return;
    for (const child of item.children) walk(child, fn);
  }

  function findNamed(root, name) {
    let found = null;
    walk(root, (item) => {
      if (!found && item.name === name) found = item;
    });
    return found;
  }

  function findClipMask(item) {
    let mask = null;
    walk(item, (node) => {
      if (!mask && node.clipMask) mask = node;
    });
    return mask;
  }

  function attiva() {
    return fissata || hovered;
  }

  function setCursor(id) {
    canvas.style.cursor = id ? "pointer" : "default";
  }

  function viewSize() {
    const width = stage.clientWidth;
    const height = width * VIEW_RATIO;
    return { width, height };
  }

  function fitFiore() {
    if (!fiore) return;
    const { width, height } = viewSize();
    paper.view.viewSize = new paper.Size(width, height);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    fiore.matrix.reset();
    const bounds = fiore.bounds;
    if (bounds.width === 0 || bounds.height === 0) return;
    const scale = Math.min(paper.view.bounds.width / bounds.width, paper.view.bounds.height / bounds.height);
    fiore.scale(scale);
    fiore.position = paper.view.center;
  }

  function captureAsciiSource() {
    const { width, height } = viewSize();
    for (const id of DRAW_ORDER) {
      if (parti[id]) parti[id].opacity = 1;
    }
    paper.view.update();
    asciiSource.width = width;
    asciiSource.height = height;
    const ctx = asciiSource.getContext("2d");
    ctx.fillStyle = `rgb(${PAPER_RGB.join(",")})`;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(canvas, 0, 0, width, height);
    for (const id of HIT_ORDER) {
      if (parti[id]) parti[id].opacity = opacityNow[id] ?? 0;
    }
  }

  function configureTexture(texture) {
    texture
      .characters(randomCharRamp())
      .charColorMode("sampled")
      .cellColorMode("fixed")
      .cellColor(...PAPER_RGB);
  }

  function scrambleAsciiChars() {
    if (!asciiTexture) return;
    asciiTexture.characters(randomCharRamp());
  }

  function startAsciiCharScramble() {
    if (asciiCharTimer) return;
    asciiCharTimer = setInterval(scrambleAsciiChars, ASCII_CHAR_MS);
  }

  function sizeAsciiCanvas(width, height) {
    asciiCanvas.style.width = `${width}px`;
    asciiCanvas.style.height = `${height}px`;
    asciiCanvas.width = width;
    asciiCanvas.height = height;
  }

  function initTextmode() {
    const { width, height } = viewSize();
    sizeAsciiCanvas(width, height);

    if (tm) {
      if (typeof tm.resizeCanvas === "function") tm.resizeCanvas(width, height);
      asciiTexture = tm.createTexture(asciiSource);
      configureTexture(asciiTexture);
      return;
    }

    tm = textmode.create({
      canvas: asciiCanvas,
      width,
      height,
      fontSize: 11,
      fontSource:
        "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@5.1.0/latin-700-normal.woff",
      frameRate: 8,
    });
    sizeAsciiCanvas(width, height);
    if (typeof tm.resizeCanvas === "function") tm.resizeCanvas(width, height);

    tm.setup(() => {
      asciiTexture = tm.createTexture(asciiSource);
      configureTexture(asciiTexture);
      startAsciiCharScramble();
    });

    tm.draw(() => {
      tm.clear();
      tm.background(...PAPER_RGB, 0);
      if (!asciiTexture) return;
      if (tm.grid && tm.grid.cols) tm.image(asciiTexture, tm.grid.cols, tm.grid.rows);
      else tm.image(asciiTexture);
    });
  }

  function fillClipPath(ctx, item) {
    if (!item) return;
    if (item.pathData) {
      ctx.fill(new Path2D(item.pathData));
      return;
    }
    if (item.children) {
      for (const child of item.children) fillClipPath(ctx, child);
    }
  }

  function updateAsciiHole(activeId) {
    if (activeId === holeApplied) return;
    holeApplied = activeId;

    const { width, height } = viewSize();
    if (!activeId || !clip[activeId]) {
      asciiCanvas.style.maskImage = "none";
      asciiCanvas.style.webkitMaskImage = "none";
      asciiCanvas.style.opacity = "1";
      return;
    }

    maskCanvas.width = width;
    maskCanvas.height = height;
    const ctx = maskCanvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "destination-out";
    const item = clip[activeId];
    const g = item.globalMatrix;
    ctx.setTransform(g.a, g.b, g.c, g.d, g.tx, g.ty);
    fillClipPath(ctx, item);
    const url = `url(${maskCanvas.toDataURL()})`;
    asciiCanvas.style.maskImage = url;
    asciiCanvas.style.webkitMaskImage = url;
    asciiCanvas.style.opacity = String(INACTIVE_OPACITY);
  }

  function updateNome() {
    const id = attiva();
    if (!id) {
      nomeEl.hidden = true;
      invitoEl.classList.remove("is-hidden");
      return;
    }

    nomeEl.hidden = false;
    nomeLabelEl.textContent = NOMI[id];
    nomeDescEl.textContent = DESCRIZIONI[id] || "";
    invitoEl.classList.add("is-hidden");
  }

  function holeId() {
    const current = attiva();
    if (current) return current;
    let best = null;
    let bestOpacity = 0;
    for (const id of HIT_ORDER) {
      const v = opacityNow[id] ?? 0;
      if (v > bestOpacity) {
        bestOpacity = v;
        best = id;
      }
    }
    return bestOpacity > 0.01 ? best : null;
  }

  function paintOpacities() {
    for (const id of HIT_ORDER) {
      const item = parti[id];
      if (!item) continue;
      item.opacity = opacityNow[id] ?? 0;
    }
    paper.view.update();
  }

  function tickFade(now) {
    const dt = Math.min(48, now - fadeLast);
    fadeLast = now;
    const step = dt / FADE_MS;
    let busy = false;

    for (const id of HIT_ORDER) {
      const target = opacityTarget[id] ?? 0;
      let v = opacityNow[id] ?? 0;
      if (Math.abs(v - target) <= step) {
        v = target;
      } else if (v < target) {
        v += step;
        busy = true;
      } else {
        v -= step;
        busy = true;
      }
      if (v !== target) busy = true;
      opacityNow[id] = v;
    }

    paintOpacities();
    updateAsciiHole(holeId());

    if (busy) {
      fadeRaf = requestAnimationFrame(tickFade);
    } else {
      fadeRaf = null;
    }
  }

  function startFade() {
    if (fadeRaf) return;
    fadeLast = performance.now();
    updateAsciiHole(holeId());
    fadeRaf = requestAnimationFrame(tickFade);
  }

  function applyOpacity() {
    const current = attiva();
    for (const id of HIT_ORDER) {
      opacityTarget[id] = current === id ? 1 : 0;
    }
    updateNome();
    startFade();
  }

  function hitParte(point) {
    for (const id of HIT_ORDER) {
      const mask = clip[id];
      const item = parti[id];
      if (mask && typeof mask.contains === "function" && mask.contains(point)) {
        return id;
      }
      if (!mask && item && item.hitTest(point, { fill: true, stroke: true })) {
        return id;
      }
    }
    return null;
  }

  function onMove(event) {
    hovered = hitParte(event.point);
    setCursor(hovered);
    if (!fissata) applyOpacity();
    else updateNome();
  }

  function onDown(event) {
    const id = hitParte(event.point);
    fissata = id;
    hovered = id;
    applyOpacity();
  }

  function waitRasters(item) {
    const rasters = [];
    walk(item, (node) => {
      if (node instanceof paper.Raster) rasters.push(node);
    });
    return Promise.all(
      rasters.map(
        (raster) =>
          new Promise((resolve) => {
            if (raster.loaded && raster.size.width > 0) resolve();
            else {
              raster.onLoad = () => resolve();
              raster.onError = () => resolve();
            }
          })
      )
    );
  }

  function rewriteImageHrefs(svgText) {
    const dir = SVG_URL.replace(/[^/]+$/, "");
    return svgText.replace(/(?:xlink:)?href="(passiflora-\d+\.png)"/g, `xlink:href="${dir}$1"`);
  }

  function stripArtboardClip(item) {
    if (item.firstChild && item.firstChild.clipMask) {
      item.firstChild.remove();
      item.clipped = false;
    }
  }

  function wireParti(item) {
    stripArtboardClip(item);
    item.strokeScaling = false;
    fiore = new paper.Group(item);

    for (const id of HIT_ORDER) {
      const part = findNamed(item, id);
      if (!part) {
        console.warn(`Parte mancante nell’SVG: ${id}`);
        continue;
      }
      parti[id] = part;
      opacityNow[id] = 0;
      opacityTarget[id] = 0;
      part.opacity = 0;
      const mask = findClipMask(part);
      if (mask) clip[id] = mask;
    }
  }

  function syncAscii() {
    captureAsciiSource();
    initTextmode();
    holeApplied = null;
    applyOpacity();
  }

  paper.view.onMouseMove = onMove;
  paper.view.onMouseDown = onDown;
  canvas.addEventListener("mouseleave", () => {
    hovered = null;
    setCursor(null);
    if (!fissata) applyOpacity();
  });

  window.addEventListener("resize", () => {
    fitFiore();
    if (Object.keys(parti).length) syncAscii();
    else updateNome();
  });

  fetch(SVG_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`SVG ${response.status}`);
      return response.text();
    })
    .then((svgText) => {
      paper.project.importSVG(rewriteImageHrefs(svgText), {
        expandShapes: true,
        onLoad: (item) => {
          wireParti(item);
          waitRasters(item).then(() => {
            fitFiore();
            syncAscii();
          });
        },
        onError: (err) => {
          console.error("Import SVG fallito", err);
        },
      });
    })
    .catch((err) => {
      console.error("Fetch SVG fallito", err);
    });
})();
