/**
 * Metrik Work Item Types & Relational Linking Domain Types
 * Feature: 024-task-types-and-linking
 * Specifications:
 * - specs/024-task-types-and-linking/spec.md
 * - specs/024-task-types-and-linking/data-model.md
 */

export type TaskType = 'card' | 'subtask' | 'initiative';

export interface TaskTypeConfig {
  type: TaskType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgVar: string;
  textVar: string;
  borderVar: string;
  description: string;
}

export const TASK_TYPE_CONFIGS: Record<TaskType, TaskTypeConfig> = {
  initiative: {
    type: 'initiative',
    label: 'Iniciativa',
    shortLabel: 'Iniciativa',
    icon: '🎯',
    color: '#8b5cf6',
    bgVar: 'rgba(139, 92, 246, 0.15)',
    textVar: '#a78bfa',
    borderVar: 'rgba(139, 92, 246, 0.35)',
    description: 'Objetivo estratégico ou entrega macro que agrupa múltiplos cartões',
  },
  card: {
    type: 'card',
    label: 'Card',
    shortLabel: 'Card',
    icon: '📋',
    color: '#3b82f6',
    bgVar: 'rgba(59, 130, 246, 0.15)',
    textVar: '#60a5fa',
    borderVar: 'rgba(59, 130, 246, 0.35)',
    description: 'Item padrão de fluxo de trabalho ou história de entrega',
  },
  subtask: {
    type: 'subtask',
    label: 'Subtarefa',
    shortLabel: 'Subtarefa',
    icon: '🔹',
    color: '#06b6d4',
    bgVar: 'rgba(6, 182, 212, 0.15)',
    textVar: '#38bdf8',
    borderVar: 'rgba(6, 182, 212, 0.35)',
    description: 'Item de trabalho granular ou desdobramento de um cartão pai',
  },
};

export type TaskRelationType = 
  | 'parent'         // Esta tarefa é filha da tarefa alvo (alvo é pai)
  | 'child'          // Esta tarefa é pai da tarefa alvo (alvo é filha)
  | 'blocks'         // Esta tarefa bloqueia a tarefa alvo
  | 'is_blocked_by'  // Esta tarefa é bloqueada pela tarefa alvo
  | 'relates_to';    // Associação direta / mútua

export interface TaskRelationConfig {
  type: TaskRelationType;
  label: string;
  inverseLabel: string;
  icon: string;
  badgeClass: string;
}

export const TASK_RELATION_CONFIGS: Record<TaskRelationType, TaskRelationConfig> = {
  parent: {
    type: 'parent',
    label: 'Pertence a (Pai / Superior)',
    inverseLabel: 'Possui como filho',
    icon: '⬆️',
    badgeClass: 'relation-parent',
  },
  child: {
    type: 'child',
    label: 'Sub-item (Filho / Decomposição)',
    inverseLabel: 'É superior de',
    icon: '⬇️',
    badgeClass: 'relation-child',
  },
  blocks: {
    type: 'blocks',
    label: 'Bloqueia',
    inverseLabel: 'É bloqueado por',
    icon: '⛔',
    badgeClass: 'relation-blocks',
  },
  is_blocked_by: {
    type: 'is_blocked_by',
    label: 'É bloqueado por',
    inverseLabel: 'Bloqueia',
    icon: '🔒',
    badgeClass: 'relation-blocked-by',
  },
  relates_to: {
    type: 'relates_to',
    label: 'Relacionado com',
    inverseLabel: 'Relacionado com',
    icon: '🔗',
    badgeClass: 'relation-relates',
  },
};

/**
 * Função utilitária pura para obter a relação recíproca inversa.
 */
export function getReciprocalRelation(relation: TaskRelationType): TaskRelationType {
  switch (relation) {
    case 'parent': return 'child';
    case 'child': return 'parent';
    case 'blocks': return 'is_blocked_by';
    case 'is_blocked_by': return 'blocks';
    case 'relates_to': return 'relates_to';
  }
}

/**
 * Estrutura normalizada de um vínculo persistido no array links da tarefa.
 */
export interface TaskLinkModel {
  /** Identificador único do link (UUID v4) */
  id: string;

  /** ID da tarefa vinculada */
  targetTaskId: string;

  /** Tipo de relacionamento a partir desta tarefa */
  relationType: TaskRelationType;

  /** ID do quadro onde a tarefa reside */
  targetBoardId: string;

  /** ID da squad/time à qual a tarefa pertence */
  targetTeamId: string;

  /** Timestamp ISO-8601 da criação do vínculo */
  createdAt: string;
}

/**
 * Resumo seguro de uma tarefa de qualquer squad para visualização contextual
 */
export interface CrossSquadTaskSummary {
  taskId: string;
  taskTitle: string;
  taskType: TaskType;
  columnId: string;
  columnTitle: string;
  columnCategory: 'todo' | 'in_progress' | 'done';
  boardId: string;
  boardName: string;
  teamId: string;
  teamName: string;
  isExternalSquad: boolean;
  isDone: boolean;
}
