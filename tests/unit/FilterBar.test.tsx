import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '../../src/components/FilterBar';
import { FilterState } from '../../src/types/filter';

describe('FilterBar Component (US3 & US4)', () => {
  const defaultFilters: FilterState = {
    searchQuery: '',
    priorityFilter: 'all',
    selectedTags: [],
  };

  it('renders search input, priority buttons, tags, and counter', () => {
    render(
      <FilterBar
        filters={defaultFilters}
        onSearchChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onToggleTag={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        availableTags={['Backend', 'Frontend', 'DevOps']}
        visibleCount={10}
        totalCount={10}
      />
    );

    expect(screen.getByPlaceholderText(/buscar tarefas/i)).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('DevOps')).toBeInTheDocument();
    expect(screen.getByText(/10 de 10 tarefas/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /limpar filtros/i })).toBeNull();
  });

  it('calls onSearchChange when user types in search input', () => {
    const handleSearch = vi.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        onSearchChange={handleSearch}
        onPriorityChange={vi.fn()}
        onToggleTag={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        availableTags={[]}
        visibleCount={5}
        totalCount={10}
      />
    );

    const searchInput = screen.getByPlaceholderText(/buscar tarefas/i);
    fireEvent.change(searchInput, { target: { value: 'login' } });

    expect(handleSearch).toHaveBeenCalledWith('login');
  });

  it('calls onPriorityChange when priority pill is clicked', () => {
    const handlePriority = vi.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        onSearchChange={vi.fn()}
        onPriorityChange={handlePriority}
        onToggleTag={vi.fn()}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        availableTags={[]}
        visibleCount={10}
        totalCount={10}
      />
    );

    const urgentBtn = screen.getByRole('button', { name: /urgente/i });
    fireEvent.click(urgentBtn);

    expect(handlePriority).toHaveBeenCalledWith('urgent');
  });

  it('calls onToggleTag when a tag pill is clicked', () => {
    const handleToggleTag = vi.fn();
    render(
      <FilterBar
        filters={defaultFilters}
        onSearchChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onToggleTag={handleToggleTag}
        onClearFilters={vi.fn()}
        hasActiveFilters={false}
        availableTags={['API', 'Bug']}
        visibleCount={10}
        totalCount={10}
      />
    );

    fireEvent.click(screen.getByText('API'));
    expect(handleToggleTag).toHaveBeenCalledWith('API');
  });

  it('renders "Limpar Filtros" button when hasActiveFilters is true and handles click', () => {
    const handleClear = vi.fn();
    const activeFilters: FilterState = {
      searchQuery: 'api',
      priorityFilter: 'high',
      selectedTags: ['Backend'],
    };

    render(
      <FilterBar
        filters={activeFilters}
        onSearchChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onToggleTag={vi.fn()}
        onClearFilters={handleClear}
        hasActiveFilters={true}
        availableTags={['Backend']}
        visibleCount={2}
        totalCount={10}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /limpar filtros/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
