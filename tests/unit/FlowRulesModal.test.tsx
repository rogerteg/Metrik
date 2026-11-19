import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlowRulesModal } from '../../src/components/FlowRules/FlowRulesModal';
import { ColumnModel } from '../../src/types/kanban';
import { FlowRule } from '../../src/types/flowRules';

describe('FlowRulesModal Component', () => {
  const dummyColumns: ColumnModel[] = [
    { id: 'c1', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    {
      id: 'c2',
      title: 'Em Progresso',
      category: 'in_progress',
      wipLimit: 5,
      colorScheme: 'progress',
    },
    { id: 'c3', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const dummyRules: FlowRule[] = [
    {
      id: 'rule-1',
      boardId: 'board-1',
      name: 'Regra Teste 1',
      description: 'Descrição de teste',
      enabled: true,
      trigger: { type: 'card_moved', config: { targetColumnId: 'c2' } },
      conditions: [],
      actions: [{ id: 'a1', type: 'add_tag', payload: { tag: 'qa' } }],
      executionCount: 0,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    },
  ];

  it('não deve renderizar nada quando isOpen for falso', () => {
    const { container } = render(
      <FlowRulesModal
        isOpen={false}
        onClose={vi.fn()}
        boardId="board-1"
        columns={dummyColumns}
        rules={[]}
        onAddRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onToggleRule={vi.fn()}
        onDeleteRule={vi.fn()}
        onDuplicateRule={vi.fn()}
        onSetRules={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar estado vazio quando não houver regras', () => {
    render(
      <FlowRulesModal
        isOpen={true}
        onClose={vi.fn()}
        boardId="board-1"
        columns={dummyColumns}
        rules={[]}
        onAddRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onToggleRule={vi.fn()}
        onDeleteRule={vi.fn()}
        onDuplicateRule={vi.fn()}
        onSetRules={vi.fn()}
      />,
    );

    expect(screen.getByText(/Nenhuma regra configurada neste quadro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Criar Primeira Regra/i })).toBeInTheDocument();
  });

  it('deve alternar entre as abas de Regras e Modelos Prontos', () => {
    render(
      <FlowRulesModal
        isOpen={true}
        onClose={vi.fn()}
        boardId="board-1"
        columns={dummyColumns}
        rules={dummyRules}
        onAddRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onToggleRule={vi.fn()}
        onDeleteRule={vi.fn()}
        onDuplicateRule={vi.fn()}
        onSetRules={vi.fn()}
      />,
    );

    expect(screen.getByText('Regra Teste 1')).toBeInTheDocument();

    const templatesTab = screen.getByRole('button', { name: /Modelos Prontos/i });
    fireEvent.click(templatesTab);

    expect(screen.queryByText('Regra Teste 1')).not.toBeInTheDocument();

    const rulesTab = screen.getByRole('button', { name: /Regras Ativas/i });
    fireEvent.click(rulesTab);

    expect(screen.getByText('Regra Teste 1')).toBeInTheDocument();
  });

  it('deve abrir o FlowRuleBuilder ao clicar em Nova Regra e fechar no cancelamento', () => {
    render(
      <FlowRulesModal
        isOpen={true}
        onClose={vi.fn()}
        boardId="board-1"
        columns={dummyColumns}
        rules={dummyRules}
        onAddRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onToggleRule={vi.fn()}
        onDeleteRule={vi.fn()}
        onDuplicateRule={vi.fn()}
        onSetRules={vi.fn()}
      />,
    );

    const newRuleBtn = screen.getByRole('button', { name: /\+ Nova Regra/i });
    fireEvent.click(newRuleBtn);

    expect(screen.getByText(/Nova Regra de Fluxo/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByText(/Nova Regra de Fluxo/i)).not.toBeInTheDocument();
  });

  it('deve permitir abrir edição de regra existente e salvar', () => {
    const onUpdateRule = vi.fn();
    const onToast = vi.fn();

    render(
      <FlowRulesModal
        isOpen={true}
        onClose={vi.fn()}
        boardId="board-1"
        columns={dummyColumns}
        rules={dummyRules}
        onAddRule={vi.fn()}
        onUpdateRule={onUpdateRule}
        onToggleRule={vi.fn()}
        onDeleteRule={vi.fn()}
        onDuplicateRule={vi.fn()}
        onSetRules={vi.fn()}
        onToast={onToast}
      />,
    );

    const editBtn = screen.getByTitle(/editar regra/i);
    fireEvent.click(editBtn);

    expect(screen.getByText(/Editar Regra de Fluxo/i)).toBeInTheDocument();

    const saveBtn = screen.getByRole('button', { name: /salvar regra/i });
    fireEvent.click(saveBtn);

    expect(onUpdateRule).toHaveBeenCalledWith('rule-1', expect.anything());
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('atualizada com sucesso'));
  });

  it('deve exportar regras ativas ao clicar em Exportar', () => {
    const onToast = vi.fn();
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    render(
      <FlowRulesModal
        isOpen={true}
        onClose={vi.fn()}
        boardId="board-1"
        columns={dummyColumns}
        rules={dummyRules}
        onAddRule={vi.fn()}
        onUpdateRule={vi.fn()}
        onToggleRule={vi.fn()}
        onDeleteRule={vi.fn()}
        onDuplicateRule={vi.fn()}
        onSetRules={vi.fn()}
        onToast={onToast}
      />,
    );

    const exportBtn = screen.getByTitle(/exportar regras/i);
    fireEvent.click(exportBtn);

    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('exportadas com sucesso'));
  });
});
