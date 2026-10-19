import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MikaInsightCard } from '../../src/components/Mika/MikaInsightCard';
import { MikaInsight } from '../../src/types/mika';

describe('MikaInsightCard', () => {
  const mockInsights: MikaInsight[] = [
    {
      id: 'insight-1',
      title: 'Tempo de Ciclo Otimizado',
      summary: 'O percentil 85 está em 4.2 dias com boa previsibilidade.',
      recommendation: 'Manter a cadência de reuniões de alinhamento diário.',
      severity: 'info',
      category: 'cycle-time',
      metricValue: '4.2 dias',
      timestamp: '2026-10-16T12:00:00Z',
    },
    {
      id: 'insight-2',
      title: 'Atenção ao Gargalo em Testes',
      summary: 'A coluna Testes ultrapassou o limite de WIP configurado.',
      recommendation: 'Reduzir novos itens na fila.',
      severity: 'warning',
      category: 'wip-bottleneck',
      timestamp: '2026-10-16T12:00:00Z',
    },
  ];

  it('deve renderizar os títulos, diagnósticos e badges de severidade', () => {
    render(<MikaInsightCard insights={mockInsights} />);

    expect(screen.getByText('Tempo de Ciclo Otimizado')).toBeInTheDocument();
    expect(screen.getByText('Atenção ao Gargalo em Testes')).toBeInTheDocument();
    expect(screen.getByText('INFO')).toBeInTheDocument();
    expect(screen.getByText('ATENÇÃO')).toBeInTheDocument();
    expect(
      screen.getByText('O percentil 85 está em 4.2 dias com boa previsibilidade.'),
    ).toBeInTheDocument();
  });

  it('deve disparar onRefresh quando o botão de recálculo for clicado', () => {
    const onRefreshMock = vi.fn();
    render(<MikaInsightCard insights={mockInsights} onRefresh={onRefreshMock} />);

    const refreshButton = screen.getByRole('button', { name: /Recalcular/i });
    fireEvent.click(refreshButton);

    expect(onRefreshMock).toHaveBeenCalledTimes(1);
  });

  it('não deve renderizar nada se o array de insights estiver vazio', () => {
    const { container } = render(<MikaInsightCard insights={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
