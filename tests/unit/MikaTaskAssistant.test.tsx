import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MikaTaskAssistant } from '../../src/components/Mika/MikaTaskAssistant';
import { TaskModel } from '../../src/types/kanban';
import { mikaService } from '../../src/services/ai/mikaService';

describe('MikaTaskAssistant', () => {
  const mockTask: TaskModel = {
    id: 'task-test-decomp',
    title: 'Implementar exportação de relatórios em PDF',
    description: 'Permitir download do dashboard analítico em documento PDF diagramado.',
    column: 'col-todo',
    createdAt: '2026-10-15T10:00:00Z',
  };

  it('deve decompor a tarefa e exibir as subtarefas sugeridas com checkboxes', async () => {
    vi.spyOn(mikaService, 'decomposeTask').mockResolvedValueOnce({
      taskId: mockTask.id,
      suggestedSubtasks: [
        { id: 'sub-1', title: 'Configurar biblioteca de PDF no backend/cliente', completed: false },
        { id: 'sub-2', title: 'Desenhar layout do cabeçalho e métricas no PDF', completed: false },
        {
          id: 'sub-3',
          title: 'Criar botão de exportação e feedback de download',
          completed: false,
        },
      ],
      suggestedAcceptanceCriteria: [
        'Dado usuário no dashboard, Quando clicar em Exportar PDF, Então deve baixar o arquivo.',
      ],
      timestamp: '2026-10-16T10:00:00Z',
    });

    render(
      <MikaTaskAssistant
        task={mockTask}
        onAcceptSubtasks={vi.fn()}
        onAcceptCriteria={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/Analisando escopo com Mika/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Configurar biblioteca de PDF no backend/cliente'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Desenhar layout do cabeçalho e métricas no PDF'),
      ).toBeInTheDocument();
    });
  });

  it('deve chamar onAcceptSubtasks ao clicar no botão de inserção', async () => {
    const onAcceptSubtasksMock = vi.fn();

    vi.spyOn(mikaService, 'decomposeTask').mockResolvedValueOnce({
      taskId: mockTask.id,
      suggestedSubtasks: [{ id: 'sub-1', title: 'Subtarefa Aprovada 1', completed: false }],
      timestamp: '2026-10-16T10:00:00Z',
    });

    render(
      <MikaTaskAssistant
        task={mockTask}
        onAcceptSubtasks={onAcceptSubtasksMock}
        onAcceptCriteria={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const acceptBtn = await screen.findByRole('button', {
      name: /Inserir Selecionadas no Checklist/i,
    });
    fireEvent.click(acceptBtn);

    expect(onAcceptSubtasksMock).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ title: 'Subtarefa Aprovada 1' })]),
    );
  });

  it('deve chamar onAcceptCriteria quando o usuário aplicar critérios de aceite', async () => {
    const onAcceptCriteriaMock = vi.fn();

    vi.spyOn(mikaService, 'decomposeTask').mockResolvedValueOnce({
      taskId: mockTask.id,
      suggestedSubtasks: [],
      suggestedAcceptanceCriteria: ['Dado um teste, Quando rodar, Então passa.'],
      timestamp: '2026-10-16T10:00:00Z',
    });

    render(
      <MikaTaskAssistant
        task={mockTask}
        onAcceptSubtasks={vi.fn()}
        onAcceptCriteria={onAcceptCriteriaMock}
        onClose={vi.fn()}
      />,
    );

    const applyCriteriaBtn = await screen.findByRole('button', {
      name: /Aplicar Critérios de Aceite/i,
    });
    fireEvent.click(applyCriteriaBtn);

    expect(onAcceptCriteriaMock).toHaveBeenCalledWith('Dado um teste, Quando rodar, Então passa.');
  });
});
