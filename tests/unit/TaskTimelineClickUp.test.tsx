import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTimeline } from '../../src/components/TaskTimeline';
import { ActivityLogItem } from '../../src/components/ActivityLogItem';
import { CommentInputForm } from '../../src/components/CommentInputForm';
import { CommentItem } from '../../src/components/CommentItem';
import { parseSimpleMarkdown } from '../../src/utils/simpleMarkdown';
import { formatDiffPill } from '../../src/utils/taskActivityLogger';
import { TaskComment, TaskActivityLog } from '../../src/types/taskActivity';

describe('TaskTimelineClickUp - Feature 035 Suite', () => {
  const mockComments: TaskComment[] = [
    {
      id: 'c1',
      taskId: 't1',
      userId: 'u1',
      userName: 'Alice',
      text: 'Este é um **comentário normal** com `código`.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c2',
      taskId: 't1',
      userId: 'u2',
      userName: 'Bob',
      text: 'Decidimos utilizar a API v2 para a integração.',
      isDecision: true,
      pinned: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const mockActivity: TaskActivityLog[] = [
    {
      id: 'a1',
      taskId: 't1',
      userId: 'u1',
      userName: 'Alice',
      eventType: 'moved',
      description: 'Movido de Em Progresso para Concluído',
      fromValue: 'Em Progresso',
      toValue: 'Concluído',
      timestamp: new Date().toISOString(),
    },
  ];

  describe('SVG Sizing Security (FR-001 & SC-001)', () => {
    it('renders timeline with SVG icons bounded to <= 20px', () => {
      const { container } = render(
        <TaskTimeline taskId="t1" comments={mockComments} activityLog={mockActivity} />
      );

      const svgElements = container.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);

      svgElements.forEach((svg) => {
        const widthAttr = svg.getAttribute('width');
        const heightAttr = svg.getAttribute('height');
        
        if (widthAttr) {
          expect(parseInt(widthAttr, 10)).toBeLessThanOrEqual(20);
        }
        if (heightAttr) {
          expect(parseInt(heightAttr, 10)).toBeLessThanOrEqual(20);
        }
      });
    });
  });

  describe('ClickUp Diff Formatters & ActivityLogItem (FR-006)', () => {
    it('formats diff pills correctly with formatDiffPill', () => {
      expect(formatDiffPill('A fazer', 'Em Progresso')).toBe('A fazer ➔ Em Progresso');
      expect(formatDiffPill(undefined, 'Concluído')).toBe('➔ Concluído');
      expect(formatDiffPill('Em Progresso', undefined)).toBe('Em Progresso ➔ Removido');
      expect(formatDiffPill()).toBeNull();
    });

    it('renders ActivityLogItem with compact diff pill', () => {
      render(<ActivityLogItem activity={mockActivity[0]} />);
      expect(screen.getByTestId('activity-diff-card')).toHaveTextContent(/Em Progresso/);
      expect(screen.getByTestId('activity-diff-card')).toHaveTextContent(/Concluído/);
    });
  });

  describe('Markdown Parsing (FR-003 & FR-009)', () => {
    it('parses bold, inline code, bullets, and blockquotes safely', () => {
      const { container } = render(
        <div>{parseSimpleMarkdown('**Negrito** e `código`\n> Citação importante\n- Item 1')}</div>
      );

      expect(container.querySelector('strong')).toHaveTextContent('Negrito');
      expect(container.querySelector('code')).toHaveTextContent('código');
      expect(container.querySelector('blockquote')).toHaveTextContent('Citação importante');
      expect(container.querySelector('li')).toHaveTextContent('Item 1');
    });
  });

  describe('CommentInputForm Toolbar & Decision Toggle (FR-003, FR-004, FR-005)', () => {
    it('submits comment with Ctrl+Enter shortcut', () => {
      const onSubmit = vi.fn();
      render(<CommentInputForm onSubmitComment={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/Escreva um comentário/i);
      fireEvent.change(textarea, { target: { value: 'Comentário via Atalho' } });

      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      expect(onSubmit).toHaveBeenCalledWith('Comentário via Atalho', false);
    });

    it('submits decision comment when project decision toggle is active', () => {
      const onSubmit = vi.fn();
      render(<CommentInputForm onSubmitComment={onSubmit} />);

      const textarea = screen.getByPlaceholderText(/Escreva um comentário/i);
      fireEvent.change(textarea, { target: { value: 'Arquitetura decidida: REST' } });

      const decisionCheckbox = screen.getByTestId('comment-is-decision-checkbox');
      fireEvent.click(decisionCheckbox);

      const submitButton = screen.getByTestId('comment-submit-button');
      fireEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('Arquitetura decidida: REST', true);
    });
  });

  describe('CommentItem Decision Badge (FR-004)', () => {
    it('renders golden decision badge for decision comments', () => {
      render(<CommentItem comment={mockComments[1]} />);
      expect(screen.getByText(/Decisão de Projeto/i)).toBeInTheDocument();
    });
  });

  describe('TaskTimeline Filtering & Search (FR-007, FR-008)', () => {
    it('filters timeline items by text search input', () => {
      render(<TaskTimeline taskId="t1" comments={mockComments} activityLog={mockActivity} />);

      const searchInput = screen.getByTestId('timeline-search-input');
      fireEvent.change(searchInput, { target: { value: 'API v2' } });

      expect(screen.getAllByText(/Decidimos utilizar a API v2/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Este é um comentário normal/i)).not.toBeInTheDocument();
    });

    it('switches filter tab to decisions only', () => {
      render(<TaskTimeline taskId="t1" comments={mockComments} activityLog={mockActivity} />);

      const decisionsTab = screen.getByRole('button', { name: /decisões/i });
      fireEvent.click(decisionsTab);

      expect(screen.getAllByText(/Decidimos utilizar a API v2/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Este é um comentário normal/i)).not.toBeInTheDocument();
    });
  });
});
