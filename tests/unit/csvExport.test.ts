import { describe, it, expect } from 'vitest';
import { escapeCsvValue, buildTasksCsv, buildSprintsCsv } from '../../src/utils/csvExport';
import { BoardState, SprintModel, TaskModel } from '../../src/types/kanban';

/** Feature 041 — serialização CSV pura. */
const board: BoardState = {
  columns: [
    { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ],
  tasks: {
    todo: [
      {
        id: 't1',
        title: 'Corrigir bug, "crítico"',
        column: 'todo',
        createdAt: '2026-09-01T10:00:00Z',
        priority: 'high',
        assignee: 'Ana',
        estimation: 5,
        sprintId: 'sp1',
        tags: ['Backend', 'API'],
        lastMovedAt: '2026-09-02T10:00:00Z',
      },
    ],
    done: [
      {
        id: 't2',
        title: 'Deploy',
        column: 'done',
        createdAt: '2026-09-01T09:00:00Z',
        completedAt: '2026-09-03T09:00:00Z',
      },
    ],
  },
  sprints: [{ id: 'sp1', name: 'Sprint 1', status: 'active', createdAt: '2026-09-01T00:00:00Z' }],
  activeSprintId: 'sp1',
};

describe('csvExport (Feature 041)', () => {
  it('escapes commas, quotes and newlines (RFC 4180)', () => {
    expect(escapeCsvValue('simple')).toBe('simple');
    expect(escapeCsvValue('a,b')).toBe('"a,b"');
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"');
    expect(escapeCsvValue(undefined)).toBe('');
    expect(escapeCsvValue(null)).toBe('');
    expect(escapeCsvValue(5)).toBe('5');
  });

  it('builds a header-only CSV for empty input (FR-005)', () => {
    const empty: BoardState = { columns: board.columns, tasks: { todo: [], done: [] } };
    const csv = buildTasksCsv(empty);
    expect(csv.split('\n')).toHaveLength(1);
    expect(csv).toContain('titulo');
  });

  it('exports one row per task with header and escaped cells', () => {
    const csv = buildTasksCsv(board);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 tasks
    expect(lines[0]).toContain('coluna');
    expect(csv).toContain('"Corrigir bug, ""crítico"""');
    expect(csv).toContain('Sprint 1');
    expect(csv).toContain('Backend; API');
  });

  it('exports sprint summaries with derived counts and points', () => {
    const sprints: SprintModel[] = [
      { id: 'sp1', name: 'Sprint 1', status: 'active', createdAt: '2026-09-01T00:00:00Z' },
    ];
    const tasks: TaskModel[] = [
      {
        id: 'a',
        title: 'A',
        column: 'todo',
        createdAt: '2026-09-01',
        sprintId: 'sp1',
        estimation: 3,
        completedAt: '2026-09-02',
      },
      {
        id: 'b',
        title: 'B',
        column: 'todo',
        createdAt: '2026-09-01',
        sprintId: 'sp1',
        estimation: 5,
      },
    ];
    const csv = buildSprintsCsv(sprints, tasks);
    const [, row] = csv.split('\n');
    const cells = row.split(',');
    expect(cells[1]).toBe('Sprint 1');
    expect(cells[5]).toBe('2'); // tarefas
    expect(cells[6]).toBe('1'); // concluídas
    expect(cells[7]).toBe('8'); // pontos comprometidos
    expect(cells[8]).toBe('3'); // pontos concluídos
  });

  it('builds a header-only sprint CSV when there are no sprints', () => {
    expect(buildSprintsCsv(undefined, []).split('\n')).toHaveLength(1);
  });
});
