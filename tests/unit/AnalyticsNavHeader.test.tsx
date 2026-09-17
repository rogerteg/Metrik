import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsNavHeader } from '../../src/components/AnalyticsNavHeader';

describe('AnalyticsNavHeader component (Feature 030)', () => {
  it('renders all 8 categorized tabs', () => {
    render(
      <AnalyticsNavHeader
        activeCategory="dashboard"
        onSelectCategory={vi.fn()}
      />
    );

    expect(screen.getByTestId('tab-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('tab-cycle-time')).toBeInTheDocument();
    expect(screen.getByTestId('tab-throughput')).toBeInTheDocument();
    expect(screen.getByTestId('tab-wip')).toBeInTheDocument();
    expect(screen.getByTestId('tab-flow')).toBeInTheDocument();
    expect(screen.getByTestId('tab-blockers')).toBeInTheDocument();
    expect(screen.getByTestId('tab-sles')).toBeInTheDocument();
    expect(screen.getByTestId('tab-forecasting')).toBeInTheDocument();
  });

  it('triggers onSelectCategory when a category tab is clicked', () => {
    const handleSelectCategory = vi.fn();
    render(
      <AnalyticsNavHeader
        activeCategory="dashboard"
        onSelectCategory={handleSelectCategory}
      />
    );

    fireEvent.click(screen.getByTestId('tab-flow'));
    expect(handleSelectCategory).toHaveBeenCalledWith('flow');

    fireEvent.click(screen.getByTestId('tab-sles'));
    expect(handleSelectCategory).toHaveBeenCalledWith('sles');
  });

  it('opens Cycle Time dropdown and selects scatter or histogram mode', () => {
    const handleSelectMode = vi.fn();
    const handleSelectCategory = vi.fn();

    render(
      <AnalyticsNavHeader
        activeCategory="cycle-time"
        onSelectCategory={handleSelectCategory}
        cycleTimeMode="scatter"
        onSelectCycleTimeMode={handleSelectMode}
      />
    );

    const trigger = screen.getByTestId('cycle-time-dropdown-trigger');
    fireEvent.click(trigger);

    const histogramOption = screen.getByTestId('mode-histogram');
    expect(histogramOption).toBeInTheDocument();

    fireEvent.click(histogramOption);
    expect(handleSelectMode).toHaveBeenCalledWith('histogram');
  });

  it('opens Blockers dropdown and selects clustering or dynamics mode', () => {
    const handleSelectMode = vi.fn();
    const handleSelectCategory = vi.fn();

    render(
      <AnalyticsNavHeader
        activeCategory="blockers"
        onSelectCategory={handleSelectCategory}
        blockerMode="clustering"
        onSelectBlockerMode={handleSelectMode}
      />
    );

    const trigger = screen.getByTestId('blockers-dropdown-trigger');
    fireEvent.click(trigger);

    const dynamicsOption = screen.getByTestId('mode-dynamics');
    expect(dynamicsOption).toBeInTheDocument();

    fireEvent.click(dynamicsOption);
    expect(handleSelectMode).toHaveBeenCalledWith('dynamics');
  });

  it('triggers onToggleDatasetDrawer when dataset config button is clicked', () => {
    const handleToggleDrawer = vi.fn();

    render(
      <AnalyticsNavHeader
        activeCategory="dashboard"
        onSelectCategory={vi.fn()}
        onToggleDatasetDrawer={handleToggleDrawer}
        hasActiveDatasetFilters={true}
      />
    );

    const drawerBtn = screen.getByTestId('dataset-drawer-trigger');
    expect(drawerBtn).toBeInTheDocument();
    expect(screen.getByTestId('dataset-filter-indicator')).toBeInTheDocument();

    fireEvent.click(drawerBtn);
    expect(handleToggleDrawer).toHaveBeenCalledTimes(1);
  });
});
