(function () {
  'use strict';

  // ── DEFAULTS ──────────────────────────────────────────────────────────────
  var fontSize  = 20;   // px — also controls column width
  var fps       = 2;    // 1–15
  var adBotFreq = 0.08; // 0.00–0.30

  // ── CHARACTER SETS ────────────────────────────────────────────────────────
  var symbols = (
    '□■▪▫░▒▓▲▼◆◇○●' +
    '∑∏∫∂∇≠≤≥±×÷⊕⊗∈∉' +
    '→←↑↓↗↘↙↖⇒⇐' +
    'ΣΩΔΛΠΦΨΓαβγδεζ' +
    '$€£¥' +
    '@#&*|\\^~{}'
  ).split('');
  var latin    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
  var adBot    = 'ad bot'.split('');
  var adBotIdx = 0;
  var lingerers = []; // {x, y, ch, life}

  function randChar() {
    return Math.random() < 0.80
      ? symbols[Math.floor(Math.random() * symbols.length)]
      : latin[Math.floor(Math.random() * latin.length)];
  }

  // ── CANVAS ────────────────────────────────────────────────────────────────
  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    zIndex: '-1', pointerEvents: 'none'
  });
  document.body.insertBefore(canvas, document.body.firstChild);

  var bgStyle = document.createElement('style');
  bgStyle.textContent = 'html{background:#0a0f1a!important}body{background:transparent!important}';

  var sectionStyle = document.createElement('style');
  sectionStyle.textContent = [
    '#hero{background:transparent!important}',
    '#hero::before{background:transparent!important}',
    '#credibility,#why,#research,#about,#comparison,#industry-data,#ga4-gap,nav,footer{background:transparent!important}'
  ].join('');
  canvas.style.display = 'none';

  // ── COLUMNS ───────────────────────────────────────────────────────────────
  var cols  = [];
  var timer = null;

  function initCols() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    lingerers = [];
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    cols = [];
    var rows = Math.floor(canvas.height / fontSize);
    var x = Math.random() * fontSize;
    while (x < canvas.width) {
      cols.push({
        x:        x,
        y:        Math.floor(Math.random() * rows),
        speed:    0.3 + Math.random() * 0.7,
        frac:     0,
        adBotPos: -1
      });
      x += 8 + Math.random() * 14;
    }
  }

  // ── RENDER LOOP ───────────────────────────────────────────────────────────
  function tick() {
    ctx.fillStyle = 'rgba(10, 15, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font      = 'normal ' + fontSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#4ade80'; // Acid Green

    for (var i = 0; i < cols.length; i++) {
      var col = cols[i];
      col.frac += col.speed;
      if (col.frac < 1) continue;
      col.frac -= 1;

      var x = i * fontSize + fontSize * 0.5;
      var y = col.y * fontSize;

      var ch, isAdBot = false;
      if (col.adBotPos >= 0) {
        ch = adBot[col.adBotPos];
        isAdBot = true;
        col.adBotPos++;
        if (col.adBotPos >= adBot.length) col.adBotPos = -1;
      } else if (Math.random() < adBotFreq) {
        col.adBotPos = 1;
        ch = adBot[0];
        isAdBot = true;
      } else {
        ch = randChar();
      }

      if (ch !== ' ' && y > 0 && y < canvas.height + fontSize) {
        if (isAdBot) {
          var bigSize = Math.round(fontSize * 1.1);
          ctx.font = '300 ' + bigSize + 'px -apple-system, "Helvetica Neue", Arial, sans-serif';
          ctx.fillText(ch, x, y);
          ctx.font      = 'normal ' + fontSize + 'px monospace';
          lingerers.push({ x: x, y: y, ch: ch, size: bigSize, life: 30 });
        } else {
          ctx.fillText(ch, x, y);
        }
      }

      col.y++;
      if (col.y * fontSize > canvas.height + fontSize * 5) {
        col.y      = -(Math.floor(Math.random() * 20) + 5);
        col.speed  = 0.3 + Math.random() * 0.7;
        col.adBotPos = -1;
      }
    }

    for (var j = lingerers.length - 1; j >= 0; j--) {
      var lg = lingerers[j];
      ctx.font = '300 ' + lg.size + 'px -apple-system, "Helvetica Neue", Arial, sans-serif';
      ctx.fillText(lg.ch, lg.x, lg.y);
      lg.life--;
      if (lg.life <= 0) lingerers.splice(j, 1);
    }
  }

  function startLoop() {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, Math.round(1000 / fps));
  }

  function syncRainSettings() {
    window._rainSettings = {
      fps:      fps,
      fontSize: fontSize,
      opacity:  parseFloat(canvas.style.opacity) || 0.23
    };
  }

  window.addEventListener('resize', initCols);

  var rainOn = false;
  function setRain(on) {
    rainOn = on;
    if (on) {
      document.head.appendChild(bgStyle);
      document.head.appendChild(sectionStyle);
      canvas.style.display = '';
      initCols();
      startLoop();
    } else {
      if (timer) { clearInterval(timer); timer = null; }
      canvas.style.display = 'none';
      if (bgStyle.parentNode) bgStyle.parentNode.removeChild(bgStyle);
      if (sectionStyle.parentNode) sectionStyle.parentNode.removeChild(sectionStyle);
    }
  }

  window._setRain = setRain;
  canvas.style.opacity = '0.23';
  syncRainSettings();
})();
