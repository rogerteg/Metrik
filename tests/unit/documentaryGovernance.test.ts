import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = path.resolve(__dirname, '../../');
const SPECS_DIR = path.join(ROOT_DIR, 'specs');

describe('Documentary Governance Guard (Feature 050 - Roadmap Phase 2)', () => {
  // Test 1: OPP-010 / FR-001, FR-002, FR-003
  it('should ensure all delivered specs have canonical "Implemented & Verified" status and active specs remain Draft', () => {
    const deliveredRange = [
      ...Array.from({ length: 42 }, (_, i) => i + 1), // 001 to 042
      44,
      45,
      46,
      47, // 044 to 047
    ];
    const inProgressFeatures = [48, 49, 50]; // 048, 049, 050

    const specDirs = fs
      .readdirSync(SPECS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
      .map((d) => ({
        num: parseInt(d.name.substring(0, 3), 10),
        name: d.name,
        dirPath: path.join(SPECS_DIR, d.name),
      }));

    const statusCanonicalRegex = /^\*\*Status\*\*:\s*Implemented & Verified/m;
    const statusDraftRegex = /^\*\*Status\*\*:\s*Draft/m;

    const divergentDelivered: string[] = [];

    deliveredRange.forEach((num) => {
      const match = specDirs.find((d) => d.num === num);
      if (!match) {
        divergentDelivered.push(`Feature ${num}: Spec directory missing`);
        return;
      }
      const specPath = path.join(match.dirPath, 'spec.md');
      if (!fs.existsSync(specPath)) {
        divergentDelivered.push(`Feature ${match.name}: spec.md missing`);
        return;
      }
      const content = fs.readFileSync(specPath, 'utf-8');
      if (!statusCanonicalRegex.test(content)) {
        divergentDelivered.push(`Feature ${match.name}: status is not "Implemented & Verified"`);
      }
    });

    expect(
      divergentDelivered,
      `Found delivered specs with divergent status: \n${divergentDelivered.join('\n')}`,
    ).toEqual([]);

    inProgressFeatures.forEach((num) => {
      const match = specDirs.find((d) => d.num === num);
      if (match) {
        const specPath = path.join(match.dirPath, 'spec.md');
        if (fs.existsSync(specPath)) {
          const content = fs.readFileSync(specPath, 'utf-8');
          expect(
            statusDraftRegex.test(content),
            `In-progress feature ${match.name} should have Status: Draft`,
          ).toBe(true);
        }
      }
    });
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
