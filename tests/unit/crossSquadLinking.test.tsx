import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskLinksSection } from '../../src/components/TaskLinksSection';
import { TaskModel, BoardModel, BoardState } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('Feature 024 - User Story 3: Cross-Squad Task Discovery & Linking', () => {
  const currentTask: TaskModel = {
    id: 'task-front-1',
    title: 'Integração de Checkout SPA',
    column: 'col-todo',
    createdAt: new Date().toISOString(),
    type: 'card',
    links: [],
  };

  const currentBoard: BoardModel = {
    id: 'board-front',
    name: 'Quadro Frontend Web',
    teamId: 'team-front',
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  };

  const remoteBoard: BoardModel = {
    id: 'board-back',
    name: 'Quadro Backend APIs',
    teamId: 'team-back',
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  };

  const teams: Team[] = [
    { id: 'team-front', name: 'Squad Frontend', createdById: 'user-1', createdAt: '' },
    { id: 'team-back', name: 'Squad Backend', createdById: 'user-2', createdAt: '' },
  ];

  const remoteBoardState: BoardState = {
    columns: [
      { id: 'col-back-todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
      { id: 'col-back-done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
    ],
    tasks: {
      'col-back-todo': [
        {
          id: 'task-back-endpoint',
          title: 'Endpoint de Pagamentos v2',
          column: 'col-back-todo',
          createdAt: new Date().toISOString(),
          type: 'card',
        },
      ],
      'col-back-done': [],
    },
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('metrik-tasks-board-back', JSON.stringify(remoteBoardState));
  });

  it('allows discovering and selecting tasks across squads through cascading dropdowns', () => {
    const onAddLink = vi.fn();

    render(
      <TaskLinksSection
        currentTask={currentTask}
        currentBoardId="board-front"
        currentTeamId="team-front"
        boardTasks={[currentTask]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={onAddLink}
        onRemoveLink={vi.fn()}
      />
    );

    // Open add link form
    fireEvent.click(screen.getByRole('button', { name: /Adicionar Vínculo/i }));

    // Switch to Cross-Squad scope tab
    const crossTab = screen.getByRole('button', { name: /Outro Time \/ Squad/i });
    fireEvent.click(crossTab);

    // Step 1: Select Squad
    const squadSelect = screen.getByLabelText(/Squad Alvo/i);
    fireEvent.change(squadSelect, { target: { value: 'team-back' } });

    // Step 2: Select Board
    const boardSelect = screen.getByLabelText(/Quadro Alvo/i);
    expect(boardSelect).toBeInTheDocument();
    fireEvent.change(boardSelect, { target: { value: 'board-back' } });

    // Step 3: Select Remote Task
    const taskSelect = screen.getByLabelText(/Tarefa Alvo/i);
    expect(taskSelect).toBeInTheDocument();
    expect(screen.getByText(/Endpoint de Pagamentos v2/i)).toBeInTheDocument();
    fireEvent.change(taskSelect, { target: { value: 'task-back-endpoint' } });

    // Step 4: Select Relation (e.g. 'is_blocked_by')
    const relationSelect = screen.getByLabelText(/Tipo de Relação/i);
    fireEvent.change(relationSelect, { target: { value: 'is_blocked_by' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Vínculo/i }));

    expect(onAddLink).toHaveBeenCalledWith(
      'task-back-endpoint',
      'is_blocked_by',
      'board-back',
      'team-back'
    );
  });

  it('renders cross-squad badge and remote task title from external board storage', () => {
    const taskWithCrossLink: TaskModel = {
      ...currentTask,
      links: [
        {
          id: 'link-cross-1',
          targetTaskId: 'task-back-endpoint',
          relationType: 'is_blocked_by',
          targetBoardId: 'board-back',
          targetTeamId: 'team-back',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <TaskLinksSection
        currentTask={taskWithCrossLink}
        currentBoardId="board-front"
        currentTeamId="team-front"
        boardTasks={[taskWithCrossLink]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={vi.fn()}
        onRemoveLink={vi.fn()}
      />
    );

    expect(screen.getByText(/Endpoint de Pagamentos v2/i)).toBeInTheDocument();
    expect(screen.getByText(/Squad Backend/i)).toBeInTheDocument();
    expect(screen.getByText(/É bloqueado por/i)).toBeInTheDocument();
  });
});
