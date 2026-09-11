import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WipAgingView } from '../../src/components/WipAgingView';
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard';
import { TaskModel, ColumnModel } from '../../src/types/kanban';

const mockColumns: ColumnModel[] = [
  { id: 'todo', title: 'A Fazer', category: 'todo', wipLimit: 10, colorScheme: 'todo' },
  { id: 'dev', title: 'Em Progresso', category: 'in_progress', wipLimit: 5, colorScheme: 'progress' },
  { id: 'review', title: 'Revisão', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
  { id: 'done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
];

const mockTasks: TaskModel[] = [
  {
    id: 't1',
    title: 'Tarefa em Dev',
    column: 'dev',
    tags: [],
    createdAt: '2026-09-01T12:00:00Z',
    startedAt: '2026-09-05T12:00:00Z',
    blocked: true,
    blockedReason: 'Falta documentação',
  },
  {
    id: 't2',
    title: 'Tarefa em Todo',
    column: 'todo',
    tags: [],
    createdAt: '2026-09-08T12:00:00Z',
  },
  {
    id: 't3',
    title: 'Tarefa em Review',
    column: 'review',
    tags: [],
    createdAt: '2026-09-02T12:00:00Z',
    startedAt: '2026-09-03T12:00:00Z',
  },
  {
    id: 't_done',
    title: 'Tarefa Concluída',
    column: 'done',
    tags: [],
    createdAt: '2026-08-01T00:00:00Z',
    completedAt: '2026-08-10T00:00:00Z',
  },
];

describe('Feature 020: WipAgingView UI', () => {
  it('renders guidance card when there is no active WIP or tasks', () => {
    render(<WipAgingView tasks={[]} columns={[]} />);
    expect(screen.getByTestId('wip-guidance-card')).toBeInTheDocument();
    expect(screen.getByText(/Nenhum Trabalho em Andamento/i)).toBeInTheDocument();
  });

  it('renders WIP Aging chart with columns, top WIP badges, and active dots', () => {
    render(<WipAgingView tasks={mockTasks} columns={mockColumns} />);

    expect(screen.getByTestId('wip-aging-chart')).toBeInTheDocument();
    expect(screen.getByText(/WIP Total Ativo:/i)).toBeInTheDocument();
    expect(screen.getByText(/3 itens/i)).toBeInTheDocument();

    // Colunas ativas devem estar renderizadas
    expect(screen.getByTestId('col-band-todo')).toBeInTheDocument();
    expect(screen.getByTestId('col-band-dev')).toBeInTheDocument();
    expect(screen.getByTestId('col-band-review')).toBeInTheDocument();

    // Pontos dos cartões ativos devem existir
    expect(screen.getByTestId('dot-t1')).toBeInTheDocument();
    expect(screen.getByTestId('dot-t2')).toBeInTheDocument();
    expect(screen.getByTestId('dot-t3')).toBeInTheDocument();
  });

  it('toggles left dataset drawer and right controls drawer', () => {
    render(<WipAgingView tasks={mockTasks} columns={mockColumns} />);

    const leftToggle = screen.getByTestId('wip-dataset-toggle');
    const rightToggle = screen.getByTestId('wip-controls-toggle');

    // Inicialmente gavetas fechadas
    expect(leftToggle).toHaveAttribute('aria-expanded', 'false');
    expect(rightToggle).toHaveAttribute('aria-expanded', 'false');

    // Abrir gaveta esquerda
    fireEvent.click(leftToggle);
    expect(leftToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('wip-start-date-input')).toBeInTheDocument();

    // Abrir gaveta direita
    fireEvent.click(rightToggle);
    expect(rightToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('toggle-p50')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-p85')).toBeInTheDocument();
  });

  it('allows toggling percentiles visibility from the controls drawer', () => {
    render(<WipAgingView tasks={mockTasks} columns={mockColumns} />);

    const rightToggle = screen.getByTestId('wip-controls-toggle');
    fireEvent.click(rightToggle);

    const toggleP50 = screen.getByTestId('toggle-p50') as HTMLInputElement;
    expect(toggleP50.checked).toBe(true);

    fireEvent.click(toggleP50);
    expect(toggleP50.checked).toBe(false);

    // Botão Select All
    const selectAllBtn = screen.getByTestId('select-all-percentiles');
    fireEvent.click(selectAllBtn);
    expect(toggleP50.checked).toBe(true);
  });

  it('integrates seamlessly with AnalyticsDashboard wip tab', () => {
    const mockBoard = {
      columns: mockColumns,
      tasks: {
        todo: [mockTasks[1]],
        dev: [mockTasks[0]],
        review: [mockTasks[2]],
        done: [mockTasks[3]],
      },
    };

    render(<AnalyticsDashboard tasks={mockTasks} board={mockBoard} />);

    const wipTab = screen.getByTestId('tab-wip');
    expect(wipTab).toBeInTheDocument();

    fireEvent.click(wipTab);
    expect(screen.getByTestId('focused-wip-view')).toBeInTheDocument();
    expect(screen.getByTestId('wip-aging-view')).toBeInTheDocument();
  });
});
