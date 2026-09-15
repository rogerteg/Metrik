import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
} from '../../src/utils/columnGeometry';

/**
 * Guarda anti-drift CSS ↔ TypeScript (Feature 026, GC-07 e GC-08).
 *
 * Este arquivo existe porque o defeito original era exatamente a divergência entre valores
 * declarados em folhas de estilo e em código: o CSS dizia 290/220 e o TypeScript dizia 280/200.
 * Se alguém alterar um lado sem o outro, esta suíte falha.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const readSource = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const appCss = readSource('src/App.css');

/** Extrai as declarações do bloco base `.kanban-column { ... }` (ignora `:hover`, `.is-*`, etc.). */
function extractBaseColumnBlock(css: string): string {
  const match = css.match(/\.kanban-column\s*\{([^}]*)\}/);
  if (!match) {
    throw new Error('Bloco base `.kanban-column` não encontrado em src/App.css');
  }
  return match[1];
}

function readCustomProperty(css: string, name: string): number | null {
  const match = css.match(new RegExp(`${name}\\s*:\\s*(\\d+)px`));
  return match ? Number(match[1]) : null;
}

describe('columnGeometryContract — guarda anti-drift (GC-07, GC-08)', () => {
  describe('custom properties de geometria no CSS', () => {
    it('declares the default width identical to the TypeScript constant (GC-07)', () => {
      expect(readCustomProperty(appCss, '--metrik-column-width-default')).toBe(DEFAULT_COLUMN_WIDTH);
    });

    it('declares the minimum width identical to the TypeScript constant (GC-07)', () => {
      expect(readCustomProperty(appCss, '--metrik-column-width-min')).toBe(MIN_COLUMN_WIDTH);
    });

    it('declares the maximum width identical to the TypeScript constant (GC-07)', () => {
      expect(readCustomProperty(appCss, '--metrik-column-width-max')).toBe(MAX_COLUMN_WIDTH);
    });
  });

  describe('bloco base .kanban-column', () => {
    const block = extractBaseColumnBlock(appCss);

    it('consumes the custom properties instead of literals', () => {
      expect(block).toMatch(/width:\s*var\(--metrik-column-width-default\)/);
      expect(block).toMatch(/min-width:\s*var\(--metrik-column-width-min\)/);
      expect(block).toMatch(/max-width:\s*var\(--metrik-column-width-max\)/);
    });

    it('contains no literal pixel width, minimum or maximum', () => {
      expect(block).not.toMatch(/(?:^|\s)(?:min-|max-)?width\s*:\s*\d+px/);
    });

    it('declares explicit flex sizing so a column never stretches or squeezes (GC-10)', () => {
      expect(block).toMatch(/flex:\s*0\s+0\s+auto/);
    });
  });

  describe('componentes não contêm literais de geometria (GC-08)', () => {
    const guardedFiles = ['src/components/Column.tsx', 'src/components/Board.tsx'];

    it.each(guardedFiles)('%s has no "width || <number>" fallback', (file) => {
      expect(readSource(file)).not.toMatch(/\|\|\s*\d{2,3}\b/);
    });

    it.each(guardedFiles)('%s has no numeric clamp literal', (file) => {
      expect(readSource(file)).not.toMatch(/Math\.(?:max|min)\(\s*\d/);
    });

    it.each(guardedFiles)('%s has no inline pixel width literal', (file) => {
      expect(readSource(file)).not.toMatch(/(?:minWidth|maxWidth|width):\s*['"`]?\d+px/);
    });

    it('useColumnWidths reuses the pure module instead of declaring its own bounds', () => {
      const source = readSource('src/hooks/useColumnWidths.ts');
      expect(source).toMatch(/from '\.\.\/utils\/columnGeometry'/);
      expect(source).not.toMatch(/=\s*(?:200|220|280|290|650)\b/);
      expect(source).not.toMatch(/Math\.(?:max|min)\(\s*\d/);
    });
  });

  describe('nenhuma decisão de layout depende do navegador (FR-006, NFR-001, T019)', () => {
    const geometryPath = [
      'src/utils/columnGeometry.ts',
      'src/hooks/useColumnWidths.ts',
      'src/components/Column.tsx',
      'src/components/Board.tsx',
    ];

    it.each(geometryPath)('%s performs no browser or platform detection', (file) => {
      const source = readSource(file);
      expect(source).not.toMatch(/navigator\.(?:userAgent|platform|appVersion|vendor)/);
      expect(source).not.toMatch(/userAgentData/);
    });

    it.each(geometryPath)('%s has no layout branch on feature support', (file) => {
      const source = readSource(file);
      expect(source).not.toMatch(/@supports/);
      expect(source).not.toMatch(/CSS\.supports/);
    });
  });
});
