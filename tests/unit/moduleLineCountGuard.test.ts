import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const MAX_ALLOWED_LINES = 400;

function countLines(filePath: string): number {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  // Normalize CRLF to LF and split by newline
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  return lines.length;
}

function getAllProductionFiles(dir: string, exts: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllProductionFiles(full, exts));
    } else {
      if (exts.some((ext) => file.endsWith(ext)) && !file.endsWith('.d.ts')) {
        results.push(full);
      }
    }
  });
  return results;
}

/**
 * Baseline congelado da dívida técnica legada herdada pré-Feature 049 (Princípios II, III.3 e III.4).
 * Estes 23 arquivos (12 TS/TSX e 11 CSS) possuem tetos máximos fixados.
 * Qualquer acréscimo além do teto é estritamente proibido pelo mecanismo de catraca (ratchet).
 * Apenas reduções são permitidas até que features específicas de refatoração decomponham cada módulo.
 */
export const FROZEN_LEGACY_DEBT_BASELINE: Record<string, number> = {
  // 12 Módulos TypeScript / TSX Legados
  'src/components/charts/CumulativeFlowChart.tsx': 822,
  'src/components/TeamManagementModal.tsx': 604,
  'src/services/supabase/syncService.ts': 593,
  'src/components/Column.tsx': 554,
  'src/utils/flowReportExporter.ts': 538,
  'src/components/FlowRules/FlowRuleBuilder.tsx': 531,
  'src/components/charts/CycleTimeScatterPlot.tsx': 500,
  'src/hooks/useTeamAccess.ts': 482,
  'src/components/TaskMetadataSidebar.tsx': 441,
  'src/components/ThroughputAnalyticsView.tsx': 441,
  'src/components/Settings/CloudSyncTab.tsx': 425,
  'src/components/charts/WipAgingChart.tsx': 414,

  // 11 Módulos CSS Legados
  'src/components/Analytics.css': 3257,
  'src/styles/01-design-system-core.css': 1122,
  'src/components/TaskActivityFeed.css': 988,
  'src/components/ManageBoards/ManageBoards.css': 871,
  'src/components/Settings/Settings.css': 870,
  'src/components/TaskDetailsModal.css': 841,
  'src/styles/02-task-detail-inline.css': 736,
  'src/styles/12-workspace.css': 668,
  'src/components/FlowRules/FlowRules.css': 600,
  'src/styles/03-priority-tags-filters.css': 580,
  'src/components/Mika/MikaChatInterface.css': 476,
};

describe('Module Line Count Guard (Feature 049 - OPP-002 / Constituição Artigo II)', () => {
  const targetModules = [
    { name: 'Task.tsx', path: path.join(ROOT_DIR, 'src/components/Task.tsx'), maxTarget: 200 },
    {
      name: 'TaskDetailsModal.tsx',
      path: path.join(ROOT_DIR, 'src/components/TaskDetailsModal.tsx'),
      maxTarget: 250,
    },
    {
      name: 'useTaskCollection.ts',
      path: path.join(ROOT_DIR, 'src/hooks/useTaskCollection.ts'),
      maxTarget: 220,
    },
    { name: 'App.tsx', path: path.join(ROOT_DIR, 'src/App.tsx'), maxTarget: 250 },
  ];

  targetModules.forEach(({ name, path: modPath, maxTarget }) => {
    it(`should ensure ${name} does not exceed the constitutional limit of ${MAX_ALLOWED_LINES} lines (target <= ${maxTarget})`, () => {
      const lineCount = countLines(modPath);
      expect(
        lineCount,
        `File ${name} has ${lineCount} lines, which exceeds constitutional limit of ${MAX_ALLOWED_LINES} lines!`,
      ).toBeLessThanOrEqual(MAX_ALLOWED_LINES);
    });
  });

  it('should ensure all extracted subcomponents and sub-hooks do not exceed 400 lines each', () => {
    const subDirs = [
      path.join(ROOT_DIR, 'src/components/Task'),
      path.join(ROOT_DIR, 'src/components/TaskDetailsModal'),
      path.join(ROOT_DIR, 'src/components/App'),
      path.join(ROOT_DIR, 'src/hooks/taskCollection'),
    ];

    const standaloneHookFiles = [
      path.join(ROOT_DIR, 'src/hooks/useCrossSquadLinking.ts'),
      path.join(ROOT_DIR, 'src/hooks/useGuardedTaskMove.ts'),
      path.join(ROOT_DIR, 'src/hooks/useAppModals.ts'),
      path.join(ROOT_DIR, 'src/hooks/useDynamicSle.ts'),
    ];

    const violations: { file: string; lines: number }[] = [];

    subDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f));
      files.forEach((file) => {
        const fullPath = path.join(dir, file);
        const lines = countLines(fullPath);
        if (lines > MAX_ALLOWED_LINES) {
          violations.push({ file: `${path.basename(dir)}/${file}`, lines });
        }
      });
    });

    standaloneHookFiles.forEach((fullPath) => {
      if (!fs.existsSync(fullPath)) return;
      const lines = countLines(fullPath);
      if (lines > MAX_ALLOWED_LINES) {
        violations.push({ file: path.basename(fullPath), lines });
      }
    });

    expect(
      violations,
      `Detected subcomponents exceeding ${MAX_ALLOWED_LINES} lines: ${JSON.stringify(violations)}`,
    ).toHaveLength(0);
  });
});

describe('Comprehensive Production Codebase Line Ceiling Guard (Constituição Artigo II & Princípio III)', () => {
  it('should ensure ALL production files in src/**/*.{ts,tsx,css} adhere to <= 400 lines unless explicitly tracked in frozen legacy baseline', () => {
    const allProdFiles = getAllProductionFiles(SRC_DIR, ['.ts', '.tsx', '.css']);
    expect(allProdFiles.length).toBeGreaterThan(200);

    const violations: { file: string; lines: number }[] = [];

    allProdFiles.forEach((fullPath) => {
      const relPosixPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
      const lines = countLines(fullPath);

      if (lines > MAX_ALLOWED_LINES && !(relPosixPath in FROZEN_LEGACY_DEBT_BASELINE)) {
        violations.push({ file: relPosixPath, lines });
      }
    });

    expect(
      violations,
      `Found ${violations.length} unapproved file(s) exceeding ${MAX_ALLOWED_LINES} lines: ${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('should ensure no file in frozen legacy debt baseline exceeds its recorded ceiling (ratchet mechanism)', () => {
    const ratchetViolations: { file: string; actual: number; ceiling: number }[] = [];

    for (const [relPosixPath, ceiling] of Object.entries(FROZEN_LEGACY_DEBT_BASELINE)) {
      const fullPath = path.join(ROOT_DIR, relPosixPath);
      const actual = countLines(fullPath);

      if (actual > ceiling) {
        ratchetViolations.push({ file: relPosixPath, actual, ceiling });
      }
    }

    expect(
      ratchetViolations,
      `Legacy debt expansion detected! Files exceeding frozen ratchet ceiling: ${JSON.stringify(ratchetViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('should ensure the legacy debt baseline contains only existing files and does not expand in count', () => {
    const missingFiles: string[] = [];

    for (const relPosixPath of Object.keys(FROZEN_LEGACY_DEBT_BASELINE)) {
      const fullPath = path.join(ROOT_DIR, relPosixPath);
      if (!fs.existsSync(fullPath)) {
        missingFiles.push(relPosixPath);
      }
    }

    expect(
      missingFiles,
      `Legacy baseline references non-existent files: ${JSON.stringify(missingFiles)}`,
    ).toEqual([]);
    expect(Object.keys(FROZEN_LEGACY_DEBT_BASELINE).length).toBeLessThanOrEqual(23);
  });
});
