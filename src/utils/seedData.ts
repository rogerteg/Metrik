import { BoardState, ColumnModel } from '../types/kanban';

export const DEFAULT_COLUMNS: ColumnModel[] = [
  {
    id: 'todo',
    title: 'To Do',
    category: 'todo',
    wipLimit: null,
    colorScheme: 'todo',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    category: 'in_progress',
    wipLimit: 3,
    colorScheme: 'progress',
  },
  {
    id: 'blocked',
    title: 'Blocked',
    category: 'in_progress',
    wipLimit: 2,
    colorScheme: 'blocked',
  },
  {
    id: 'completed',
    title: 'Completed',
    category: 'done',
    wipLimit: null,
    colorScheme: 'completed',
  },
];

export const INITIAL_SEED_TASKS: BoardState = {
  columns: DEFAULT_COLUMNS,
  tasks: {
    'todo': [
      {
        id: 'task-seed-01',
        title: 'Definir métricas essenciais do ciclo ágil (Lead Time e Cycle Time)',
        column: 'todo',
        createdAt: '2026-09-08T10:00:00.000Z',
      },
      {
        id: 'task-seed-02',
        title: 'Configurar limites de WIP para evitar gargalos',
        column: 'todo',
        createdAt: '2026-09-08T10:05:00.000Z',
      },
    ],
    'in-progress': [
      {
        id: 'task-seed-03',
        title: 'Desenvolver motor reativo de persistência com LocalStorage',
        column: 'in-progress',
        createdAt: '2026-09-08T10:30:00.000Z',
        startedAt: '2026-09-08T11:00:00.000Z',
      },
    ],
    'blocked': [
      {
        id: 'task-seed-04',
        title: 'Aguardando validação do contrato de schema de dados',
        column: 'blocked',
        createdAt: '2026-09-08T11:00:00.000Z',
        startedAt: '2026-09-08T11:15:00.000Z',
      },
    ],
    'completed': [
      {
        id: 'task-seed-05',
        title: 'Especificar e aprovar a feature 001-core-kanban-board com SpecKit',
        column: 'completed',
        createdAt: '2026-08-25T09:00:00.000Z',
        startedAt: '2026-08-25T09:15:00.000Z',
        completedAt: '2026-09-02T10:00:00.000Z',
      },
      {
        id: 'task-seed-06',
        title: 'Implementar hooks de autenticação',
        column: 'completed',
        createdAt: '2026-09-01T09:00:00.000Z',
        startedAt: '2026-09-01T10:00:00.000Z',
        completedAt: '2026-09-05T15:00:00.000Z',
      },
      {
        id: 'task-seed-07',
        title: 'Refatorar componentes de UI',
        column: 'completed',
        createdAt: '2026-09-07T09:00:00.000Z',
        startedAt: '2026-09-07T11:00:00.000Z',
        completedAt: '2026-09-08T17:00:00.000Z',
      },
    ],
  },
};

/**
 * Valida defensivamente se o objeto recuperado do storage é um BoardState V2 válido.
 */
export function isValidBoardState(data: unknown): data is BoardState {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as Record<string, unknown>;
  
  if (!Array.isArray(candidate.columns)) return false;
  if (!candidate.tasks || typeof candidate.tasks !== 'object') return false;

  return true;
}
