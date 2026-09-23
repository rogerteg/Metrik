import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskActivityHeader } from '../../src/components/TaskActivityHeader';

describe('TaskActivityHeader', () => {
  const defaultProps = {
    unreadCount: 3,
    isSearchOpen: false,
    searchQuery: '',
    selectedCategory: 'all' as const,
    onToggleSearch: vi.fn(),
    onSearchQueryChange: vi.fn(),
    onToggleUnreadFilter: vi.fn(),
    onSelectCategoryFilter: vi.fn(),
  };

  it('renders title "Activity" and notification counter badge "3"', () => {
    render(<TaskActivityHeader {...defaultProps} />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onToggleSearch when search button is clicked', () => {
    render(<TaskActivityHeader {...defaultProps} />);
    const searchBtn = screen.getByLabelText('Buscar atividade');
    fireEvent.click(searchBtn);
    expect(defaultProps.onToggleSearch).toHaveBeenCalledTimes(1);
  });

  it('renders search input when isSearchOpen is true and handles query change', () => {
    render(<TaskActivityHeader {...defaultProps} isSearchOpen={true} />);
    const input = screen.getByPlaceholderText('Buscar no histórico...');
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Danillo' } });
    expect(defaultProps.onSearchQueryChange).toHaveBeenCalledWith('Danillo');
  });

  it('calls onToggleUnreadFilter when notification bell is clicked', () => {
    render(<TaskActivityHeader {...defaultProps} />);
    const bellBtn = screen.getByLabelText('Notificações de atividade');
    fireEvent.click(bellBtn);
    expect(defaultProps.onToggleUnreadFilter).toHaveBeenCalledTimes(1);
  });

  it('opens filter menu dropdown and calls onSelectCategoryFilter', () => {
    render(<TaskActivityHeader {...defaultProps} />);
    const filterBtn = screen.getByLabelText('Filtrar atividade');
    fireEvent.click(filterBtn);
    
    const commentsOption = screen.getByText('Comentários');
    fireEvent.click(commentsOption);
    expect(defaultProps.onSelectCategoryFilter).toHaveBeenCalledWith('comments');
  });
});
