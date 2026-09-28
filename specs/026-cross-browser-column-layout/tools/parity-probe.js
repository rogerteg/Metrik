/**
 * Metrik Column Layout Parity Probe (Feature 026 — T023/T024)
 * =================================================================
 * Sonda para capturar a geometria renderizada do quadro em navegadores reais.
 * Deve ser colada no console do DevTools com o quadro visível.
 *
 * Uso básico (captura a amostra e a acumula em window.__metrikParitySamples):
 *
 *   metrikParityProbe({ scenario: '6-col-1280x720-no-prefs' });
 *   metrikParityProbe({ scenario: '6-col-1280x720-no-prefs', clearPreferences: true });
 *   // exportar (o console já imprime o comando pronto):
 *   copy(JSON.stringify(window.__metrikParitySamples, null, 2));
 *
 * Fluxo recomendado (ver specs/026-cross-browser-column-layout/parity-results.md):
 *   1. Fixe janela e ampliação (ex.: 1280x720 @ 100%) em cada navegador.
 *   2. Importe o MESMO quadro em Edge, Chrome, Firefox e Safari.
 *   3. Em cada navegador, rode a sonda para cada cenário e exporte o JSON.
 *   4. Compare com: node tools/parity-compare.mjs amostras/*.json --reference Edge
 *
 * A sonda é somente leitura, exceto quando `clearPreferences: true` (limpa as
 * chaves metrik-col-widths-* e recarrega a página).
 */
window.metrikParityProbe = function metrikParityProbe(options) {
  var opts = Object.assign({ scenario: 'unspecified', clearPreferences: false }, options || {});

  if (opts.clearPreferences) {
    Object.keys(localStorage)
      .filter(function (k) { return k.indexOf('metrik-col-widths-') === 0; })
      .forEach(function (k) { localStorage.removeItem(k); });
    console.log('[Metrik Parity] width preferences cleared; reloading…');
    location.reload();
    return 'cleared';
  }

  var round = function (n) { return Math.round(n * 100) / 100; };

  var detectEngine = function () {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return 'Edge';
    if (/OPR\//.test(ua)) return 'Opera';
    if (/Firefox\//.test(ua)) return 'Firefox';
    if (/Chrome\//.test(ua)) return 'Chrome';
    if (/Safari\//.test(ua)) return 'Safari';
    return 'Unknown';
  };

  var grid = document.querySelector('.kanban-board-grid');
  var cols = Array.prototype.slice.call(document.querySelectorAll('.kanban-column'));

  var columns = cols.map(function (c) {
    var r = c.getBoundingClientRect();
    var cs = getComputedStyle(c);
    return {
      id: c.id || c.getAttribute('aria-label') || '(sem id)',
      width: round(r.width),
      left: round(r.left),
      right: round(r.right),
      inlineWidth: c.style.width || null,
      minWidth: cs.minWidth,
      maxWidth: cs.maxWidth
    };
  });

  var gridRect = grid ? grid.getBoundingClientRect() : null;
  var gridCs = grid ? getComputedStyle(grid) : null;

  var clipped = gridRect
    ? columns.filter(function (c) { return c.right > gridRect.right + 1 || c.left < gridRect.left - 1; }).map(function (c) { return c.id; })
    : [];

  var overlaps = [];
  for (var i = 1; i < columns.length; i++) {
    if (columns[i].left < columns[i - 1].right - 1) {
      overlaps.push([columns[i - 1].id, columns[i].id]);
    }
  }

  var sample = {
    scenario: opts.scenario,
    engine: detectEngine(),
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    columnCount: columns.length,
    columns: columns,
    grid: grid
      ? {
          clientWidth: grid.clientWidth,
          scrollWidth: grid.scrollWidth,
          clientHeight: grid.clientHeight,
          offsetHeight: grid.offsetHeight,
          // Pista da barra horizontal: espessura real reservada (FR-004/T028)
          horizontalScrollbarLane: grid.offsetHeight - grid.clientHeight,
          scrollbarWidthCss: gridCs.scrollbarWidth,
          scrollbarGutter: gridCs.scrollbarGutter,
          overflowX: gridCs.overflowX,
          rectWidth: round(gridRect.width),
          rectHeight: round(gridRect.height)
        }
      : null,
    cssVars: gridCs
      ? {
          widthDefault: gridCs.getPropertyValue('--metrik-column-width-default').trim(),
          widthMin: gridCs.getPropertyValue('--metrik-column-width-min').trim(),
          widthMax: gridCs.getPropertyValue('--metrik-column-width-max').trim(),
          scrollbarLane: gridCs.getPropertyValue('--metrik-scrollbar-lane').trim()
        }
      : null,
    clippedColumns: clipped,
    overlappingColumns: overlaps,
    capturedAt: new Date().toISOString()
  };

  window.__metrikParitySamples = window.__metrikParitySamples || [];
  window.__metrikParitySamples.push(sample);

  var verdict = clipped.length || overlaps.length
    ? '%cFAIL (clipping/overlap)'
    : '%cOK';
  console.log(verdict, 'color:' + (clipped.length || overlaps.length ? '#e11' : '#0a0'),
    '[Metrik Parity]', opts.scenario, '·', sample.engine, '·', sample.columnCount, 'colunas', sample);
  console.log('[Metrik Parity] export:', 'copy(JSON.stringify(window.__metrikParitySamples, null, 2))');
  return sample;
};

/**
 * Conveniência: define preferências de largura por coluna e recarrega.
 * Ex.: metrikSetWidths({ todo: 400, 'in-progress': 99999 });
 * Use 99999 (fora da faixa) para exercitar o descarte com diagnóstico [Metrik Guard].
 */
window.metrikSetWidths = function metrikSetWidths(widthsByColumnId, boardId) {
  var key = 'metrik-col-widths-' + (boardId || 'default');
  localStorage.setItem(key, JSON.stringify(widthsByColumnId || {}));
  console.log('[Metrik Parity] widths written to', key, '; reloading…');
  location.reload();
};

/**
 * Conveniência: grava um payload corrompido (texto/fora da faixa) para o
 * cenário GC-09 e recarrega.
 */
window.metrikCorruptWidths = function metrikCorruptWidths(boardId) {
  return window.metrikSetWidths({ todo: 'largo', 'in-progress': 99999, review: 300 }, boardId);
};

console.log('[Metrik Parity] sondas prontas: metrikParityProbe, metrikSetWidths, metrikCorruptWidths');
