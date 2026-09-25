import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T027 — Contrato de não-sobreposição do feed de atividade.
 * Requisito: SC-004 (zero sobreposição entre texto e timestamps à direita),
 * garantido estruturalmente por: timestamps com `white-space: nowrap` +
 * `flex-shrink: 0`, e corpos de texto com `min-width: 0` (permitem truncar).
 */
describe('Activity feed no-overlap contract (Feature 037 / T027, SC-004)', () => {
  const css = fs.readFileSync(path.resolve('src/components/TaskActivityFeed.css'), 'utf8');

  const declarationsOf = (selector: string): string => {
    const selectorIndex = css.indexOf(selector);
    expect(selectorIndex, `seletor ausente no CSS: ${selector}`).toBeGreaterThanOrEqual(0);
    const open = css.indexOf('{', selectorIndex);
    const close = css.indexOf('}', open);
    return css.slice(open, close);
  };

  it('ancora os timestamps sem encolher (nowrap + flex-shrink: 0)', () => {
    for (const selector of ['.mrf-comment__time', '.mrf-log__time']) {
      const block = declarationsOf(selector);
      expect(block).toMatch(/white-space:\s*nowrap/);
      expect(block).toMatch(/flex-shrink:\s*0/);
    }
  });

  it('permite truncar o corpo do conteúdo (min-width: 0)', () => {
    for (const selector of ['.mrf-comment__body', '.mrf-log__body']) {
      expect(declarationsOf(selector)).toMatch(/min-width:\s*0/);
    }
  });
});
