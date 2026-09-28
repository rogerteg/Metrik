#!/usr/bin/env node
/**
 * Metrik Column Layout Parity Comparator (Feature 026 — T023/T024)
 * =================================================================
 * Lê os JSONs exportados por `window.metrikParityProbe(...)` (tools/parity-probe.js)
 * e verifica a paridade entre navegadores para cada cenário.
 *
 * Uso:
 *   node tools/parity-compare.mjs amostras/*.json
 *   node tools/parity-compare.mjs amostras/*.json --reference Edge
 *   node tools/parity-compare.mjs amostras/*.json --tolerance 1 --markdown out.md
 *
 * Regras (contrato layout-parity.contract.md):
 *   GP-01 quantidade e ordem de colunas idênticas
 *   GP-02 diferença de largura por coluna ≤ 1 px
 *   GP-03 diferença de posição horizontal acumulada ≤ 1 px
 *   GP-04 nenhuma coluna cortada/sobreposta/colapsada
 *   FR-004/T028 pista da barra horizontal igual entre motores (informativo)
 *
 * Saída: relatório em texto + (opcional) tabela markdown. Exit code 1 se falhar.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const files = [];
let reference = null;
let tolerance = 1;
let markdownPath = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--reference') reference = args[++i];
  else if (arg === '--tolerance') tolerance = Number(args[++i]);
  else if (arg === '--markdown') markdownPath = args[++i];
  else files.push(arg);
}

// Expande diretórios: aceita uma pasta com as amostras .json de cada navegador.
const expanded = [];
for (const entry of files) {
  try {
    if (statSync(entry).isDirectory()) {
      for (const name of readdirSync(entry)) {
        if (name.toLowerCase().endsWith('.json')) expanded.push(join(entry, name));
      }
    } else {
      expanded.push(entry);
    }
  } catch {
    expanded.push(entry);
  }
}
files.length = 0;
files.push(...expanded);

if (files.length === 0) {
  console.error('Uso: node tools/parity-compare.mjs <arquivos.json|pasta> [...] [--reference Edge] [--tolerance 1] [--markdown saida.md]');
  process.exit(2);
}

/** @type {Array<any>} */
const samples = [];
for (const file of files) {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    const list = Array.isArray(parsed) ? parsed : [parsed];
    for (const s of list) samples.push(s);
  } catch (err) {
    console.error(`Falha ao ler ${file}: ${err.message}`);
    process.exit(2);
  }
}

const results = [];
const failures = [];
const groupKey = (s) => `${s.scenario}::${s.engine}`;
const byScenario = new Map();

for (const sample of samples) {
  if (!byScenario.has(sample.scenario)) byScenario.set(sample.scenario, new Map());
  // Última amostra por (cenário, engine) prevalece.
  byScenario.get(sample.scenario).set(sample.engine, sample);
}

const enginesOf = (map) => [...map.keys()];
const maxAbs = (arr) => arr.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

for (const [scenario, engineMap] of byScenario) {
  const engines = enginesOf(engineMap);
  const refEngine = reference && engineMap.has(reference) ? reference : engines[0];
  const ref = engineMap.get(refEngine);

  for (const engine of engines) {
    if (engine === refEngine) continue;
    const cand = engineMap.get(engine);
    const row = { scenario, reference: refEngine, engine, problems: [] };

    if (ref.columnCount !== cand.columnCount) {
      row.problems.push(`GP-01: ${ref.columnCount} colunas (${refEngine}) vs ${cand.columnCount} (${engine})`);
    }

    const refIds = ref.columns.map((c) => c.id);
    const candIds = cand.columns.map((c) => c.id);
    if (refIds.join('|') !== candIds.join('|')) {
      row.problems.push(`GP-01: ordem/ids divergentes — ${refEngine}=[${refIds}] ${engine}=[${candIds}]`);
    }

    const widthDeltas = [];
    const leftDeltas = [];
    const n = Math.min(ref.columns.length, cand.columns.length);
    for (let i = 0; i < n; i++) {
      widthDeltas.push(cand.columns[i].width - ref.columns[i].width);
      leftDeltas.push(cand.columns[i].left - ref.columns[i].left);
    }
    row.maxWidthDelta = maxAbs(widthDeltas);
    row.maxLeftDelta = maxAbs(leftDeltas);
    if (row.maxWidthDelta > tolerance) {
      row.problems.push(`GP-02: delta de largura ${row.maxWidthDelta}px > ${tolerance}px`);
    }
    if (row.maxLeftDelta > tolerance) {
      row.problems.push(`GP-03: delta de posição ${row.maxLeftDelta}px > ${tolerance}px`);
    }

    if ((cand.clippedColumns || []).length) row.problems.push(`GP-04: colunas cortadas ${JSON.stringify(cand.clippedColumns)}`);
    if ((cand.overlappingColumns || []).length) row.problems.push(`GP-04: colunas sobrepostas ${JSON.stringify(cand.overlappingColumns)}`);

    row.scrollbarLanes = {
      [refEngine]: ref.grid ? ref.grid.horizontalScrollbarLane : null,
      [engine]: cand.grid ? cand.grid.horizontalScrollbarLane : null,
    };
    row.sameScrollbarLane = row.scrollbarLanes[refEngine] === row.scrollbarLanes[engine];

    if (row.problems.length) failures.push(row);
    results.push(row);
  }
}

const line = '─'.repeat(72);
console.log(line);
console.log('Metrik — Relatório de Paridade de Colunas (026)');
console.log(line);
console.log(`Arquivos: ${files.join(', ')}`);
console.log(`Amostras: ${samples.length} · Cenários: ${byScenario.size}`);
console.log('');

const md = [];
md.push('| Cenário | Ref | Navegador | Δlargura máx | Δposição máx | Pista scroll (ref/alt) | Veredito |');
md.push('|---|---|---|---|---|---|---|');

for (const row of results) {
  const verdict = row.problems.length ? `❌ ${row.problems.join('; ')}` : '✅ OK';
  console.log(`[${verdict.startsWith('✅') ? 'PASS' : 'FAIL'}] ${row.scenario} · ${row.reference} vs ${row.engine} · Δw=${row.maxWidthDelta}px Δx=${row.maxLeftDelta}px · pista ${row.scrollbarLanes[row.reference]}/${row.scrollbarLanes[row.engine]}px`);
  if (row.problems.length) row.problems.forEach((p) => console.log(`        - ${p}`));
  md.push(`| ${row.scenario} | ${row.reference} | ${row.engine} | ${row.maxWidthDelta}px | ${row.maxLeftDelta}px | ${row.scrollbarLanes[row.reference]}/${row.scrollbarLanes[row.engine]} | ${row.problems.length ? '❌' : '✅'} |`);
}

console.log('');
console.log(line);
console.log(failures.length === 0
  ? `RESULTADO: ✅ PARIDADE OK em ${results.length} comparação(ões).`
  : `RESULTADO: ❌ ${failures.length} comparação(ões) com falha de ${results.length}.`);
console.log(line);

if (markdownPath) {
  writeFileSync(markdownPath, `${md.join('\n')}\n`, 'utf8');
  console.log(`Tabela markdown gravada em ${markdownPath}`);
}

process.exit(failures.length === 0 ? 0 : 1);
