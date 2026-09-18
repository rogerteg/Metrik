import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFieldEdit } from '../../src/hooks/useFieldEdit';

describe('useFieldEdit Hook (TDD - Feature 032)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('inicia com valor inicial, isDirty falso e status idle', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Texto original',
        onSave,
      })
    );

    expect(result.current.value).toBe('Texto original');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.status).toBe('idle');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('detecta dirty state ao alterar o valor e retorna para idle ao reverter para o original', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Original',
        onSave,
        autoSave: false,
      })
    );

    act(() => {
      result.current.setValue('Modificado');
    });

    expect(result.current.value).toBe('Modificado');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.status).toBe('dirty');

    act(() => {
      result.current.setValue('Original');
    });

    expect(result.current.isDirty).toBe(false);
    expect(result.current.status).toBe('idle');
  });

  it('executa salvamento automático com debounce de 800ms por padrão quando autoSave é true', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Início',
        onSave,
        autoSave: true,
      })
    );

    act(() => {
      result.current.setValue('Digitando...');
    });

    expect(onSave).not.toHaveBeenCalled();

    // Avança 799ms - ainda não deve ter salvo
    act(() => {
      vi.advanceTimersByTime(799);
    });
    expect(onSave).not.toHaveBeenCalled();

    // Completa os 800ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Digitando...');
    expect(result.current.status).toBe('saved');
    expect(result.current.isDirty).toBe(false);

    // Após 2000ms o status volta para idle
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.status).toBe('idle');
  });

  it('reinicia o temporizador de debounce se o usuário continuar digitando', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: '',
        onSave,
        autoSave: true,
        debounceMs: 500,
      })
    );

    act(() => {
      result.current.setValue('A');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.setValue('AB');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onSave).not.toHaveBeenCalled();

    // Agora aguarda o debounce completo
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('AB');
  });

  it('no modo automático, handleBlur força gravação imediata se houver dirty pendente', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Antes',
        onSave,
        autoSave: true,
      })
    );

    act(() => {
      result.current.setValue('Depois');
    });

    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      result.current.handleBlur();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Depois');
    expect(result.current.status).toBe('saved');
  });

  it('no modo manual (autoSave: false), nem debounce nem handleBlur gravam automaticamente', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Texto',
        onSave,
        autoSave: false,
      })
    );

    act(() => {
      result.current.setValue('Alteração manual');
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      result.current.handleBlur();
    });
    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.isDirty).toBe(true);

    // saveNow() explícito grava
    act(() => {
      result.current.saveNow();
    });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Alteração manual');
    expect(result.current.status).toBe('saved');
  });

  it('discard() reverte o conteúdo para o original e cancela estado pendente', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Conteúdo Seguro',
        onSave,
        autoSave: true,
      })
    );

    act(() => {
      result.current.setValue('Conteúdo indesejado digitado por engano');
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.discard();
    });

    expect(result.current.value).toBe('Conteúdo Seguro');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.status).toBe('idle');

    // Avança timers para garantir que debounce foi cancelado
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('intercepta atalho Ctrl+S ou Cmd+S prevenindo evento nativo e salvando imediatamente', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Inicial',
        onSave,
        autoSave: false,
      })
    );

    act(() => {
      result.current.setValue('Nova versão');
    });

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const syntheticEvent = {
      ctrlKey: true,
      metaKey: false,
      key: 's',
      preventDefault,
      stopPropagation,
    } as unknown as React.KeyboardEvent<HTMLElement>;

    act(() => {
      result.current.handleKeyDown(syntheticEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('Nova versão');
  });

  it('intercepta tecla Escape para descartar alterações pendentes', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Inicial',
        onSave,
      })
    );

    act(() => {
      result.current.setValue('Modificado');
    });

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const syntheticEvent = {
      key: 'Escape',
      preventDefault,
      stopPropagation,
    } as unknown as React.KeyboardEvent<HTMLElement>;

    act(() => {
      result.current.handleKeyDown(syntheticEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(result.current.value).toBe('Inicial');
    expect(result.current.isDirty).toBe(false);
  });

  it('respeita isReadOnly impedindo modificações e salvamentos', () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useFieldEdit({
        initialValue: 'Somente Leitura',
        onSave,
        isReadOnly: true,
      })
    );

    act(() => {
      result.current.setValue('Tentativa de hack');
      result.current.saveNow();
    });

    expect(result.current.value).toBe('Somente Leitura');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('atualiza valor quando initialValue externo muda e campo não está sujo (isDirty: false)', () => {
    const onSave = vi.fn();
    const { result, rerender } = renderHook(
      ({ initialValue }) =>
        useFieldEdit({
          initialValue,
          onSave,
        }),
      { initialProps: { initialValue: 'Versão 1' } }
    );

    expect(result.current.value).toBe('Versão 1');

    rerender({ initialValue: 'Versão 2' });
    expect(result.current.value).toBe('Versão 2');
    expect(result.current.isDirty).toBe(false);
  });
});
