import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MikaDrawer } from '../../src/components/Mika/MikaDrawer';
import { MikaInsight } from '../../src/types/mika';

describe('MikaDrawer', () => {
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

  it('deve renderizar o cabeçalho, os insights e o botão de fechar quando isOpen for true', () => {
    render(<MikaDrawer isOpen={true} onClose={vi.fn()} insights={mockInsights} />);

    expect(screen.getByText('Mika Flow Copilot')).toBeInTheDocument();
    expect(screen.getByText('Vazão Estável')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fechar gaveta da Mika/i })).toBeInTheDocument();
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
});
