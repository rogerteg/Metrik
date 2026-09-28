/**
 * Migração única (P3, 2026-09-28): fatia `src/App.css` em arquivos contíguos
 * por feature em `src/styles/` e deixa `App.css` apenas como manifesto de
 * `@import` na MESMA ordem — preservando exatamente a cascata original.
 *
 * Uso: node scripts/split-app-css.mjs
 *
 * Seguro e determinístico: cada fatia é um intervalo contíguo de linhas, cortado
 * em fronteiras de banner de seção (profundidade 0). Nenhuma regra é dividida.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appCssPath = join(root, 'src', 'App.css');
const outDir = join(root, 'src', 'styles');

// Fronteiras (1-based) nos banners de seção de topo.
const chunks = [
  { start: 1, name: '01-design-system-core.css' },
  { start: 1061, name: '02-task-detail-inline.css' },
  { start: 1918, name: '03-priority-tags-filters.css' },
  { start: 2501, name: '04-column-color-picker.css' },
  { start: 2620, name: '05-profile-menu-session.css' },
  { start: 2939, name: '06-team-squad-modal.css' },
  { start: 3315, name: '07-restricted-board-fallback.css' },
  { start: 3380, name: '08-task-types-links.css' },
  { start: 3522, name: '09-task-links-cross-squad.css' },
  { start: 3790, name: '10-comments-containment.css' },
];

const lines = readFileSync(appCssPath, 'utf8').split(/\r?\n/);
mkdirSync(outDir, { recursive: true });

// Guarda: aborta se App.css já for um manifesto (evita rodar duas vezes).
if (!lines.some((l) => /^[.#][^{]*\{/.test(l))) {
  throw new Error('src/App.css não contém regras top-level — provavelmente já foi fatiado. Abortando.');
}

// Sanidade: as fronteiras devem começar com um banner de comentário.
for (const chunk of chunks) {
  const firstLine = lines[chunk.start - 1] ?? '';
  if (!firstLine.trimStart().startsWith('/*')) {
    throw new Error(`Fronteira inválida em ${chunk.start} ("${firstLine.slice(0, 60)}")`);
  }
}

const trimBlankEdges = (arr) => {
  let start = 0;
  let end = arr.length;
  while (start < end && arr[start].trim() === '') start++;
  while (end > start && arr[end - 1].trim() === '') end--;
  return arr.slice(start, end);
};

chunks.forEach((chunk, i) => {
  const start = chunk.start - 1;
  const end = i + 1 < chunks.length ? chunks[i + 1].start - 1 : lines.length;
  // Rebasa imports relativos (o arquivo sai de src/ para src/styles/).
  const rebased = lines
    .slice(start, end)
    .map((l) => l.replace(/@import\s+(['"])\.\//, "@import $1../"));
  const body = trimBlankEdges(rebased);
  const header = `/* Metrik — ${chunk.name.replace(/^\d+-/, '').replace(/\.css$/, '')}\n   Extraído de App.css (P3, 2026-09-28). Fatia contígua; a ordem é definida em App.css. */\n\n`;
  writeFileSync(join(outDir, chunk.name), header + body.join('\n') + '\n', 'utf8');
  console.log(`wrote src/styles/${chunk.name} (${body.length} linhas)`);
});

const manifest = [
  '/* ==========================================================================',
  '   Metrik — folha de estilo raiz.',
  '   Dividida por feature em `src/styles/` (P3, 2026-09-28).',
  '   A ORDEM dos @import preserva exatamente a cascata original: NÃO reordene.',
  '   Guarda automatizada: tests/unit/appCssStructure.test.ts',
  '   ========================================================================== */',
  '',
  ...chunks.map((c) => `@import './styles/${c.name}';`),
  '',
].join('\n');

writeFileSync(appCssPath, manifest, 'utf8');
console.log('\nsrc/App.css reescrito como manifesto de @import.');
