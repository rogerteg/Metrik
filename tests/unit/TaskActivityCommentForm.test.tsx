import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskActivityCommentForm } from '../../src/components/TaskActivityCommentForm.tsx';

describe('TaskActivityCommentForm', () => {
  it('renders textarea with placeholder "Escreva um comentário..."', () => {
    render(<TaskActivityCommentForm taskId="task-1" onSubmitComment={vi.fn()} />);
    expect(screen.getByPlaceholderText('Escreva um comentário...')).toBeInTheDocument();
  });

  it('submit button is disabled when comment text is empty or whitespace', () => {
    render(<TaskActivityCommentForm taskId="task-1" onSubmitComment={vi.fn()} />);
    const submitBtn = screen.getByRole('button', { name: /Enviar/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button and calls onSubmitComment when text is entered', () => {
    const onSubmitComment = vi.fn();
    render(<TaskActivityCommentForm taskId="task-1" onSubmitComment={onSubmitComment} />);
    const input = screen.getByPlaceholderText('Escreva um comentário...');
    
    fireEvent.change(input, { target: { value: 'Comentário de teste' } });
    const submitBtn = screen.getByRole('button', { name: /Enviar/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    expect(onSubmitComment).toHaveBeenCalledWith('Comentário de teste');
  });

  it('submits on Ctrl+Enter keyboard shortcut', () => {
    const onSubmitComment = vi.fn();
    render(<TaskActivityCommentForm taskId="task-1" onSubmitComment={onSubmitComment} />);
    const input = screen.getByPlaceholderText('Escreva um comentário...');

    fireEvent.change(input, { target: { value: 'Atalho teclado' } });
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    expect(onSubmitComment).toHaveBeenCalledWith('Atalho teclado');
  });
});
