# Interface Contracts: Salvamento Manual e Automático de Comentários e Campos da Tarefa

**Feature Branch**: `032-task-comment-autosave`  
**Date**: 2026-09-18  
**Spec**: [`specs/032-task-comment-autosave/spec.md`](../spec.md)

---

## 1. Contrato do Componente `TaskFieldActionToolbar`

Arquivo: `src/components/TaskFieldActionToolbar.tsx`

```typescript
import React from 'react';
import { FieldEditStatus } from '../types/taskEdit';

export interface TaskFieldActionToolbarProps {
  /** Estado de ciclo de vida do campo */
  status: FieldEditStatus;
  /** Se o conteúdo atual difere do conteúdo original */
  isDirty: boolean;
  /** Callback acionado ao clicar no botão "Salvar" */
  onSave: () => void;
  /** Callback acionado ao clicar no botão "Descartar" */
  onDiscard: () => void;
  /** Se o componente deve renderizar em modo somente leitura (perfil guest) */
  isReadOnly?: boolean;
  /** Prefixo descritivo para leitores de tela e ARIA (ex.: "da descrição") */
  ariaLabelPrefix?: string;
  /** Estilo de layout compacto para exibição dentro do cartão do quadro */
  compact?: boolean;
}

export declare const TaskFieldActionToolbar: React.FC<TaskFieldActionToolbarProps>;
```

---

## 2. Contrato do Hook `useFieldEdit`

Arquivo: `src/hooks/useFieldEdit.ts`

```typescript
import { UseFieldEditOptions, UseFieldEditReturn } from '../types/taskEdit';

/**
 * Hook universal para gerenciamento de estado de edição, dirty tracking,
 * atalhos de teclado (Ctrl+S / Cmd+S e Escape) e autosave inteligente.
 */
export declare function useFieldEdit<T = string>(
  options: UseFieldEditOptions<T>
): UseFieldEditReturn<T>;
```

### Regras de Negócio do Contrato:
1. `saveNow()`:
   - Se `isDirty === false`, nenhuma operação de escrita deve ser disparada.
   - Se `isDirty === true`, define `status = 'saving'`, invoca `onSave(currentValue)`, atualiza `originalValue = currentValue`, define `status = 'saved'` e agenda retorno para `'idle'` após 2000ms.
2. `discard()`:
   - Se `isDirty === true`, restaura `currentValue = originalValue`, cancela qualquer debounce pendente e define `status = 'idle'`.
3. `handleKeyDown(e)`:
   - Se `(e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'`:
     - Invoca `e.preventDefault()` e `e.stopPropagation()`.
     - Invoca `saveNow()`.
   - Se `e.key === 'Escape' && isDirty`:
     - Invoca `e.preventDefault()` e `e.stopPropagation()`.
     - Invoca `discard()`.
4. `autoSave === true`:
   - Ao alterar `currentValue` via `setValue`, cancela timer anterior e agenda `saveNow()` após `debounceMs` (default: 800ms).
   - Ao disparar `handleBlur()`, se `isDirty === true`, executa `saveNow()` imediatamente.
5. `autoSave === false`:
   - Nenhuma gravação automática ocorre nem no timer nem no `handleBlur()`.

---

## 3. Contrato Estendido dos Componentes Consumidores

### `TaskProps` (`src/components/Task.tsx`)
```typescript
export interface TaskProps {
  // ... propriedades existentes ...
  /** Modo de persistência de comentários e campos textuais (padrão: true) */
  autoSaveComments?: boolean;
  /** Debounce de autosave em ms (padrão: 800ms) */
  autoSaveDebounceMs?: number;
}
```

### `TaskDetailsModalProps` (`src/components/TaskDetailsModal.tsx`)
```typescript
export interface TaskDetailsModalProps {
  // ... propriedades existentes ...
  /** Modo de persistência de comentários e campos textuais (padrão: true) */
  autoSaveComments?: boolean;
  /** Debounce de autosave em ms (padrão: 800ms) */
  autoSaveDebounceMs?: number;
}
```
