import React from 'react';

/**
 * Estados do ciclo de vida da persistência de um campo textual editável.
 * - 'idle': sem alterações pendentes, campo sincronizado.
 * - 'dirty': conteúdo alterado localmente pelo usuário ainda não persistido.
 * - 'saving': processo de gravação ativo / em andamento.
 * - 'saved': gravação confirmada com sucesso (exibe feedback por 2s).
 */
export type FieldEditStatus = 'idle' | 'dirty' | 'saving' | 'saved';

/**
 * Estado encapsulado de controle de edição para um campo textual.
 */
export interface FieldEditState<T = string> {
  /** Valor original carregado antes de qualquer alteração na sessão de edição */
  originalValue: T;
  /** Valor atual em edição no input/textarea */
  currentValue: T;
  /** Flag booleana indicando se o valor atual difere do valor original */
  isDirty: boolean;
  /** Indicador visual do status da persistência */
  status: FieldEditStatus;
}

/**
 * Opções de configuração do hook useFieldEdit.
 */
export interface UseFieldEditOptions<T = string> {
  /** Valor inicial recebido da entidade de domínio (ex.: task.description) */
  initialValue: T;
  /** Callback executado para persistir o novo valor validado */
  onSave: (newValue: T) => void | Promise<void>;
  /** Se o modo de salvamento automático está ativado (default: true) */
  autoSave?: boolean;
  /** Tempo de debounce em ms (default: 800ms) */
  debounceMs?: number;
  /** Se o campo está em modo somente leitura (perfil guest) */
  isReadOnly?: boolean;
}

/**
 * Retorno público do hook useFieldEdit para integração em componentes React.
 */
export interface UseFieldEditReturn<T = string> {
  value: T;
  setValue: (value: T) => void;
  isDirty: boolean;
  status: FieldEditStatus;
  saveNow: () => void;
  discard: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  handleBlur: () => void;
}
