import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskDetailsModal } from '../../src/components/TaskDetailsModal';
import { TaskModel } from '../../src/types/kanban';
import { mikaService } from '../../src/services/ai/mikaService';

describe('TaskDetailsModal Mika Integration (US2)', () => {
  const mockTask: TaskModel = {
    id: 't-modal-mika',
    title: 'Migrar banco para PostgreSQL',
    description: 'Executar scripts de migração e validar integridade referencial.',
    column: 'c1',
    createdAt: '2026-10-10T10:00:00Z',
  };

  it('deve exibir o botão da Mika AI no cabeçalho do checklist e abrir o assistente ao clicar', async () => {
    vi.spyOn(mikaService, 'decomposeTask').mockResolvedValueOnce({
      taskId: mockTask.id,
      suggestedSubtasks: [
        { id: 'sub-pg-1', title: 'Testar conexão com banco réplica', completed: false },
      ],
      timestamp: '2026-10-16T10:00:00Z',
    });

    render(
      <TaskDetailsModal task={mockTask} isOpen={true} onClose={vi.fn()} onUpdateTask={vi.fn()} />,
    );

    const mikaBtn = screen.getByRole('button', { name: /Mika AI/i });
    expect(mikaBtn).toBeInTheDocument();

    fireEvent.click(mikaBtn);

    expect(screen.getByLabelText('Assistente de Refinamento da Mika')).toBeInTheDocument();
  });
});
