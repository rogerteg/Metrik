import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '../../');
const MAX_ALLOWED_LINES = 400;

function countLines(filePath: string): number {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  // Normalize CRLF to LF and split by newline
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  // If the last line is empty due to trailing newline, discount it or keep exact lines
  return lines.length;
}

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
