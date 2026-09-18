# Implementation Plan: Salvamento Manual e Automático de Comentários e Campos da Tarefa

**Branch**: `032-task-comment-autosave` | **Date**: 2026-09-18 | **Spec**: [`specs/032-task-comment-autosave/spec.md`](spec.md)

**Input**: Feature specification from `/specs/032-task-comment-autosave/spec.md`

---

## Summary

Esta funcionalidade introduz controle explícito e ergonômico de persistência para todos os campos textuais das tarefas (Título, Descrição, Critérios de Aceitação, Cenários de Testes e Motivo de Bloqueio), tanto nos cartões do quadro Kanban (`Task.tsx`) quanto no modal de detalhes (`TaskDetailsModal.tsx`). O sistema oferece:
1. **Botões dedicados "Salvar" e "Descartar"** com barra de ações responsiva (`TaskFieldActionToolbar.tsx`).
2. **Atalhos de teclado universais** `Ctrl+S` / `Cmd+S` (com bloqueio do diálogo nativo do navegador) e `Escape` para cancelamento.
3. **Interruptor global na tela de Configurações** (`SettingsView` -> Geral) para habilitar/desabilitar o salvamento automático (`autoSaveComments: boolean`), com debounce inteligente de 800ms.
4. **Micro-indicadores visuais de ciclo de vida** ("Alterações não salvas", "Salvando...", "✓ Salvo" com auto-dismiss após 2s).
5. **Guarda de integridade no modal de detalhes**, impedindo perda acidental de dados não salvos ao fechar no modo manual.

---

## Technical Context

**Language/Version**: TypeScript 5.6+, React 19.x  
**Primary Dependencies**: React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`), Lucide-style SVG icons nativos (Zero bibliotecas npm externas adicionadas, Constituição V)  
**Storage**: Navegador `localStorage` (`metrik_app_settings` e `metrik-tasks-{boardId}`, Constituição VIII)  
**Testing**: Vitest 3.x + `@testing-library/react` + `@testing-library/jest-dom`  
**Target Platform**: Navegadores Web Modernos (Desktop, Tablet e Mobile)  
**Project Type**: Web Application SPA Local-First  
**Performance Goals**: Latência de persistência < 100ms, debounce inteligente com redução > 70% de escritas redundantes, animações 60fps  
**Constraints**: Metrik Design System puro (CSS Vanilla com tokens HSL e glassmorphism), Brand Independence (Constituição VII), Acessibilidade WCAG 2.1 AA (`aria-live="polite"`, atalhos de teclado)  
**Scale/Scope**: 1 novo tipo TypeScript, 1 novo hook (`useFieldEdit`), 1 novo componente de barra de ação (`TaskFieldActionToolbar`), atualização em 3 componentes existentes (`Task.tsx`, `TaskDetailsModal.tsx`, `GeneralSettingsTab.tsx`) e suítes de testes unitários.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Princípio I (Spec-Driven)**: Especificação formal em `spec.md`, checklist em `requirements.md`, pesquisa em `research.md`, modelo em `data-model.md` e contratos em `contracts/`.
- [x] **Princípio II (Qualidade & Modularidade)**: Lógica de edição isolada no hook `useFieldEdit.ts`, apresentação desacoplada em `TaskFieldActionToolbar.tsx`.
- [x] **Princípio III (Verificação Automatizada)**: Testes unitários para utilitários, hooks e componentes com 100% de testes verdes em `npm run test`.
- [x] **Princípio IV (Observabilidade)**: Tratamento e logging com prefixo estável `[Metrik]` em falhas de persistência.
- [x] **Princípio V (Simplicidade & YAGNI)**: Zero bibliotecas npm externas; aproveitamento total dos padrões já existentes.
- [x] **Princípio VII (Independência de Marca)**: Nenhuma menção a marcas proprietárias de terceiros em UI, código, tooltips ou comentários.
- [x] **Princípio VIII (Local-First & TBAC)**: Persistência autoritativa local sem dependência de rede; respeito ao modo somente leitura para perfis `guest`.

---

## Project Structure

### Documentation (this feature)

```text
specs/032-task-comment-autosave/
├── spec.md                                        # Especificação de requisitos funcionais e não-funcionais
├── checklists/
│   ├── requirements.md                            # Checklist de qualidade da especificação
│   └── task-comment-autosave.md                   # Checklist de revisão de domínio (18 critérios)
├── research.md                                    # Decisões de arquitetura, debounce e atalhos de teclado
├── data-model.md                                  # Extensão de AppSettings e tipos de FieldEditState
├── quickstart.md                                  # Guia de validação automatizada e manual
├── contracts/
│   └── task-comment-autosave.contract.md          # Contratos TypeScript de interfaces e props
├── plan.md                                        # Este plano de implementação
└── tasks.md                                       # Lista de tarefas executáveis com 6 modelos analíticos
```

### Source Code Planned Layout

```text
src/
├── types/
│   ├── taskEdit.ts                                # [NEW] Tipos FieldEditState, FieldEditStatus e UseFieldEditOptions
│   └── workspace.ts                               # [MODIFY] Adicionar autoSaveComments e autoSaveDebounceMs a AppSettings
├── hooks/
│   ├── useFieldEdit.ts                            # [NEW] Hook de gerenciamento de estado de edição, debounce e atalhos
│   └── useAppSettings.ts                          # [MODIFY] Adicionar autoSaveComments aos DEFAULT_APP_SETTINGS
├── components/
│   ├── TaskFieldActionToolbar.tsx                 # [NEW] Barra de botões Salvar/Descartar e badge de status
│   ├── TaskFieldActionToolbar.css                 # [NEW] Estilos com tokens do Metrik Design System
│   ├── Task.tsx                                   # [MODIFY] Integrar useFieldEdit e toolbar nos campos do cartão
│   ├── TaskDetailsModal.tsx                       # [MODIFY] Integrar useFieldEdit, toolbar e guarda de fechamento não salvo
│   ├── TaskDetailsModal.css                       # [MODIFY] Estilos para o guarda de alterações pendentes
│   ├── Settings/
│   │   └── GeneralSettingsTab.tsx                 # [MODIFY] Adicionar toggle switch de autoSaveComments
│   └── App.tsx                                    # [MODIFY] Propagar settings.autoSaveComments para Task e TaskDetailsModal
tests/
└── unit/
    ├── useFieldEdit.test.ts                       # [NEW] Testes unitários para debounce, dirty tracking e saveNow
    ├── TaskFieldActionToolbar.test.tsx            # [NEW] Testes unitários do componente de barra de ação
    ├── TaskAutosave.test.tsx                      # [NEW] Testes de integração de edição no cartão e atalhos Ctrl+S
    └── TaskDetailsModalAutosave.test.tsx          # [NEW] Testes de integração no modal e guarda de fechamento
```

---

## Proposed Implementation Plan

### Phase 1: Setup & Data Types
- Criar `src/types/taskEdit.ts` com `FieldEditStatus`, `FieldEditState`, `UseFieldEditOptions` e `UseFieldEditReturn`.
- Atualizar `src/types/workspace.ts` adicionando `autoSaveComments?: boolean` e `autoSaveDebounceMs?: number` a `AppSettings`.
- Atualizar `src/hooks/useAppSettings.ts` com valores padrão em `DEFAULT_APP_SETTINGS`.

### Phase 2: Core Editing Hook & Toolbar Component (TDD)
- Criar teste unitário `tests/unit/useFieldEdit.test.ts` validando dirty tracking, debounce de 800ms, saveNow, discard e interceptação de teclas (`Ctrl+S`, `Escape`).
- Implementar `src/hooks/useFieldEdit.ts`.
- Criar teste unitário `tests/unit/TaskFieldActionToolbar.test.tsx` cobrindo renderização de status ("Salvando...", "✓ Salvo"), botões e acessibilidade.
- Implementar `src/components/TaskFieldActionToolbar.tsx` e `src/components/TaskFieldActionToolbar.css`.

### Phase 3: User Story 1 - Botões Salvar/Descartar e Atalho Ctrl+S nos Cartões e Modal (MVP)
- Atualizar `src/components/Task.tsx` para utilizar `useFieldEdit` e `TaskFieldActionToolbar` no título, critérios de aceitação e cenários de testes.
- Atualizar `src/components/TaskDetailsModal.tsx` para utilizar `useFieldEdit` e `TaskFieldActionToolbar` nos campos de texto editáveis, adicionando diálogo de guarda de fechamento para alterações pendentes.
- Conectar propriedades em `src/App.tsx`.

### Phase 4: User Story 2 - Configuração Global de Salvamento Automático
- Atualizar `src/components/Settings/GeneralSettingsTab.tsx` adicionando o switch configurável para *"Salvar automaticamente comentários e campos de texto"*.
- Garantir que a alteração do switch reflita imediatamente nos campos do cartão e do modal.

### Phase 5: User Story 3 - Feedback Visual e Polish
- Refinar animações de transição suave do status ("✓ Salvo" fade-out após 2 segundos).
- Verificar que o atalho `Ctrl+S` / `Cmd+S` impede o comportamento nativo do navegador em todos os cenários.
- Validar acessibilidade WCAG 2.1 AA (`aria-live="polite"`, labels e tooltips de atalho).

### Phase 6: Verification & Cross-Cutting Quality
- Executar suíte completa de testes (`npm run test`) assegurando 100% de aprovação.
- Executar `npm run build` garantindo zero erros de tipagem e compilação limpa.
- Auditoria da Constituição VII (Brand Independence) em código, comentários e UI.
