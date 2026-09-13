import { describe, it, expect } from 'vitest';
import { TaskModel, ColumnModel } from '../../src/types/kanban';
import {
  getReciprocalRelation,
  addBidirectionalLink,
  removeBidirectionalLink,
  cleanupOrphanedLinks,
  calculateInitiativeProgress,
  getPendingBlockers,
} from '../../src/utils/taskRelations';

describe('Feature 024: Task Relations & Work Item Types Utilities', () => {
  const dummyColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'col-doing', title: 'Em Progresso', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
    { id: 'col-done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const createTask = (id: string, title: string, column = 'col-todo', type: 'card' | 'subtask' | 'initiative' = 'card'): TaskModel => ({
    id,
    title,
    column,
    createdAt: new Date().toISOString(),
    type,
    links: [],
  });

  describe('getReciprocalRelation', () => {
    it('returns reciprocal inverse for all relation types', () => {
      expect(getReciprocalRelation('parent')).toBe('child');
      expect(getReciprocalRelation('child')).toBe('parent');
      expect(getReciprocalRelation('blocks')).toBe('is_blocked_by');
      expect(getReciprocalRelation('is_blocked_by')).toBe('blocks');
      expect(getReciprocalRelation('relates_to')).toBe('relates_to');
    });
  });

  describe('addBidirectionalLink', () => {
    it('adds reciprocal link between two tasks', () => {
      const taskA = createTask('task-1', 'Tarefa A');
      const taskB = createTask('task-2', 'Tarefa B');

      const { updatedSource, updatedTarget } = addBidirectionalLink({
        sourceTask: taskA,
        targetTask: taskB,
        relationType: 'blocks',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      expect(updatedSource.links).toHaveLength(1);
      expect(updatedSource.links![0].targetTaskId).toBe('task-2');
      expect(updatedSource.links![0].relationType).toBe('blocks');

      expect(updatedTarget.links).toHaveLength(1);
      expect(updatedTarget.links![0].targetTaskId).toBe('task-1');
      expect(updatedTarget.links![0].relationType).toBe('is_blocked_by');
    });

    it('prevents self-linking', () => {
      const taskA = createTask('task-1', 'Tarefa A');
      const { updatedSource, updatedTarget } = addBidirectionalLink({
        sourceTask: taskA,
        targetTask: taskA,
        relationType: 'blocks',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      expect(updatedSource.links).toHaveLength(0);
      expect(updatedTarget.links).toHaveLength(0);
    });

    it('prevents duplicate links between the same tasks', () => {
      const taskA = createTask('task-1', 'Tarefa A');
      const taskB = createTask('task-2', 'Tarefa B');

      const first = addBidirectionalLink({
        sourceTask: taskA,
        targetTask: taskB,
        relationType: 'relates_to',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      const second = addBidirectionalLink({
        sourceTask: first.updatedSource,
        targetTask: first.updatedTarget,
        relationType: 'relates_to',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      expect(second.updatedSource.links).toHaveLength(1);
      expect(second.updatedTarget.links).toHaveLength(1);
    });
  });

  describe('removeBidirectionalLink', () => {
    it('removes links from both tasks cleanly', () => {
      const taskA = createTask('task-1', 'Tarefa A');
      const taskB = createTask('task-2', 'Tarefa B');

      const linked = addBidirectionalLink({
        sourceTask: taskA,
        targetTask: taskB,
        relationType: 'parent',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      const unlinked = removeBidirectionalLink(linked.updatedSource, linked.updatedTarget);
      expect(unlinked.updatedSource.links).toHaveLength(0);
      expect(unlinked.updatedTarget.links).toHaveLength(0);
    });
  });

  describe('cleanupOrphanedLinks', () => {
    it('purges references to deleted task from remaining tasks', () => {
      const taskA = createTask('task-1', 'Tarefa A');
      const taskB = createTask('task-2', 'Tarefa B');
      const taskC = createTask('task-3', 'Tarefa C');

      const linkedAB = addBidirectionalLink({
        sourceTask: taskA,
        targetTask: taskB,
        relationType: 'blocks',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      const linkedBC = addBidirectionalLink({
        sourceTask: linkedAB.updatedTarget,
        targetTask: taskC,
        relationType: 'relates_to',
        sourceBoardId: 'board-1',
        targetBoardId: 'board-1',
        sourceTeamId: 'team-1',
        targetTeamId: 'team-1',
      });

      // Now delete task-2 (taskB). Remaining tasks are taskA and taskC
      const cleaned = cleanupOrphanedLinks([linkedAB.updatedSource, linkedBC.updatedTarget], 'task-2');
      
      expect(cleaned[0].links).toHaveLength(0);
      expect(cleaned[1].links).toHaveLength(0);
    });
  });

  describe('calculateInitiativeProgress', () => {
    it('returns zero when initiative has no child tasks', () => {
      const initiative = createTask('init-1', 'Iniciativa Macro', 'col-doing', 'initiative');
      const progress = calculateInitiativeProgress(initiative, [initiative], dummyColumns);
      expect(progress).toEqual({ total: 0, completed: 0, percentage: 0 });
    });

    it('calculates correct percentage of completed children', () => {
      const initiative = createTask('init-1', 'Iniciativa Macro', 'col-doing', 'initiative');
      const child1 = createTask('card-1', 'Card 1', 'col-done', 'card');
      const child2 = createTask('card-2', 'Card 2', 'col-todo', 'card');
      const child3 = createTask('card-3', 'Card 3', 'col-done', 'card');
      const child4 = createTask('card-4', 'Card 4', 'col-doing', 'card');

      // Link children to initiative (initiative is parent, so relation on initiative is 'child')
      initiative.links = [
        { id: 'l1', targetTaskId: 'card-1', relationType: 'child', targetBoardId: 'b1', targetTeamId: 't1', createdAt: '' },
        { id: 'l2', targetTaskId: 'card-2', relationType: 'child', targetBoardId: 'b1', targetTeamId: 't1', createdAt: '' },
        { id: 'l3', targetTaskId: 'card-3', relationType: 'child', targetBoardId: 'b1', targetTeamId: 't1', createdAt: '' },
        { id: 'l4', targetTaskId: 'card-4', relationType: 'child', targetBoardId: 'b1', targetTeamId: 't1', createdAt: '' },
      ];

      const allTasks = [initiative, child1, child2, child3, child4];
      const progress = calculateInitiativeProgress(initiative, allTasks, dummyColumns);

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(2);
      expect(progress.percentage).toBe(50);
    });
  });

  describe('getPendingBlockers', () => {
    it('identifies tasks blocking current task that are not in done category', () => {
      const currentTask = createTask('task-target', 'Tarefa Alvo', 'col-todo', 'card');
      const blocker1 = createTask('blocker-1', 'Bloqueador 1', 'col-doing', 'card');
      const blocker2 = createTask('blocker-2', 'Bloqueador 2 (Concluído)', 'col-done', 'card');

      currentTask.links = [
        { id: 'l1', targetTaskId: 'blocker-1', relationType: 'is_blocked_by', targetBoardId: 'b1', targetTeamId: 't1', createdAt: '' },
        { id: 'l2', targetTaskId: 'blocker-2', relationType: 'is_blocked_by', targetBoardId: 'b1', targetTeamId: 't1', createdAt: '' },
      ];

      const allTasks = [currentTask, blocker1, blocker2];
      const pending = getPendingBlockers(currentTask, allTasks, dummyColumns);

      expect(pending).toHaveLength(1);
      expect(pending[0].taskId).toBe('blocker-1');
      expect(pending[0].taskTitle).toBe('Bloqueador 1');
    });
  });
});
