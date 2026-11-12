import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MikaDrawer } from '../../src/components/Mika/MikaDrawer';
import { MikaInsight } from '../../src/types/mika';

describe('MikaDrawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockInsights: MikaInsight[] = [
    {
      id: 'i-drawer-1',
      title: 'Vazão Estável',
      summary: 'Throughput médio de 3.2 itens por dia.',
      severity: 'info',
      category: 'throughput',
      timestamp: '2026-10-16T12:00:00Z',
    },
  ];

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(
      <MikaDrawer isOpen={false} onClose={vi.fn()} insights={mockInsights} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar o cabeçalho, as abas de navegação e o botão de fechar quando isOpen for true', () => {
    render(<MikaDrawer isOpen={true} onClose={vi.fn()} insights={mockInsights} />);

    expect(screen.getByText('Mika Flow Copilot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fechar gaveta da Mika/i })).toBeInTheDocument();
    expect(screen.getByTestId('mika-tab-chat')).toBeInTheDocument();
    expect(screen.getByTestId('mika-tab-insights')).toBeInTheDocument();
  });

  it('deve alternar entre a aba de Chat e a aba de Diagnósticos', () => {
    render(<MikaDrawer isOpen={true} onClose={vi.fn()} insights={mockInsights} />);

    // Aba inicial é o Chat
    expect(screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i })).toBeInTheDocument();

    // Alterna para Diagnósticos
    const insightsTabBtn = screen.getByTestId('mika-tab-insights');
    fireEvent.click(insightsTabBtn);

    expect(screen.getByText('Vazão Estável')).toBeInTheDocument();
    expect(screen.getByText(/Throughput médio de 3.2 itens por dia/i)).toBeInTheDocument();

    // Alterna de volta para o Chat
    const chatTabBtn = screen.getByTestId('mika-tab-chat');
    fireEvent.click(chatTabBtn);

    expect(screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i })).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar no botão de fechar ou no backdrop', () => {
    const onCloseMock = vi.fn();
    render(<MikaDrawer isOpen={true} onClose={onCloseMock} insights={mockInsights} />);

    const closeBtn = screen.getByRole('button', { name: /Fechar gaveta da Mika/i });
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId('mika-drawer-backdrop');
    fireEvent.click(backdrop);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it('deve fechar ao pressionar a tecla Escape', () => {
    const onCloseMock = vi.fn();
    render(<MikaDrawer isOpen={true} onClose={onCloseMock} insights={mockInsights} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('renderiza o chat e permite fornecer onNavigateToForecast sem quebras', () => {
    const onNavMock = vi.fn();
    render(
      <MikaDrawer
        isOpen={true}
        onClose={vi.fn()}
        insights={mockInsights}
        onNavigateToForecast={onNavMock}
      />,
    );
    expect(screen.getByRole('textbox', { name: /Mensagem para a Mika AI/i })).toBeInTheDocument();
  });
});
