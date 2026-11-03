import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnPolicies } from '../../src/hooks/useColumnPolicies';

describe('useColumnPolicies Hook', () => {
  const boardId = 'board-beta';

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve inicializar com mapa vazio', () => {
    const { result } = renderHook(() => useColumnPolicies(boardId));
    expect(result.current.policies).toEqual({});
  });

  it('deve definir ou atualizar política de uma coluna e persistir no storage', () => {
    const { result } = renderHook(() => useColumnPolicies(boardId));

    act(() => {
      result.current.setPolicy('col-1', {
        entryCriteria: 'Critério de entrada',
        exitCriteria: 'Critério de saída',
      });
    });

    expect(result.current.policies['col-1']).toBeDefined();
    expect(result.current.policies['col-1'].entryCriteria).toBe('Critério de entrada');
    expect(result.current.policies['col-1'].exitCriteria).toBe('Critério de saída');
    expect(result.current.hasPolicy('col-1')).toBe(true);

    // Persistência
    const raw = JSON.parse(localStorage.getItem(`metrik_column_policies_${boardId}`) || '{}');
    expect(raw['col-1'].entryCriteria).toBe('Critério de entrada');
  });

  it('deve retornar política vazia caso a coluna não possua cadastro', () => {
    const { result } = renderHook(() => useColumnPolicies(boardId));
    expect(result.current.getPolicy('col-inexistente')).toEqual({
      columnId: 'col-inexistente',
      entryCriteria: '',
      exitCriteria: '',
      updatedAt: '',
    });
    expect(result.current.hasPolicy('col-inexistente')).toBe(false);
  });

  it('deve remover a política de uma coluna', () => {
    const { result } = renderHook(() => useColumnPolicies(boardId));

    act(() => {
      result.current.setPolicy('col-2', {
        entryCriteria: 'Entrada',
        exitCriteria: 'Saída',
      });
    });
    expect(result.current.hasPolicy('col-2')).toBe(true);

    act(() => {
      result.current.deletePolicy('col-2');
    });
    expect(result.current.hasPolicy('col-2')).toBe(false);
  });
});
