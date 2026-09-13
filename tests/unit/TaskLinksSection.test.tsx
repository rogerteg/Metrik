import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskLinksSection } from '../../src/components/TaskLinksSection';
import { TaskModel, BoardModel } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('Feature 024 - User Story 2 & 3: TaskLinksSection Component', () => {
  const currentTask: TaskModel = {
    id: 'task-1',
    title: 'Tarefa Principal',
    column: 'col-todo',
    createdAt: new Date().toISOString(),
    type: 'card',
    links: [],
  };

  const peerTask: TaskModel = {
    id: 'task-2',
    title: 'Tarefa no Mesmo Quadro',
    column: 'col-doing',
    createdAt: new Date().toISOString(),
    type: 'subtask',
    links: [],
  };

  const currentBoard: BoardModel = {
    id: 'board-main',
    name: 'Quadro Frontend',
    teamId: 'team-frontend',
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  };

  const remoteBoard: BoardModel = {
    id: 'board-remote',
    name: 'Quadro Backend',
    teamId: 'team-backend',
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  };

  const teams: Team[] = [
    { id: 'team-frontend', name: 'Squad Frontend', createdById: 'user-1', createdAt: '' },
    { id: 'team-backend', name: 'Squad Backend', createdById: 'user-2', createdAt: '' },
  ];

  it('renders empty state when task has no links', () => {
    render(
      <TaskLinksSection
        currentTask={currentTask}
        currentBoardId="board-main"
        currentTeamId="team-frontend"
        boardTasks={[currentTask, peerTask]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={vi.fn()}
        onRemoveLink={vi.fn()}
      />
    );

    expect(screen.getByText(/Nenhum vínculo associado/i)).toBeInTheDocument();
  });

  it('renders list of existing links with relation badges', () => {
    const taskWithLink: TaskModel = {
      ...currentTask,
      links: [
        {
          id: 'link-1',
          targetTaskId: 'task-2',
          relationType: 'blocks',
          targetBoardId: 'board-main',
          targetTeamId: 'team-frontend',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <TaskLinksSection
        currentTask={taskWithLink}
        currentBoardId="board-main"
        currentTeamId="team-frontend"
        boardTasks={[taskWithLink, peerTask]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={vi.fn()}
        onRemoveLink={vi.fn()}
      />
    );

    expect(screen.getByText(/Tarefa no Mesmo Quadro/i)).toBeInTheDocument();
    expect(screen.getByText(/Bloqueia/i)).toBeInTheDocument();
  });

  it('renders cross-squad badge when link points to another team', () => {
    const taskWithExternalLink: TaskModel = {
      ...currentTask,
      links: [
        {
          id: 'link-ext',
          targetTaskId: 'task-remote-99',
          relationType: 'is_blocked_by',
          targetBoardId: 'board-remote',
          targetTeamId: 'team-backend',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <TaskLinksSection
        currentTask={taskWithExternalLink}
        currentBoardId="board-main"
        currentTeamId="team-frontend"
        boardTasks={[taskWithExternalLink]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={vi.fn()}
        onRemoveLink={vi.fn()}
      />
    );

    expect(screen.getByText(/Squad Backend/i)).toBeInTheDocument();
    expect(screen.getByText(/É bloqueado por/i)).toBeInTheDocument();
  });

  it('calls onAddLink when submitting a new local link', () => {
    const onAddLink = vi.fn();
    render(
      <TaskLinksSection
        currentTask={currentTask}
        currentBoardId="board-main"
        currentTeamId="team-frontend"
        boardTasks={[currentTask, peerTask]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={onAddLink}
        onRemoveLink={vi.fn()}
      />
    );

    // Open add link form
    const btnOpen = screen.getByRole('button', { name: /Adicionar Vínculo/i });
    fireEvent.click(btnOpen);

    // Select target task
    const selectTask = screen.getByLabelText(/Selecionar Tarefa/i);
    fireEvent.change(selectTask, { target: { value: 'task-2' } });

    // Click submit
    const btnSubmit = screen.getByRole('button', { name: /Confirmar Vínculo/i });
    fireEvent.click(btnSubmit);

    expect(onAddLink).toHaveBeenCalledWith(
      'task-2',
      'relates_to', // default relation
      'board-main',
      'team-frontend'
    );
  });

  it('calls onRemoveLink when clicking delete button', () => {
    const onRemoveLink = vi.fn();
    const taskWithLink: TaskModel = {
      ...currentTask,
      links: [
        {
          id: 'link-1',
          targetTaskId: 'task-2',
          relationType: 'child',
          targetBoardId: 'board-main',
          targetTeamId: 'team-frontend',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <TaskLinksSection
        currentTask={taskWithLink}
        currentBoardId="board-main"
        currentTeamId="team-frontend"
        boardTasks={[taskWithLink, peerTask]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        onAddLink={vi.fn()}
        onRemoveLink={onRemoveLink}
      />
    );

    const btnRemove = screen.getByTitle(/Remover vínculo/i);
    fireEvent.click(btnRemove);

    expect(onRemoveLink).toHaveBeenCalledWith('task-2');
  });

  it('hides add and remove buttons when in read-only mode', () => {
    render(
      <TaskLinksSection
        currentTask={currentTask}
        currentBoardId="board-main"
        currentTeamId="team-frontend"
        boardTasks={[currentTask, peerTask]}
        allBoards={[currentBoard, remoteBoard]}
        teams={teams}
        isReadOnly={true}
        onAddLink={vi.fn()}
        onRemoveLink={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Adicionar Vínculo/i })).not.toBeInTheDocument();
  });
});
