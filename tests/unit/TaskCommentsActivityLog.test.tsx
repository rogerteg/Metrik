import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { createTaskActivityEvent, AuditDescriptions } from '../../src/utils/taskActivityLogger';

describe('Feature 033 - Task Comments & Activity Audit Log', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('1. Task Activity Logger Utility', () => {
    it('creates a structured activity event with default user', () => {
      const event = createTaskActivityEvent({
        taskId: 'task-1',
        eventType: 'moved',
        description: AuditDescriptions.moved('A Fazer', 'Em Progresso', 'Rogerio Teixeira'),
        fromValue: 'A Fazer',
        toValue: 'Em Progresso',
      });

      expect(event.id).toBeDefined();
      expect(event.taskId).toBe('task-1');
      expect(event.eventType).toBe('moved');
      expect(event.userName).toBe('Usuário do Sistema');
      expect(event.description).toContain('Movido da coluna "A Fazer" para "Em Progresso"');
      expect(event.timestamp).toBeDefined();
    });

    it('creates activity event with explicit user details', () => {
      const event = createTaskActivityEvent({
        taskId: 'task-2',
        eventType: 'comment_added',
        description: AuditDescriptions.commentAdded('Ana Silva'),
        user: { id: 'usr-123', name: 'Ana Silva' },
      });

      expect(event.userId).toBe('usr-123');
      expect(event.userName).toBe('Ana Silva');
      expect(event.description).toBe('Comentário adicionado por Ana Silva');
    });
  });

  describe('2. Comment Management in useTaskCollection', () => {
    it('adds a valid plain text comment to a task and logs comment_added event', () => {
      const { result } = renderHook(() => useTaskCollection('board-test-1'));

      const initialTask = result.current.addTask('col-todo', 'Tarefa de Teste para Comentários');

      act(() => {
        result.current.addTaskComment(initialTask.id, 'Primeira atualização importante\nCom segunda linha de contexto.', {
          id: 'usr-rogerio',
          name: 'Rogerio Teixeira',
        });
      });

      const updatedTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.comments).toHaveLength(1);
      expect(updatedTask?.comments?.[0].text).toBe('Primeira atualização importante\nCom segunda linha de contexto.');
      expect(updatedTask?.comments?.[0].userName).toBe('Rogerio Teixeira');

      expect(updatedTask?.activityLog).toHaveLength(1);
      expect(updatedTask?.activityLog?.[0].eventType).toBe('comment_added');
      expect(updatedTask?.activityLog?.[0].description).toContain('Comentário adicionado por Rogerio Teixeira');
    });

    it('prevents adding empty or whitespace-only comments', () => {
      const { result } = renderHook(() => useTaskCollection('board-test-2'));
      const initialTask = result.current.addTask('col-todo', 'Tarefa Teste Vazio');

      act(() => {
        result.current.addTaskComment(initialTask.id, '   ');
      });

      const updatedTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      expect(updatedTask?.comments ?? []).toHaveLength(0);
      expect(updatedTask?.activityLog ?? []).toHaveLength(0);
    });

    it('deletes a comment and records comment_deleted event', () => {
      const { result } = renderHook(() => useTaskCollection('board-test-3'));
      const initialTask = result.current.addTask('col-todo', 'Tarefa para Excluir Comentário');

      act(() => {
        result.current.addTaskComment(initialTask.id, 'Comentário temporário');
      });

      let currentTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      const commentId = currentTask?.comments?.[0].id;
      expect(commentId).toBeDefined();

      act(() => {
        if (commentId) {
          result.current.deleteTaskComment(initialTask.id, commentId, { id: 'usr-admin', name: 'Admin Squad' });
        }
      });

      currentTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      expect(currentTask?.comments).toHaveLength(0);
      expect(currentTask?.activityLog).toHaveLength(2); // comment_added + comment_deleted
      expect(currentTask?.activityLog?.[1].eventType).toBe('comment_deleted');
      expect(currentTask?.activityLog?.[1].description).toContain('Comentário removido por Admin Squad');
    });
  });

  describe('3. Automated Audit Log Generation in Task Mutations', () => {
    it('automatically records audit log when task is moved to another column', () => {
      const { result } = renderHook(() => useTaskCollection('board-test-4'));
      const initialTask = result.current.addTask('col-todo', 'Tarefa Mover Audit');

      const targetColId = result.current.board.columns[1]?.id || 'col-progress';

      act(() => {
        result.current.moveTask(initialTask.id, targetColId);
      });

      const updatedTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      const moveEvent = updatedTask?.activityLog?.find((e) => e.eventType === 'moved');
      expect(moveEvent).toBeDefined();
      expect(moveEvent?.description).toContain('Movido da coluna');
    });

    it('automatically records audit log when task blocked status is toggled', () => {
      const { result } = renderHook(() => useTaskCollection('board-test-5'));
      const initialTask = result.current.addTask('col-todo', 'Tarefa Bloqueio Audit');

      act(() => {
        result.current.toggleTaskBlocked(initialTask.id, 'Aguardando API externa');
      });

      let updatedTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      expect(updatedTask?.blocked).toBe(true);
      const blockEvent = updatedTask?.activityLog?.find((e) => e.eventType === 'blocked');
      expect(blockEvent).toBeDefined();
      expect(blockEvent?.description).toContain('Marcado como bloqueado');

      act(() => {
        result.current.toggleTaskBlocked(initialTask.id);
      });

      updatedTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      expect(updatedTask?.blocked).toBe(false);
      const unblockEvent = updatedTask?.activityLog?.find((e) => e.eventType === 'unblocked');
      expect(unblockEvent).toBeDefined();
      expect(unblockEvent?.description).toContain('Impedimento removido');
    });

    it('automatically records audit log when priority and tags are updated', () => {
      const { result } = renderHook(() => useTaskCollection('board-test-6'));
      const initialTask = result.current.addTask('col-todo', 'Tarefa Tags e Prioridade');

      act(() => {
        result.current.setTaskPriority(initialTask.id, 'urgent');
        result.current.addTaskTag(initialTask.id, 'frontend');
      });

      const updatedTask = Object.values(result.current.board.tasks)
        .flat()
        .find((t) => t.id === initialTask.id);

      expect(updatedTask?.priority).toBe('urgent');
      expect(updatedTask?.tags).toContain('frontend');

      const priorityEvent = updatedTask?.activityLog?.find((e) => e.eventType === 'priority_changed');
      const tagEvent = updatedTask?.activityLog?.find((e) => e.eventType === 'tags_changed');

      expect(priorityEvent).toBeDefined();
      expect(tagEvent).toBeDefined();
    });
  });
});
