# Amostras de paridade (Feature 026 — T023/T024)

Coloque aqui **um arquivo `.json` por navegador** exportado pela sonda `../tools/parity-probe.js`.

Nomes sugeridos: `edge.json`, `chrome.json`, `firefox.json`, `safari.json`.

## Como gerar

Em cada navegador, com o app aberto (`npm run preview` → http://localhost:4173/):

1. Cole `../tools/parity-probe.js` no console (uma vez).
2. Rode os cenários (ver `../parity-results.md §2`), ex.:
   ```js
   metrikParityProbe({ scenario: 'S1-6col-1280x720', clearPreferences: true });
   ```
3. Exporte e salve como `<navegador>.json` nesta pasta:
   ```js
   copy(JSON.stringify(window.__metrikParitySamples, null, 2));
   ```

## Como comparar

```bash
npm run parity:compare -- specs/026-cross-browser-column-layout/parity-samples --reference Edge --markdown specs/026-cross-browser-column-layout/parity-samples/report.md
```

O comparador ignora o `report.md` (só lê `.json`) e valida GP-01..GP-04 + pista da barra (FR-004/T028).

> Esta pasta é versionável por decisão do time; se preferir manter as amostras fora do Git, adicione `*.json` ao `.gitignore`.
