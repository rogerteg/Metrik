/**
 * tests/unit/MikaChatInterface.test.tsx
 * Suíte de testes unitários para Quick Prompts preditivos e Ações Consultivas (Feature 057 - US3)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MikaChatInterface } from '../../src/components/Mika/MikaChatInterface';
import { MikaMessageContent } from '../../src/components/Mika/MikaMessageContent';
import { MikaBoardTelemetryContext } from '../../src/types/mika';

describe('MikaChatInterface & MikaMessageContent - US3 (Quick Prompts Preditivos e Ações Consultivas)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockTelemetryWithForecast: MikaBoardTelemetryContext = {
    boardId: 'board-mc-test',
    boardTitle: 'Quadro Monte Carlo',
    columns: [
      { id: 'c1', title: 'To Do', taskCount: 4, isOverWip: false },
      { id: 'c2', title: 'Done', taskCount: 10, isOverWip: false },
    ],
    blockedTasks: [],
    cycleTimeP85Days: 5,
    throughputLast14Days: 12,
    totalActiveTasks: 4,
    totalCompletedTasks: 10,
    generatedAt: new Date().toISOString(),
    monteCarloTelemetry: {
      sampleValidation: {
        isSampleSufficient: true,
        deliveryDays: 14,
        totalDelivered: 12,
      },
      initiatives: [
        {
          id: 'init-99',
          title: 'Migração Cloud',
          pendingCount: 4,
          completedCount: 2,
          p50Days: 8,
          p85Days: 15,
          p95Days: 22,
          p50Date: '2026-11-17',
          p85Date: '2026-11-24',
          p95Date: '2026-12-01',
          targetDate: '2026-11-25',
          targetProbability: 88.0,
          riskLevel: 'low',
        },
      ],
      activeSprint: {
        id: 'sp-1',
        title: 'Sprint Atual',
        targetDate: '2026-11-15',
        pendingCount: 3,
        completedCount: 2,
        p85Days: 5,
        p85Date: '2026-11-14',
        targetProbability: 82.0,
        riskLevel: 'low',
      },
      defaultCapacity14Days: {
        windowDays: 14,
        p50Items: 14,
        p85Items: 10,
        p95Items: 6,
      },
      generalBacklogPendingCount: 4,
      generalBacklogP85Days: 15,
      generalBacklogP85Date: '2026-11-24',
    },
  };

  it('renderiza os chips de sugestões rápidas preditivas de Monte Carlo (FR-007)', () => {
    render(
      <MikaChatInterface
        boardId="board-mc-test"
        boardTitle="Quadro Monte Carlo"
        telemetryContext={mockTelemetryWithForecast}
        apiKey=""
        providerName="Local-First (Offline)"
      />,
    );

    expect(screen.getByRole('button', { name: /🎲 Previsão da Iniciativa/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📅 Risco da Sprint/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🎯 Capacidade \(85% SLE\)/i })).toBeInTheDocument();
  });

  it('dispara pergunta de capacidade ao clicar na pílula correspondente', async () => {
    render(
      <MikaChatInterface
        boardId="board-mc-test"
        boardTitle="Quadro Monte Carlo"
        telemetryContext={mockTelemetryWithForecast}
        apiKey=""
        providerName="Local-First (Offline)"
      />,
    );

    const capacityChip = screen.getByRole('button', { name: /🎯 Capacidade \(85% SLE\)/i });
    fireEvent.click(capacityChip);

    await waitFor(() => {
      expect(screen.getByText(/Capacidade de Entrega/i)).toBeInTheDocument();
      expect(screen.getAllByText(/10 itens/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/85% de certeza/i)).toBeInTheDocument();
    });
  });

  it('renderiza botão CTA consultivo em MikaMessageContent quando action for NAVIGATE_TO_FORECAST (FR-008)', () => {
    const handleNavigate = vi.fn();

    render(
      <MikaMessageContent
        content="Previsão para a iniciativa Migração Cloud concluída com sucesso."
        action={{
          type: 'NAVIGATE_TO_FORECAST',
          label: '📊 Ver Simulação Completa no Painel',
          scopeType: 'initiative',
          scopeId: 'init-99',
        }}
        onNavigateToForecast={handleNavigate}
      />,
    );

    const ctaButton = screen.getByRole('button', {
      name: /📊 Ver Simulação Completa no Painel/i,
    });
    expect(ctaButton).toBeInTheDocument();

    fireEvent.click(ctaButton);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledWith('initiative', 'init-99');
  });

  it('não renderiza botão CTA se action for undefined ou se onNavigateToForecast não for fornecido', () => {
    render(<MikaMessageContent content="Mensagem sem ação consultiva." />);

    expect(screen.queryByRole('button', { name: /Ver Simulação/i })).not.toBeInTheDocument();
  });

  it('integração de clique no chip de iniciativa gera resposta com CTA e navega com sucesso', async () => {
    const handleNavigate = vi.fn();

    render(
      <MikaChatInterface
        boardId="board-mc-test"
        boardTitle="Quadro Monte Carlo"
        telemetryContext={mockTelemetryWithForecast}
        apiKey=""
        providerName="Local-First (Offline)"
        onNavigateToForecast={handleNavigate}
      />,
    );

    const initChip = screen.getByRole('button', { name: /🎲 Previsão da Iniciativa/i });
    fireEvent.click(initChip);

    await waitFor(() => {
      expect(screen.getByText(/Panorama Consolidado de Iniciativas/i)).toBeInTheDocument();
    });

    const ctaBtn = screen.getByRole('button', { name: /📊 Ver Previsão de Épicos no Painel/i });
    expect(ctaBtn).toBeInTheDocument();

    fireEvent.click(ctaBtn);
    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate).toHaveBeenCalledWith('initiative', undefined);
  });

  it('cancela a confirmação de limpeza da conversa ao clicar em Não', async () => {
    render(
      <MikaChatInterface
        boardId="board-mc-test"
        boardTitle="Quadro Monte Carlo"
        telemetryContext={mockTelemetryWithForecast}
        apiKey=""
        providerName="Local-First (Offline)"
      />,
    );

    const qp = screen.getByRole('button', { name: /🎲 Previsão da Iniciativa/i });
    fireEvent.click(qp);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Limpar histórico da conversa/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Limpar histórico da conversa/i }));
    expect(screen.getByText('Apagar tudo?')).toBeInTheDocument();

    const noBtn = screen.getByRole('button', { name: 'Não' });
    fireEvent.click(noBtn);
    expect(screen.queryByText('Apagar tudo?')).not.toBeInTheDocument();
  });

  it('renderiza menções a tarefas encapsuladas em negrito e permite clicar', () => {
    const handleTaskClick = vi.fn();
    render(
      <MikaMessageContent
        content="Atenção à tarefa **#task-xyz** prioritária"
        onOpenTaskDetails={handleTaskClick}
      />,
    );

    const taskChip = screen.getByRole('button', { name: /#task-xyz/i });
    expect(taskChip).toBeInTheDocument();
    fireEvent.click(taskChip);
    expect(handleTaskClick).toHaveBeenCalledWith('task-xyz');
  });

  it('não envia mensagem ao pressionar Shift + Enter', () => {
    render(
      <MikaChatInterface
        boardId="board-mc-test"
        boardTitle="Quadro Monte Carlo"
        telemetryContext={mockTelemetryWithForecast}
        apiKey=""
        providerName="Local-First (Offline)"
      />,
    );

    const textarea = screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i });
    fireEvent.change(textarea, { target: { value: 'Texto de teste' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    // Não deve criar bolha de mensagem de usuário
    expect(document.querySelector('.mika-message-row.user')).toBeNull();
  });

  it('responde a clique na pílula rápida de Risco da Sprint', async () => {
    render(
      <MikaChatInterface
        boardId="board-mc-test"
        boardTitle="Quadro Monte Carlo"
        telemetryContext={mockTelemetryWithForecast}
        apiKey=""
        providerName="Local-First (Offline)"
      />,
    );

    const sprintChip = screen.getByRole('button', { name: /📅 Risco da Sprint/i });
    fireEvent.click(sprintChip);

    await waitFor(() => {
      expect(screen.getByText(/Diagnóstico de Prazo da Sprint Atual/i)).toBeInTheDocument();
      expect(screen.getByText(/82%/i)).toBeInTheDocument();
    });
  });
});
