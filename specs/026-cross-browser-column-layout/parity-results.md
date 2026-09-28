# Paridade de Renderização do Quadro — Roteiro e Resultados (026, T023/T024)

**Feature**: `026-cross-browser-column-layout`
**Objetivo**: fechar as tarefas **T023** (matriz cross-browser) e **T024** (cenários de 2/6/12 colunas e contenção) que dependem de navegadores reais — indisponíveis no ambiente de desenvolvimento.
**Ferramentas**: [`tools/parity-probe.js`](tools/parity-probe.js) · [`tools/parity-compare.mjs`](tools/parity-compare.mjs)

---

## 1. Preparação (uma vez)

```bash
npm install
npm run build
npm run preview        # servir o build de produção em http://localhost:4173/
```

Em **cada** navegador (Edge, Chrome, Firefox, Safari):

1. Abra `http://localhost:4173/`.
2. Abra o DevTools → Console.
3. Cole o conteúdo de `tools/parity-probe.js` e pressione Enter.
   Deve aparecer: `[Metrik Parity] sondas prontas: metrikParityProbe, metrikSetWidths, metrikCorruptWidths`.
4. Ative o modo de dispositivo e fixe **1280×720** com ampliação **100%** (ajuste conforme o cenário).
5. Importe o **mesmo** arquivo de quadro em todos os navegadores (o armazenamento é local por navegador).

> **Dica**: renomeie a aba do DevTools por navegador para não se perder ao exportar os JSONs.

---

## 2. Cenários a capturar

Para cada cenário, rode a sonda e exporte o JSON. Execute o bloco de cada navegador **na mesma sessão** para acumular as amostras.

| # | Cenário | Janela | Ampliação | Passos | Amostras (GP/GC) |
|---|---|---|---|---|---|
| S1 | 6 colunas, sem preferências | 1280×720 | 100% | `metrikParityProbe({ scenario: 'S1-6col-1280x720', clearPreferences: true })` | GP-01/02/04 |
| S2 | 6 colunas, sem preferências | 1920×1080 | 100% | `metrikParityProbe({ scenario: 'S2-6col-1920x1080', clearPreferences: true })` | GP-01/02/04 |
| S3 | 6 colunas, preferências válidas | 1920×1080 | 100% | `metrikSetWidths({ 'Coluna To Do': 400 })` e depois `metrikParityProbe({ scenario: 'S3-6col-prefs' })` | GP-02/03 |
| S4 | 12 colunas (transbordo) | 1280×720 | 100% | `metrikParityProbe({ scenario: 'S4-12col-1280x720', clearPreferences: true })` | GP-04/GC-10 |
| S5 | 2 colunas | 2560×1440 | 100% | `metrikParityProbe({ scenario: 'S5-2col-2560x1440', clearPreferences: true })` | GP-01/04 |
| S6 | 6 colunas, ampliação variável | 1920×1080 | 50/150/200% | `metrikParityProbe({ scenario: 'S6-6col-zoom-<zoom>' })` | GP-05 |
| S7 | 6 colunas, densidade 1,5 e 2,0 | — | — | Fixe DPR no DevTools e capture `S7-6col-dpr-<dpr>` | GP-06 |
| S8 | Preferências corrompidas | 1920×1080 | 100% | `metrikCorruptWidths()` e depois `metrikParityProbe({ scenario: 'S8-corrupt' })` | GC-09 |
| S9 | Temas claro/escuro/neutro | 1920×1080 | 100% | Alterne o tema e capture `S9-theme-<nome>` | GP-09 |
| S10 | Analytics e modais | 1920×1080 | 100% | Abra a visão Analytics e um modal; capture `S10-analytics` / `S10-modal` | GP-10 |

Exportar (o console imprime o comando pronto):

```js
copy(JSON.stringify(window.__metrikParitySamples, null, 2));
```

Salve em `specs/026-cross-browser-column-layout/parity-samples/<navegador>.json`
(ex.: `edge.json`, `chrome.json`, `firefox.json`, `safari.json`).

### Verificações funcionais de §5 (registrar à mão)

| Cenário | Resultado esperado |
|---|---|
| Arraste sem salto | Largura varia ~1 px por 1 px, sem salto (GC-06) |
| Limites | Não sai de [220, 650] (GC-03) |
| Preferência válida | Preservada exatamente após recarregar (GC-04) |
| Restaurar (2×) | Volta ao padrão nas duas vezes (GC-05) |
| Rolagem contida | Cabeçalho/métricas/filtros intactos com transbordo (GC-10) |
| Diagnóstico | `[Metrik Guard] … reason=out-of-range` para valor inválido (FR-014) |

---

## 3. Comparar

```bash
node specs/026-cross-browser-column-layout/tools/parity-compare.mjs \
  specs/026-cross-browser-column-layout/parity-samples \
  --reference Edge \
  --markdown specs/026-cross-browser-column-layout/parity-samples/report.md
```

Aceita também arquivos individuais (`... edge.json chrome.json`) — e, com uma pasta, lê todos os `.json` (ignora o `report.md`).

O script verifica, por cenário: quantidade/ordem de colunas (GP-01), Δlargura ≤ 1 px (GP-02), Δposição ≤ 1 px (GP-03), ausência de corte/sobreposição (GP-04) e registra a **pista da barra horizontal** (FR-004/T028). Exit code `0` = paridade OK; `1` = divergência.

---

## 4. Registro de resultados

Preencha após rodar cada navegador.

| Cenário | Edge | Chrome | Firefox | Safari | Δlargura máx | Δposição máx | Pista scroll (px) | Veredito |
|---|---|---|---|---|---|---|---|---|
| S1 6 col · 1280×720 | ☐ | ☐ | ☐ | ☐ | | | | |
| S2 6 col · 1920×1080 | ☐ | ☐ | ☐ | ☐ | | | | |
| S3 6 col · prefs | ☐ | ☐ | ☐ | ☐ | | | | |
| S4 12 col · 1280×720 | ☐ | ☐ | ☐ | ☐ | | | | |
| S5 2 col · 2560×1440 | ☐ | ☐ | ☐ | ☐ | | | | |
| S6 zoom 50/150/200% | ☐ | ☐ | ☐ | ☐ | | | | |
| S7 densidade 1,5/2,0 | ☐ | ☐ | ☐ | ☐ | | | | |
| S8 prefs corrompidas | ☐ | ☐ | ☐ | ☐ | | | | |
| S9 temas | ☐ | ☐ | ☐ | ☐ | | | | |
| S10 analytics/modais | ☐ | ☐ | ☐ | ☐ | | | | |

**Responsável**: ____________________  **Data**: ____/____/______

### Notas

- Se não houver divergência com janela e ampliação idênticas e o mesmo conteúdo, a causa do relato original era **ambiental** (H2/H4 de `research.md`).
- Divergência mesmo com ambiente idêntico indica causa de **código** (H1/H3) — abrir correção.
- Após preencher, marcar **T023** e **T024** em `tasks.md` e revisar `checklists/browser-parity.md`.
