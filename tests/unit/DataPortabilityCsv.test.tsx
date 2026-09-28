import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataPortabilityTab } from '../../src/components/Settings/DataPortabilityTab';

/** Feature 041 — botões de exportação CSV. */
describe('DataPortabilityTab CSV actions (Feature 041)', () => {
  const noop = () => {};

  it('shows CSV buttons when handlers are provided and calls them', () => {
    const onExportTasksCsv = vi.fn();
    const onExportSprintsCsv = vi.fn();
    render(
      <DataPortabilityTab
        onExportData={noop}
        onImportData={noop}
        onClearTasks={noop}
        onExportTasksCsv={onExportTasksCsv}
        onExportSprintsCsv={onExportSprintsCsv}
      />,
    );

    fireEvent.click(screen.getByTestId('export-tasks-csv'));
    fireEvent.click(screen.getByTestId('export-sprints-csv'));

    expect(onExportTasksCsv).toHaveBeenCalledTimes(1);
    expect(onExportSprintsCsv).toHaveBeenCalledTimes(1);
  });

  it('hides CSV buttons when handlers are absent', () => {
    render(<DataPortabilityTab onExportData={noop} onImportData={noop} onClearTasks={noop} />);
    expect(screen.queryByTestId('export-tasks-csv')).toBeNull();
    expect(screen.queryByTestId('export-sprints-csv')).toBeNull();
  });
});
