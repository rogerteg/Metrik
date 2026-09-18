import { useState, useEffect, useRef, useCallback } from 'react';
import { UseFieldEditOptions, UseFieldEditReturn, FieldEditStatus } from '../types/taskEdit';

/**
 * Hook universal para gerenciamento de persistência de campos de texto editáveis.
 * Suporta:
 * - Dirty tracking atômico
 * - Debounce inteligente configurável (padrão: 800ms)
 * - Persistência no blur quando autoSave === true
 * - Interceptação de Ctrl+S / Cmd+S e Escape
 * - Auto-dismiss de feedback "✓ Salvo" após 2 segundos
 */
export function useFieldEdit<T = string>({
  initialValue,
  onSave,
  autoSave = true,
  debounceMs = 800,
  isReadOnly = false,
}: UseFieldEditOptions<T>): UseFieldEditReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [originalValue, setOriginalValue] = useState<T>(initialValue);
  const [status, setStatus] = useState<FieldEditStatus>('idle');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const valueRef = useRef<T>(value);
  valueRef.current = value;

  const originalValueRef = useRef<T>(originalValue);
  originalValueRef.current = originalValue;

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const autoSaveRef = useRef(autoSave);
  autoSaveRef.current = autoSave;

  const debounceMsRef = useRef(debounceMs);
  debounceMsRef.current = debounceMs;

  const isReadOnlyRef = useRef(isReadOnly);
  isReadOnlyRef.current = isReadOnly;

  const isDirty = value !== originalValue;
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Sincroniza com alterações externas no initialValue caso o campo não esteja sujo
  useEffect(() => {
    if (!isDirtyRef.current && initialValue !== originalValueRef.current) {
      setValueState(initialValue);
      setOriginalValue(initialValue);
      setStatus('idle');
    }
  }, [initialValue]);

  // Limpeza de timers no desmonte
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const executeSave = useCallback((valToSave: T) => {
    if (isReadOnlyRef.current) return;

    clearDebounceTimer();
    clearDismissTimer();
    setStatus('saving');

    try {
      const result = onSaveRef.current(valToSave);
      if (result && typeof (result as unknown as Promise<void>).then === 'function') {
        (result as unknown as Promise<void>)
          .then(() => {
            setOriginalValue(valToSave);
            originalValueRef.current = valToSave;
            setStatus('saved');
            dismissTimerRef.current = setTimeout(() => {
              setStatus('idle');
            }, 2000);
          })
          .catch((err) => {
            console.error('[Metrik] Erro ao persistir campo:', err);
            setStatus('dirty');
          });
      } else {
        setOriginalValue(valToSave);
        originalValueRef.current = valToSave;
        setStatus('saved');
        dismissTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 2000);
      }
    } catch (err) {
      console.error('[Metrik] Erro ao persistir campo:', err);
      setStatus('dirty');
    }
  }, [clearDebounceTimer, clearDismissTimer]);

  const setValue = useCallback((nextVal: T) => {
    if (isReadOnlyRef.current) return;

    clearDismissTimer();
    setValueState(nextVal);
    valueRef.current = nextVal;

    const dirty = nextVal !== originalValueRef.current;

    if (dirty) {
      setStatus('dirty');
      if (autoSaveRef.current) {
        clearDebounceTimer();
        debounceTimerRef.current = setTimeout(() => {
          executeSave(nextVal);
        }, debounceMsRef.current);
      } else {
        clearDebounceTimer();
      }
    } else {
      clearDebounceTimer();
      setStatus('idle');
    }
  }, [clearDebounceTimer, clearDismissTimer, executeSave]);

  const saveNow = useCallback(() => {
    if (isReadOnlyRef.current || !isDirtyRef.current) return;
    executeSave(valueRef.current);
  }, [executeSave]);

  const discard = useCallback(() => {
    if (isReadOnlyRef.current) return;

    clearDebounceTimer();
    clearDismissTimer();
    setValueState(originalValueRef.current);
    valueRef.current = originalValueRef.current;
    setStatus('idle');
  }, [clearDebounceTimer, clearDismissTimer]);

  const handleBlur = useCallback(() => {
    if (isReadOnlyRef.current) return;
    if (autoSaveRef.current && isDirtyRef.current) {
      saveNow();
    }
  }, [saveNow]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (isReadOnlyRef.current) return;

    // Intercepta Ctrl+S (Windows/Linux) e Cmd+S (macOS)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      e.stopPropagation();
      saveNow();
      return;
    }

    // Intercepta Escape se houver alterações não salvas
    if (e.key === 'Escape' && isDirtyRef.current) {
      e.preventDefault();
      e.stopPropagation();
      discard();
      return;
    }
  }, [saveNow, discard]);

  return {
    value,
    setValue,
    isDirty,
    status,
    saveNow,
    discard,
    handleKeyDown,
    handleBlur,
  };
}
