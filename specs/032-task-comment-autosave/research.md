# Research & Technical Decisions: Salvamento Manual e Automático de Comentários e Campos da Tarefa

**Feature Branch**: `032-task-comment-autosave`  
**Date**: 2026-09-18  
**Spec**: [`specs/032-task-comment-autosave/spec.md`](spec.md)

---

## 1. Contexto & Desafios Técnicos

Atualmente no Metrik:
1. No cartão do quadro (`src/components/Task.tsx`):
   - O título utiliza `AutoResizeTextarea` que dispara `onUpdateTitle` no `onChange` e `handleBlur` ao perder o foco.
   - Os campos de "Critérios de Aceitação" e "Cenários de Testes" utilizam textareas simples que chamam `onUpdateTask(task.id, { ... })` a cada tecla digitada (`onChange`), gerando dezenas de mutações por segundo no estado global do React e no `localStorage`.
   - Não há botões de "Salvar" ou "Descartar", nem suporte a `Ctrl+S` / `Cmd+S`, nem indicador de alterações pendentes ou salvo.
2. No modal de detalhes (`src/components/TaskDetailsModal.tsx`):
   - Mantém estados locais (`localTitle`, `localDescription`, `localAcceptanceCriteria`, etc.).
   - Dispara `onUpdateTask` exclusivamente nos eventos de `onBlur`.
   - Se o usuário fechar o modal (via '×', tecla Escape ou clique fora) enquanto editava um campo sem ter clicado fora do campo primeiro, as alterações não salvas podem ser descartadas silenciosamente ou salvas sem consentimento explícito.
3. Nas preferências (`src/types/workspace.ts` e `src/hooks/useAppSettings.ts`):
   - `AppSettings` não possui a chave `autoSaveComments`.

---

## 2. Decisões Arquiteturais & Justificativas

### Decisão 1: Encapsulamento de Estado de Edição de Campo via Hook Reutilizável (`useFieldEdit`)

- **Escolha**: Criar um hook modular e testável `useFieldEdit` em `src/hooks/useFieldEdit.ts`.
- **Responsabilidades**:
  - Controlar valor original vs valor corrente (`currentValue`, `originalValue`).
  - Calcular `isDirty` (`currentValue !== originalValue`).
  - Gerenciar status de ciclo de vida: `'idle' | 'dirty' | 'saving' | 'saved'`.
  - Agendar salvamento automático via debounce (800ms por padrão) se `autoSaveComments === true`.
  - Interromper temporizador e salvar imediatamente ao chamar `saveNow()` (via botão ou `Ctrl+S`).
  - Reverter para `originalValue` ao chamar `discard()` (via botão ou tecla `Escape`).
  - Limpar timers pendentes em desmontagens para prevenir vazamento de memória.
- **Alternativas consideradas**:
  - *Lógica inline duplicada em cada componente (`Task.tsx` e `TaskDetailsModal.tsx`)*: Rejeitada pela violação de DRY e alta propensão a bugs sutis de dessincronização.
  - *Estado global no useTaskCollection*: Rejeitada por acoplar estados efêmeros de digitação de UI a um repositório de domínio, degradando a performance com re-renderizações em cascata.

### Decisão 2: Interceptação Universal de Atalho de Teclado (`Ctrl+S` / `Cmd+S` e `Escape`)

- **Escolha**: Interceptar `Ctrl+S` (Windows/Linux) e `Cmd+S` (macOS) no nível do campo em foco (no evento `onKeyDown`) ou listener de teclado do modal.
- **Comportamento**:
  - Chamar `event.preventDefault()` e `event.stopPropagation()` para impedir que o navegador abra o diálogo nativo "Salvar página como...".
  - Disparar o salvamento imediato do campo ativo, exibindo feedback visual "✓ Salvo".
  - A tecla `Escape` dentro do campo com alterações pendentes reverte as edições (`discard()`) e remove o foco ou impede o fechamento imediato do modal no mesmo toque.
- **Alternativas consideradas**:
  - *Listener global no `window`*: Rejeitada porque pode interceptar `Ctrl+S` quando o usuário não estiver em nenhum campo de edição de tarefa, causando comportamentos inesperados.

### Decisão 3: Componente de Ações de Edição (`TaskFieldActionToolbar.tsx`)

- **Escolha**: Criar um microcomponente discreto e estético `TaskFieldActionToolbar` contendo:
  - Indicador de estado: "Alterações não salvas" (âmbar com ponto luminoso), "Salvando..." (spinner/pulso azul), "✓ Salvo" (verde com auto-dismiss após 2s).
  - Botão "Salvar" (com ícone de check/disquete e tooltip informando `Ctrl+S`).
  - Botão "Descartar" (com ícone de '×' e tooltip informando `Esc`).
  - Respeito à acessibilidade: `aria-live="polite"` e suporte a navegação por teclado.
- **Aparência**:
  - Integrado perfeitamente ao Metrik Design System (CSS Vanilla, bordas suaves, glassmorphism, temas claro e escuro).

### Decisão 4: Persistência de Preferência em `AppSettings`

- **Escolha**:
  - Adicionar `autoSaveComments: boolean` (default: `true`) e opcionalmente `autoSaveDebounceMs: number` (default: `800`) em `AppSettings` (`src/types/workspace.ts`).
  - Exibir interruptor (toggle switch) na tela de configurações (`src/components/Settings/GeneralSettingsTab.tsx`).
  - Rótulo canônico: *"Salvar automaticamente comentários e campos de texto"*.
  - Descrição: *"Salva automaticamente alterações em descrições, notas e critérios de aceitação ao digitar e ao mudar de campo."*.

### Decisão 5: Guarda de Fechamento com Alterações Pendentes no Modal

- **Escolha**: Se `autoSaveComments === false` e o modal de detalhes possuir campos alterados não salvos, ao tentar fechar (botão fechar, clique no overlay ou tecla Escape):
  - Exibir um diálogo de confirmação prevenindo a perda acidental dos dados: "Existem alterações não salvas na tarefa. Deseja salvar antes de sair?".
  - Opções: "Salvar e Fechar", "Descartar Alterações" ou "Continuar Editando".
- **Benefício**: Proteção psicológica total (SC-003 da especificação).

---

## 3. Matriz de Compatibilidade e Conformidade Constitucional

| Princípio Constitucional | Verificação |
|---|---|
| **I. Spec-Driven** | Requisitos funcionais FR-001 a FR-013 mapeados com 100% de rastreabilidade. |
| **II. Qualidade & Modularidade** | Lógica pura de edição isolada no hook `useFieldEdit`; apresentação em `TaskFieldActionToolbar`. |
| **III. Verificação Automatizada** | Testes unitários para o hook `useFieldEdit`, toolbar, `Task.tsx`, `TaskDetailsModal.tsx` e `SettingsView.tsx`. |
| **IV. Observabilidade** | Logs de diagnóstico com prefixo `[Metrik]` em erros de persistência. |
| **V. Simplicidade & YAGNI** | Zero dependências externas; reutilização de React standard hooks e CSS vanilla. |
| **VII. Independência de Marca** | Nenhuma referência a softwares de terceiros; vocabulário estritamente canônico. |
| **VIII. Local-First** | Persistência exclusiva em `localStorage` via hooks já existentes. |
