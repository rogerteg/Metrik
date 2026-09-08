import { BoardState, ColumnType, WipLimitsState } from '../types/kanban';

export const INITIAL_SEED_TASKS: BoardState = {
  [ColumnType.TO_DO]: [
    {
      id: 'task-seed-01',
      title: 'Definir métricas essenciais do ciclo ágil (Lead Time e Cycle Time)',
      column: ColumnType.TO_DO,
      createdAt: '2026-09-08T10:00:00.000Z',
    },
    {
      id: 'task-seed-02',
      title: 'Configurar limites de WIP para evitar gargalos',
      column: ColumnType.TO_DO,
      createdAt: '2026-09-08T10:05:00.000Z',
    },
  ],
  [ColumnType.IN_PROGRESS]: [
    {
      id: 'task-seed-03',
      title: 'Desenvolver motor reativo de persistência com LocalStorage',
      column: ColumnType.IN_PROGRESS,
      createdAt: '2026-09-08T10:30:00.000Z',
      startedAt: '2026-09-08T11:00:00.000Z',
    },
  ],
  [ColumnType.BLOCKED]: [
    {
      id: 'task-seed-04',
      title: 'Aguardando validação do contrato de schema de dados',
      column: ColumnType.BLOCKED,
      createdAt: '2026-09-08T11:00:00.000Z',
      startedAt: '2026-09-08T11:15:00.000Z',
    },
  ],
  [ColumnType.COMPLETED]: [
    {
      id: 'task-seed-05',
      title: 'Especificar e aprovar a feature 001-core-kanban-board com SpecKit',
      column: ColumnType.COMPLETED,
      createdAt: '2026-09-08T09:00:00.000Z',
      startedAt: '2026-09-08T09:15:00.000Z',
      completedAt: '2026-09-08T10:00:00.000Z',
    },
  ],
};

export const INITIAL_WIP_LIMITS: WipLimitsState = {
  [ColumnType.TO_DO]: null,
  [ColumnType.IN_PROGRESS]: 3,
  [ColumnType.BLOCKED]: 2,
  [ColumnType.COMPLETED]: null,
};

/**
 * Valida defensivamente se o objeto recuperado do storage é um BoardState válido.
 */
export function isValidBoardState(data: unknown): data is BoardState {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as Record<string, unknown>;
  const requiredColumns = [
    ColumnType.TO_DO,
    ColumnType.IN_PROGRESS,
    ColumnType.BLOCKED,
    ColumnType.COMPLETED,
  ];

  for (const col of requiredColumns) {
    if (!Array.isArray(candidate[col])) {
      return false;
    }
  }

  return true;
}

/**
 * Valida defensivamente se o objeto recuperado do storage é um WipLimitsState válido.
 */
export function isValidWipLimitsState(data: unknown): data is WipLimitsState {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as Record<string, unknown>;
  const requiredColumns = [
    ColumnType.TO_DO,
    ColumnType.IN_PROGRESS,
    ColumnType.BLOCKED,
    ColumnType.COMPLETED,
  ];

  for (const col of requiredColumns) {
    if (!(col in candidate)) return false;
    const val = candidate[col];
    if (val !== null && (typeof val !== 'number' || val < 1 || !Number.isInteger(val))) {
      return false;
    }
  }

  return true;
}
