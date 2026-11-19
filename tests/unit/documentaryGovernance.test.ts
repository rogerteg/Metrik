import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = path.resolve(__dirname, '../../');
const SPECS_DIR = path.join(ROOT_DIR, 'specs');

export interface SpecValidationResult {
  divergentDelivered: string[];
  divergentActive: string[];
}

export function validateSpecsGovernance(
  specDirs: { num: number; name: string; dirPath: string }[],
  inProgressFeatures: Set<number> = new Set(),
  fileReader: (filePath: string) => string = (p) => fs.readFileSync(p, 'utf-8'),
): SpecValidationResult {
  const statusCanonicalRegex = /^\*\*Status\*\*:\s*Implemented & Verified \(\d{4}-\d{2}-\d{2}\)/m;
  const statusDraftRegex = /^\*\*Status\*\*:\s*Draft/m;

  const divergentDelivered: string[] = [];
  const divergentActive: string[] = [];

  specDirs.forEach((spec) => {
    const specPath = path.join(spec.dirPath, 'spec.md');
    if (!fs.existsSync(specPath)) {
      if (inProgressFeatures.has(spec.num)) {
        divergentActive.push(`Feature ${spec.name}: spec.md missing`);
      } else {
        divergentDelivered.push(`Feature ${spec.name}: spec.md missing`);
      }
      return;
    }

    const content = fileReader(specPath);
    if (inProgressFeatures.has(spec.num)) {
      if (!statusDraftRegex.test(content)) {
        divergentActive.push(`In-progress feature ${spec.name} must have Status: Draft`);
      }
    } else {
      if (!statusCanonicalRegex.test(content)) {
        divergentDelivered.push(
          `Feature ${spec.name}: status is not canonical "Implemented & Verified (<YYYY-MM-DD>)"`,
        );
      }
    }
  });

  return { divergentDelivered, divergentActive };
}

describe('Documentary Governance Guard (Feature 050 - Roadmap Phase 2)', () => {
  // Test 1: OPP-010 / FR-001, FR-002, FR-003 — Varredura Dinâmica Exaustiva
  it('should ensure all delivered specs have canonical "Implemented & Verified (<date>)" status by exhaustive specs/ scan', () => {
    const specDirs = fs
      .readdirSync(SPECS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
      .map((d) => ({
        num: parseInt(d.name.substring(0, 3), 10),
        name: d.name,
        dirPath: path.join(SPECS_DIR, d.name),
      }))
      .sort((a, b) => a.num - b.num);

    expect(specDirs.length, 'O diretório specs/ deve conter especificações').toBeGreaterThan(0);

    // Feature em curso declarada explicitamente (vazio na branch main estável)
    const inProgressFeatures = new Set<number>([]);

    const result = validateSpecsGovernance(specDirs, inProgressFeatures);

    expect(
      result.divergentDelivered,
      `Found delivered specs with divergent status: \n${result.divergentDelivered.join('\n')}`,
    ).toEqual([]);

    expect(
      result.divergentActive,
      `Found active specs with divergent status: \n${result.divergentActive.join('\n')}`,
    ).toEqual([]);
  });

  it('should immediately detect and fail if Draft is injected into spec > 055 (verificação adversarial do gate)', () => {
    const specDirs = fs
      .readdirSync(SPECS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
      .map((d) => ({
        num: parseInt(d.name.substring(0, 3), 10),
        name: d.name,
        dirPath: path.join(SPECS_DIR, d.name),
      }));

    // Simula injeção de Status: Draft na spec 056 (> 055)
    const mockFileReader = (filePath: string) => {
      if (filePath.includes('056-monte-carlo-backlog-forecast')) {
        return '# Spec 056\n**Status**: Draft\n## Descrição';
      }
      return fs.readFileSync(filePath, 'utf-8');
    };

    const result = validateSpecsGovernance(specDirs, new Set(), mockFileReader);
    expect(result.divergentDelivered.length).toBeGreaterThanOrEqual(1);
    expect(
      result.divergentDelivered.some((msg) => msg.includes('056-monte-carlo-backlog-forecast')),
    ).toBe(true);
  });

  it('should immediately detect and fail if undated Implemented & Verified is injected into spec 058 (verificação adversarial do gate)', () => {
    const specDirs = fs
      .readdirSync(SPECS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
      .map((d) => ({
        num: parseInt(d.name.substring(0, 3), 10),
        name: d.name,
        dirPath: path.join(SPECS_DIR, d.name),
      }));

    // Simula injeção de Status sem data na spec 058
    const mockFileReader = (filePath: string) => {
      if (filePath.includes('058-flow-leverage-simulator')) {
        return '# Spec 058\n**Status**: Implemented & Verified\n## Descrição';
      }
      return fs.readFileSync(filePath, 'utf-8');
    };

    const result = validateSpecsGovernance(specDirs, new Set(), mockFileReader);
    expect(result.divergentDelivered.length).toBeGreaterThanOrEqual(1);
    expect(
      result.divergentDelivered.some((msg) => msg.includes('058-flow-leverage-simulator')),
    ).toBe(true);
  });

  // Test 2: OPP-011 / FR-004
  it('should ensure spec 023 has zero [NEEDS CLARIFICATION] markers and formalizes TBAC/local-first rules', () => {
    const spec023Path = path.join(SPECS_DIR, '023-team-access-control', 'spec.md');
    expect(fs.existsSync(spec023Path), 'spec 023 must exist').toBe(true);

    const content = fs.readFileSync(spec023Path, 'utf-8');
    const clarificationMarkers = content.match(/\[NEEDS CLARIFICATION/g) || [];
    expect(clarificationMarkers.length, 'Spec 023 must have 0 [NEEDS CLARIFICATION] markers').toBe(
      0,
    );

    // Verify key architectural decisions are present
    expect(content).toContain('Soberania Local-First');
    expect(content).toContain('somente-leitura');
    expect(content).toContain('squad');
  });

  // Test 3: OPP-012 / FR-005
  it('should ensure legacy task files specs/005 to specs/009 have zero pending tasks (- [ ]) and have historical headers', () => {
    const legacyNumbers = [5, 6, 7, 8, 9];

    legacyNumbers.forEach((num) => {
      const prefix = String(num).padStart(3, '0');
      const dirs = fs.readdirSync(SPECS_DIR).filter((d) => d.startsWith(`${prefix}-`));
      expect(dirs.length, `Directory for feature ${prefix} must exist`).toBe(1);

      const tasksPath = path.join(SPECS_DIR, dirs[0], 'tasks.md');
      expect(fs.existsSync(tasksPath), `tasks.md for feature ${prefix} must exist`).toBe(true);

      const content = fs.readFileSync(tasksPath, 'utf-8');
      const uncheckedLines = content.split('\n').filter((l) => /^\s*-\s*\[\s*\]/.test(l));
      expect(
        uncheckedLines.length,
        `Feature ${dirs[0]} has ${uncheckedLines.length} unchecked tasks`,
      ).toBe(0);
      expect(content).toMatch(/Entrega Histórica|Spec histórica/);
    });
  });

  // Test 4: OPP-017 / FR-006
  it('should ensure browser parity checklist in spec 026 has formal Environment Block recorded', () => {
    const parityChecklistPath = path.join(
      SPECS_DIR,
      '026-cross-browser-column-layout',
      'checklists',
      'browser-parity.md',
    );
    expect(fs.existsSync(parityChecklistPath), 'browser-parity.md must exist').toBe(true);

    const content = fs.readFileSync(parityChecklistPath, 'utf-8');
    expect(content).toMatch(/Bloqueio de Ambiente|Environment Block/i);
  });

  // Test 5: OPP-013 / FR-007
  it('should ensure obsolete merged branches are safely deleted locally', () => {
    const obsoleteBranches = [
      '019-monte-carlo-simulation',
      '020-wip-aging-chart',
      '021-throughput-histogram-timeline',
      '022-theme-configuration',
      '023-team-access-control',
      '024-task-types-and-linking',
      '025-blocked-task-movement-lock',
      '026-cross-browser-column-layout',
      '027-card-subtasks-and-comments',
      '028-admin-menu-header-layout',
      '029-workspace-hub-and-settings',
      '031-premium-board-management',
      '032-task-comment-autosave',
      '035-clickup-task-activity-redesign',
    ];

    let branchOutput = '';
    try {
      branchOutput = execSync('git branch', { cwd: ROOT_DIR, encoding: 'utf-8' });
    } catch {
      // In CI environments where git is not installed or detached HEAD
      return;
    }

    const currentBranches = branchOutput
      .split('\n')
      .map((b) => b.trim().replace(/^\*\s*/, ''))
      .filter(Boolean);

    const remainingObsolete = obsoleteBranches.filter((ob) => currentBranches.includes(ob));
    expect(
      remainingObsolete,
      `Found obsolete merged branches still present locally: ${remainingObsolete.join(', ')}`,
    ).toEqual([]);
  });
});
