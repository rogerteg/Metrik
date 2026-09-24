import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskActivityLogItem } from '../../src/components/TaskActivityLogItem.tsx';
import { ActivityLogEntry } from '../../src/types/taskActivity';

describe('TaskActivityLogItem', () => {
  const sampleCreationEntry: ActivityLogEntry = {
    id: 'log-1',
    taskId: 'task-100',
    actorName: 'Luis Eduardo Ferreira Santos',
    type: 'creation',
    actionText: 'Luis Eduardo Ferreira Santos criou esta tarefa',
    timestamp: '2026-06-26T10:26:00.000Z',
  };

  const sampleUnassignEntry: ActivityLogEntry = {
    id: 'log-2',
    taskId: 'task-100',
    actorName: 'Danillo Barbosa',
    type: 'unassignment',
    actionText: 'Danillo Barbosa removeu o responsável: Antonio Carlos Ferreira Batista',
    previousValue: 'Antonio Carlos Ferreira Batista',
    timestamp: '2026-07-16T14:36:00.000Z',
  };

  it('renders bullet point, actor name, action description, and right-aligned timestamp for creation', () => {
    render(<TaskActivityLogItem entry={sampleCreationEntry} />);
    
    expect(screen.getByText(/Luis Eduardo Ferreira Santos criou esta tarefa/)).toBeInTheDocument();
    expect(screen.getByText(/jun 26 às/)).toBeInTheDocument();
  });

  it('renders unassignment action text and right-aligned timestamp for removal', () => {
    render(<TaskActivityLogItem entry={sampleUnassignEntry} />);
    
    expect(
      screen.getByText(/Danillo Barbosa removeu o responsável: Antonio Carlos Ferreira Batista/)
    ).toBeInTheDocument();
    expect(screen.getByText(/jul 16 às/)).toBeInTheDocument();
  });
});
