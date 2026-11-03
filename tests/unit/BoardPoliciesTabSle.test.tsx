import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardPoliciesTab } from '../../src/components/Settings/BoardPoliciesTab';
import { SleConfig } from '../../src/types/sle';

describe('BoardPoliciesTab SLE Settings (Feature 054 - User Story 4)', () => {
  const mockSleConfig: SleConfig = {
    boardId: 'board-test',
    customTargetDays: null,
    enableP50Alert: true,
    enableP95Alert: true,
    updatedAt: '2026-11-03T00:00:00.000Z',
  };

  it('renders SLE configuration section with inputs and toggles', () => {
    render(<BoardPoliciesTab sleConfig={mockSleConfig} />);

    expect(
      screen.getByText(/Expectativa de Nível de Serviço \(SLE\) & Previsibilidade/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Alerta Preventivo de Mediana \(P50\)/i)).toBeChecked();
    expect(screen.getByLabelText(/Alerta Crítico de Cauda Longa \(P95\)/i)).toBeChecked();
  });

  it('calls onUpdateSleConfig when customTargetDays is changed', () => {
    const handleUpdate = vi.fn();
    render(<BoardPoliciesTab sleConfig={mockSleConfig} onUpdateSleConfig={handleUpdate} />);

    const input = screen.getByPlaceholderText(/Ex: 4\.5/i);
    fireEvent.change(input, { target: { value: '5' } });

    expect(handleUpdate).toHaveBeenCalledWith({ customTargetDays: 5 });
  });

  it('clears customTargetDays when input is emptied', () => {
    const handleUpdate = vi.fn();
    const configWithTarget = { ...mockSleConfig, customTargetDays: 5 };
    render(<BoardPoliciesTab sleConfig={configWithTarget} onUpdateSleConfig={handleUpdate} />);

    const input = screen.getByDisplayValue('5');
    fireEvent.change(input, { target: { value: '' } });

    expect(handleUpdate).toHaveBeenCalledWith({ customTargetDays: null });
  });

  it('calls onUpdateSleConfig when toggling P50 or P95 alert switches', () => {
    const handleUpdate = vi.fn();
    render(<BoardPoliciesTab sleConfig={mockSleConfig} onUpdateSleConfig={handleUpdate} />);

    const p50Switch = screen.getByLabelText(/Alerta Preventivo de Mediana \(P50\)/i);
    fireEvent.click(p50Switch);

    expect(handleUpdate).toHaveBeenCalledWith({ enableP50Alert: false });
  });
});
