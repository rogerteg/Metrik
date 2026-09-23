import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentItem } from '../../src/components/CommentItem';
import { ActivityLogItem } from '../../src/components/ActivityLogItem';
import { TaskComment, TaskActivityLog } from '../../src/types/taskActivity';

const mockComment: TaskComment = {
  id: 'cmt-1',
  taskId: 'task-1',
  userId: 'usr-1',
  userName: 'Ana Silva',
  text: 'Este é um comentário com **negrito** e `código inline`.',
  isDecision: true,
  createdAt: '2026-09-22T12:00:00.000Z',
};

const mockActivity: TaskActivityLog = {
  id: 'act-1',
  taskId: 'task-1',
  userId: 'usr-2',
  userName: 'Carlos Souza',
  eventType: 'moved',
  description: 'Movido da coluna "A Fazer" para "Em Progresso"',
  fromValue: 'A Fazer',
  toValue: 'Em Progresso',
  timestamp: '2026-09-22T11:00:00.000Z',
};

describe('Activity Feed Components Redesign', () => {
  it('renders decision comment card with gold highlight badge and markdown code styling', () => {
    render(<CommentItem comment={mockComment} onDelete={vi.fn()} />);

    expect(screen.getByText('Decisão de Projeto')).toBeInTheDocument();
    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    expect(screen.getByText('código inline')).toHaveClass('font-mono');
  });

  it('renders system activity log row with diff pill [De ➔ Para]', () => {
    render(<ActivityLogItem activity={mockActivity} />);

    expect(screen.getByText('Carlos Souza')).toBeInTheDocument();
    expect(screen.getByText('Movimentação')).toBeInTheDocument();
    expect(screen.getByText('A Fazer')).toBeInTheDocument();
    expect(screen.getByText('Em Progresso')).toBeInTheDocument();
  });
});
