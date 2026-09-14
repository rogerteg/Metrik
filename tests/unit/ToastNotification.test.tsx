import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastNotification } from '../../src/components/ToastNotification';

describe('ToastNotification component (Feature 025)', () => {
  it('renders null when message is null', () => {
    const { container } = render(<ToastNotification message={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders message with role="alert" when message is provided', () => {
    render(
      <ToastNotification
        message="Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas."
        onClose={vi.fn()}
      />
    );

    const toast = screen.getByTestId('metrik-toast');
    expect(toast).toBeDefined();
    expect(toast.getAttribute('role')).toBe('alert');
    expect(screen.getByText('Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas.')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <ToastNotification
        message="Mensagem de teste"
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByLabelText('Fechar notificação');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after durationMs', () => {
    vi.useFakeTimers();
    const onCloseMock = vi.fn();

    render(
      <ToastNotification
        message="Auto-close toast"
        onClose={onCloseMock}
        durationMs={3000}
      />
    );

    expect(onCloseMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
