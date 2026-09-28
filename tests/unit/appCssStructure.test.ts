import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Guarda de estrutura do CSS (P3, 2026-09-28).
 *
 * `src/App.css` foi fatiado em `src/styles/*.css` por features. A cascata é
 * sensível à ordem, então este teste protege: (a) o manifesto não volta a
 * conter regras, (b) a ordem dos `@import` não muda e (c) todo módulo existe.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const raw = readFileSync(path.join(repoRoot, 'src/App.css'), 'utf8');

const IMPORT_RE = /@import\s+(['"])([^'"]+)\1\s*;/g;
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const EXPECTED_ORDER = [
  './styles/01-design-system-core.css',
  './styles/02-task-detail-inline.css',
  './styles/03-priority-tags-filters.css',
  './styles/04-column-color-picker.css',
  './styles/05-profile-menu-session.css',
  './styles/06-team-squad-modal.css',
  './styles/07-restricted-board-fallback.css',
  './styles/08-task-types-links.css',
  './styles/09-task-links-cross-squad.css',
  './styles/10-comments-containment.css',
  './styles/11-sprint.css',
];

describe('App.css structure guard (P3 split)', () => {
  it('is a manifest containing only comments and @import statements', () => {
    const withoutComments = stripComments(raw);
    const withoutImports = withoutComments.replace(IMPORT_RE, '');
    expect(withoutImports.trim()).toBe('');
  });

  it('keeps all rule blocks out of the manifest (cascade lives in modules)', () => {
    expect(stripComments(raw)).not.toMatch(/\{/);
  });

  it('imports every module in the expected cascade order', () => {
    const imports = [...raw.matchAll(IMPORT_RE)].map((m) => m[2]);
    expect(imports).toEqual(EXPECTED_ORDER);
  });

  it('every imported module exists and has effective (non-comment) content', () => {
    for (const match of raw.matchAll(IMPORT_RE)) {
      const target = path.join(repoRoot, 'src', match[2]);
      expect(existsSync(target), `missing CSS module: ${match[2]}`).toBe(true);
      expect(stripComments(readFileSync(target, 'utf8')).trim().length).toBeGreaterThan(0);
    }
  });
});
