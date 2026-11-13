import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FlowLeverageSimulatorPanel from '../../src/components/MonteCarlo/FlowLeverageSimulatorPanel';
import { ColumnModel, TaskModel } from '../../src/types/kanban';

describe('FlowLeverageSimulatorPanel (Feature 058 - US2)', () => {
  const baseColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'col-dev',
      title: 'Desenvolvimento',
      category: 'in_progress',
      wipLimit: 8,
      colorScheme: 'progress',
    },
    {
      id: 'col-test',
      title: 'Homologação',
      category: 'in_progress',
      wipLimit: 5,
      colorScheme: 'progress',
    },
    {
      id: 'col-done',
      title: 'Concluído',
      category: 'done',
      wipLimit: null,
      colorScheme: 'completed',
    },
  ];

  const sampleTasks: TaskModel[] = Array.from({ length: 14 }, (_, i) => ({
    id: `task-${i}`,
    title: `Item de Entrega ${i}`,
    column: i < 8 ? 'col-dev' : i < 11 ? 'col-test' : 'col-done',
    createdAt: new Date(Date.now() - (i + 5) * 86400000).toISOString(),
    completedAt: i >= 11 ? new Date(Date.now() - (i - 11) * 86400000).toISOString() : undefined,
  }));

  it('renders sandbox badge and baseline vs simulated comparison cards', () => {
    render(
      <FlowLeverageSimulatorPanel tasks={sampleTasks} columns={baseColumns} scopeType="all" />,
    );

    expect(screen.getByText(/Modo Sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/P85 Atual/i)).toBeInTheDocument();
    expect(screen.getByText(/P85 Simulado/i)).toBeInTheDocument();
  });

  it('updates simulated P85 when WIP slider is changed', () => {
    render(
      <FlowLeverageSimulatorPanel tasks={sampleTasks} columns={baseColumns} scopeType="all" />,
    );

    const devSlider = screen.getByLabelText(
      /Limite Simulado: Desenvolvimento/i,
    ) as HTMLInputElement;
    fireEvent.change(devSlider, { target: { value: '3' } });

    expect(devSlider.value).toBe('3');
    expect(screen.getByText(/Variação Projetada/i)).toBeInTheDocument();
  });

  it('allows applying WIP limit to board only via explicit user confirmation', () => {
    const onApplyWipLimit = vi.fn();
    render(
      <FlowLeverageSimulatorPanel
        tasks={sampleTasks}
        columns={baseColumns}
        scopeType="all"
        onApplyWipLimit={onApplyWipLimit}
        isReadOnly={false}
      />,
    );

    const devSlider = screen.getByLabelText(/Limite Simulado: Desenvolvimento/i);
    fireEvent.change(devSlider, { target: { value: '4' } });

    // Botão de aplicação visível
    const applyBtn = screen.getByRole('button', {
      name: /Aplicar limite na coluna Desenvolvimento/i,
    });
    fireEvent.click(applyBtn);

    // Modal de confirmação aberto
    expect(screen.getByText(/Confirmar alteração de política/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Aplicação/i });
    fireEvent.click(confirmBtn);

    expect(onApplyWipLimit).toHaveBeenCalledWith('col-dev', 4);
  });

  it('hides apply button when isReadOnly is true', () => {
    render(
      <FlowLeverageSimulatorPanel
        tasks={sampleTasks}
        columns={baseColumns}
        scopeType="all"
        isReadOnly={true}
      />,
    );

    const devSlider = screen.getByLabelText(/Limite Simulado: Desenvolvimento/i);
    fireEvent.change(devSlider, { target: { value: '2' } });

    expect(
      screen.queryByRole('button', { name: /Aplicar limite na coluna/i }),
    ).not.toBeInTheDocument();
  });
});
