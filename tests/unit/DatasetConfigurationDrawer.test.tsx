import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasetConfigurationDrawer } from '../../src/components/DatasetConfigurationDrawer';
import { DatasetFilterConfig } from '../../src/types/analytics';

describe('DatasetConfigurationDrawer component (Feature 030)', () => {
  const defaultConfig: DatasetFilterConfig = {
    timeWindow: 30,
    selectedTypes: ['card'],
  };

  it('renders drawer when isOpen is true and shows time window buttons', () => {
    render(
      <DatasetConfigurationDrawer
        isOpen={true}
        onClose={vi.fn()}
        config={defaultConfig}
        onUpdateConfig={vi.fn()}
        onResetToDefaults={vi.fn()}
      />
    );

    expect(screen.getByText('Configuração do Conjunto de Dados')).toBeInTheDocument();
    expect(screen.getByTestId('window-btn-14')).toBeInTheDocument();
    expect(screen.getByTestId('window-btn-30')).toBeInTheDocument();
    expect(screen.getByTestId('window-btn-90')).toBeInTheDocument();
    expect(screen.getByTestId('window-btn-all')).toBeInTheDocument();
    expect(screen.getByTestId('window-btn-custom')).toBeInTheDocument();
  });

  it('does not render drawer content when isOpen is false', () => {
    const { container } = render(
      <DatasetConfigurationDrawer
        isOpen={false}
        onClose={vi.fn()}
        config={defaultConfig}
        onUpdateConfig={vi.fn()}
        onResetToDefaults={vi.fn()}
      />
    );

    expect(container.querySelector('.dataset-drawer-backdrop')).not.toBeInTheDocument();
  });

  it('triggers onUpdateConfig when time window is changed', () => {
    const handleUpdate = vi.fn();
    render(
      <DatasetConfigurationDrawer
        isOpen={true}
        onClose={vi.fn()}
        config={defaultConfig}
        onUpdateConfig={handleUpdate}
        onResetToDefaults={vi.fn()}
      />
    );

    const btn14 = screen.getByTestId('window-btn-14');
    fireEvent.click(btn14);

    expect(handleUpdate).toHaveBeenCalledWith({ timeWindow: 14 });
  });

  it('triggers onResetToDefaults when reset button is clicked', () => {
    const handleReset = vi.fn();
    render(
      <DatasetConfigurationDrawer
        isOpen={true}
        onClose={vi.fn()}
        config={defaultConfig}
        onUpdateConfig={vi.fn()}
        onResetToDefaults={handleReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Redefinir aos Padrões/i });
    fireEvent.click(resetBtn);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
