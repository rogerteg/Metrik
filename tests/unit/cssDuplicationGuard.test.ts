import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guarda de duplicação de seletores no CSS (P3, 2026-09-28).
 *
 * O CSS foi fatiado em `src/styles/*.css`, mas ainda existem seletores declarados
 * mais de uma vez (herança do `App.css` monolítico). Deduplicar exige análise de
 * cascata (nenhum bloco é byte-idêntico). Este teste é um **ratchet**: impede que
 * NOVOS seletores duplicados sejam introduzidos; a lista-base só pode encolher.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const stylesDir = path.join(repoRoot, 'src', 'styles');

/** Lista-base dos seletores duplicados remanescentes (somente encolher). */
const DUPLICATE_BASELINE = new Set([
  '.add-column-card',
  '.add-column-icon',
  '.badge-cycle-time',
  '.badge-lead-time',
  '.badge-metric-time',
  '.btn-add-column',
  '.metrik-comment-list',
  '.task-blocked-dependency-chip',
  '.task-card-header',
  '.task-indicator-badge',
  '.task-indicators',
  '.task-metrics-badges',
]);

function importedModulesInOrder(): string[] {
  const appCss = readFileSync(path.join(repoRoot, 'src', 'App.css'), 'utf8');
  return [...appCss.matchAll(/@import\s+(['"])\.\/styles\/([^'"]+)\1\s*;/g)].map((m) => m[2]);
}

function duplicateSelectors(): string[] {
  const counts = new Map<string, number>();

  for (const file of importedModulesInOrder()) {
    const css = readFileSync(path.join(stylesDir, file), 'utf8');
    // Seletores simples de topo (sem vírgula), ignorando psedo-classes com `{`.
    for (const match of css.matchAll(/^([.#][^{}\n,]+?)\s*\{/gm)) {
      const selector = match[1].trim();
      counts.set(selector, (counts.get(selector) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([selector]) => selector)
    .sort();
}

describe('CSS duplication guard (P3 ratchet)', () => {
  it('imports every module from src/styles (sanity)', () => {
    const modules = importedModulesInOrder();
    const onDisk = readdirSync(stylesDir).filter((f) => f.endsWith('.css'));
    expect(modules.length).toBeGreaterThan(0);
    expect([...modules].sort()).toEqual([...onDisk].sort());
  });

  it('introduces no NEW duplicated selector beyond the baseline', () => {
    const duplicates = duplicateSelectors();
    const introduced = duplicates.filter((selector) => !DUPLICATE_BASELINE.has(selector));
    expect(introduced, `novos seletores duplicados: ${introduced.join(', ')}`).toEqual([]);
  });

  it('keeps the duplicated-selector count at or below the baseline (only shrink)', () => {
    expect(duplicateSelectors().length).toBeLessThanOrEqual(DUPLICATE_BASELINE.size);
  });
});
