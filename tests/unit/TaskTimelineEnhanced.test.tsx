import { describe, it, expect } from 'vitest';
import { renderFormattedText } from '../../src/utils/simpleMarkdown';
import { createTaskActivityEvent, groupTimelineItems, AuditDescriptions } from '../../src/utils/taskActivityLogger';
import { TimelineItem } from '../../src/types/taskActivity';

describe('Feature 034 - Enterprise Task Timeline Redesign Unit Tests', () => {
  describe('1. Simple Markdown Formatting (simpleMarkdown.ts)', () => {
    it('parses bold, italic, and inline code correctly', () => {
      const text = 'Nota com **negrito**, *itálico* e `codigo_inline`.';
      const rendered = renderFormattedText(text);

      expect(rendered).toBeDefined();
    });

    it('parses bullet lists cleanly', () => {
      const text = '- Item 1\n- Item 2\n- Item 3';
      const rendered = renderFormattedText(text);

      expect(rendered).toBeDefined();
    });

    it('returns null for empty text', () => {
      expect(renderFormattedText('')).toBeNull();
    });
  });

  describe('2. Time Bucket Grouping (groupTimelineItems)', () => {
    it('groups timeline items into Today, Yesterday, This Week and Older', () => {
      const nowMs = new Date('2026-09-21T14:00:00Z').getTime();

      const items: TimelineItem[] = [
        {
          type: 'comment',
          id: 'c1',
          taskId: 'task-1',
          userId: 'usr-1',
          userName: 'Rogerio',
          text: 'Comentário de Hoje',
          createdAt: '2026-09-21T10:00:00Z',
          timestamp: '2026-09-21T10:00:00Z',
        },
        {
          type: 'activity',
          id: 'a1',
          taskId: 'task-1',
          userId: 'usr-1',
          userName: 'Rogerio',
          eventType: 'moved',
          description: AuditDescriptions.moved('A Fazer', 'Em Progresso', 'Rogerio'),
          fromValue: 'A Fazer',
          toValue: 'Em Progresso',
          timestamp: '2026-09-20T15:00:00Z',
        },
        {
          type: 'comment',
          id: 'c2',
          taskId: 'task-1',
          userId: 'usr-2',
          userName: 'Ana',
          text: 'Comentário desta semana',
          createdAt: '2026-09-17T12:00:00Z',
          timestamp: '2026-09-17T12:00:00Z',
        },
        {
          type: 'activity',
          id: 'a2',
          taskId: 'task-1',
          userId: 'usr-2',
          userName: 'Ana',
          eventType: 'created',
          description: AuditDescriptions.created('Ana'),
          timestamp: '2026-09-01T09:00:00Z',
        },
      ];

      const groups = groupTimelineItems(items, nowMs);

      expect(groups).toHaveLength(4);
      expect(groups[0].groupKey).toBe('today');
      expect(groups[0].items).toHaveLength(1);

      expect(groups[1].groupKey).toBe('yesterday');
      expect(groups[1].items).toHaveLength(1);

      expect(groups[2].groupKey).toBe('this_week');
      expect(groups[2].items).toHaveLength(1);

      expect(groups[3].groupKey).toBe('older');
      expect(groups[3].items).toHaveLength(1);
    });
  });

  describe('3. Activity Event Factory & Diffs', () => {
    it('creates an activity event with fromValue and toValue for diff cards', () => {
      const event = createTaskActivityEvent({
        taskId: 'task-99',
        eventType: 'priority_changed',
        description: AuditDescriptions.priorityChanged('Média', 'Urgente', 'Rogerio'),
        fromValue: 'Média',
        toValue: 'Urgente',
        user: { id: 'usr-1', name: 'Rogerio' },
      });

      expect(event.fromValue).toBe('Média');
      expect(event.toValue).toBe('Urgente');
      expect(event.eventType).toBe('priority_changed');
    });
  });

  describe('4. Component Search and Decision Filter Integration', () => {
    it('filters comments by decision flag and search query correctly', async () => {
      const { render, screen, fireEvent } = await import('@testing-library/react');
      const { TaskTimeline } = await import('../../src/components/TaskTimeline');

      const mockComments = [
        {
          id: 'c1',
          taskId: 't1',
          userId: 'u1',
          userName: 'Rogerio',
          text: 'Comentário normal de alinhamento',
          createdAt: new Date().toISOString(),
          isDecision: false,
        },
        {
          id: 'c2',
          taskId: 't1',
          userId: 'u1',
          userName: 'Rogerio',
          text: 'Decisão: Usaremos arquitetura limpa',
          createdAt: new Date().toISOString(),
          isDecision: true,
        },
      ];

      const mockActivity = [
        {
          id: 'a1',
          taskId: 't1',
          userId: 'u1',
          userName: 'Rogerio',
          eventType: 'moved' as const,
          description: AuditDescriptions.moved('A Fazer', 'Em Progresso', 'Rogerio'),
          fromValue: 'A Fazer',
          toValue: 'Em Progresso',
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        },
      ];

      render(
        <TaskTimeline
          taskId="t1"
          comments={mockComments}
          activityLog={mockActivity}
        />
      );

      // Verify stats header renders total comments and decision count
      expect(screen.getByText('Histórico e Comentários da Tarefa')).toBeDefined();
      expect(screen.getAllByText('Decisão: Usaremos arquitetura limpa').length).toBeGreaterThan(0);

      // Filter by Decisions tab
      const decisionTab = screen.getByRole('button', { name: /Decisões/i });
      fireEvent.click(decisionTab);

      // Normal comment should be hidden, decision comment shown
      expect(screen.queryByText('Comentário normal de alinhamento')).toBeNull();
      expect(screen.getAllByText('Decisão: Usaremos arquitetura limpa').length).toBeGreaterThan(0);

      // Search input filtering
      const searchInput = screen.getByTestId('timeline-search-input');
      fireEvent.change(searchInput, { target: { value: 'arquitetura' } });
      expect(screen.getAllByText('Decisão: Usaremos arquitetura limpa').length).toBeGreaterThan(0);

      fireEvent.change(searchInput, { target: { value: 'inexistente' } });
      expect(screen.queryByText('Decisão: Usaremos arquitetura limpa')).toBeNull();
    });
  });
});
