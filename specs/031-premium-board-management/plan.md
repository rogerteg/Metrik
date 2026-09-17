# Implementation Plan: Gerenciamento Premium de Quadros e Espaços (Aba Gerenciar)

**Branch**: `031-premium-board-management` | **Date**: 2026-09-17 | **Spec**: [`specs/031-premium-board-management/spec.md`](spec.md)

**Input**: Feature specification from `/specs/031-premium-board-management/spec.md`

---

## Summary

Esta funcionalidade substitui o modal legado de 540px (`BoardManagementModal.tsx`) por uma **Aba de Gerenciamento de Quadros** de primeira classe (`ManageBoardsView.tsx`), integrada ao cabeçalho superior (`Espaços | Quadro | Analytics | Gerenciar | Configurações`). O novo canvas de tela cheia oferece visualização responsiva em **Grade de Cartões Premium** e **Tabela Compacta de Alta Densidade**, cálculo de telemetria de fluxo em tempo real (WIP, tarefas, colunas e squads), busca instantânea por nome, filtros por equipe, edição rápida inline e diálogo modal seguro para exclusões sem dependência de `window.confirm`.

---

## Technical Context

**Language/Version**: TypeScript 5.6+, React 19.x  
**Primary Dependencies**: React, Lucide-style SVG icons nativos (Zero bibliotecas visuais externas, aderência estrita à Constituição V)  
**Storage**: Navegador `localStorage` (Local-First Sovereignty, Constituição VIII)  
**Testing**: Vitest 3.x + `@testing-library/react` + `@testing-library/jest-dom`  
**Target Platform**: Navegadores Web Modernos (Desktop, Tablet e Telas Compactas)  
**Project Type**: Web Application SPA  
**Performance Goals**: Filtragem em tempo real < 50ms, alternância de modo < 50ms, animações a 60fps  
**Constraints**: Metrik Design System puro (CSS Vanilla com tokens HSL e glassmorphism), Brand Independence (Constituição VII), Acessibilidade WCAG 2.1 AA  
**Scale/Scope**: 1 componente de visão principal, 3 subcomponentes especializados, 1 função utilitária pura, estilos CSS dedicados e testes unitários/integração  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Princípio I (Spec-Driven)**: Especificação formal em `spec.md`, checklist em `board-management.md`, pesquisa em `research.md`, modelo em `data-model.md` e contratos em `contracts/`.
- [x] **Princípio II (Qualidade & Modularidade)**: Separação estrita entre lógica pura de cálculo (`boardMetrics.ts`) e componentes de apresentação (`ManageBoardsView.tsx`, `BoardCardGrid.tsx`, `BoardTableView.tsx`, `DeleteBoardModal.tsx`).
- [x] **Princípio III (Verificação Automatizada)**: Testes unitários para utilitários puros e testes de componente cobrindo 100% dos fluxos antes de considerar o trabalho concluído.
- [x] **Princípio IV (Observabilidade)**: Tratamento explícito de estados vazios, erros de validação e desativação justificada de exclusão com prefixo estável `[Metrik]`.
- [x] **Princípio V (Simplicidade & YAGNI)**: Zero bibliotecas npm externas adicionadas; reutilização do ecossistema de componentes e tokens CSS existentes.
- [x] **Princípio VII (Independência de Marca)**: Proibição categórica de qualquer menção a nomes de softwares de terceiros em UI, código, tooltips ou atributos DOM.
- [x] **Princípio VIII (Local-First & Isolamento)**: Preservação da autoridade do `localStorage` e respeito estrito ao isolamento de squads (TBAC) e papel Convidado.

---

## Project Structure

### Documentation (this feature)

```text
specs/031-premium-board-management/
├── spec.md                                    # Especificação funcional refinada
├── checklists/
│   ├── requirements.md                        # Checklist de requisitos gerais
│   └── board-management.md                   # Checklist de qualidade de domínio (15 itens)
├── research.md                                # Decisões de arquitetura e justificativas
├── data-model.md                              # Modelagem de dados, telemetria e estados
├── quickstart.md                              # Guia de validação ponta a ponta
├── contracts/
│   └── board-management.contract.md          # Contratos TypeScript de interfaces e props
├── plan.md                                    # Este plano de implementação
└── tasks.md                                   # Lista de tarefas executáveis (/speckit-tasks)
```

### Source Code Planned Layout

```text
src/
├── types/
│   └── boardManagement.ts                     # [NEW] Tipos de telemetria, filtros e modal
├── utils/
│   └── boardMetrics.ts                        # [NEW] Função utilitária pura de métricas de quadros
├── components/
│   ├── ManageBoards/                          # [NEW] Diretório modular da tela de gerenciamento
│   │   ├── ManageBoardsView.tsx               # [NEW] Componente orquestrador da tela cheia
│   │   ├── BoardCardGrid.tsx                  # [NEW] Visualização em grade de cartões com glow
│   │   ├── BoardTableView.tsx                 # [NEW] Visualização em tabela compacta de dados
│   │   └── DeleteBoardModal.tsx               # [NEW] Diálogo modal seguro do Metrik Design System
│   ├── ManageBoards.css                       # [NEW] Estilização responsiva e temas
│   ├── BoardSwitcher.tsx                      # [MODIFY] Sincronizar botão Gerenciar com setView('manage')
│   └── App.tsx                                # [MODIFY] Adicionar 'manage' à navegação de abas
tests/
└── unit/
    ├── boardMetrics.test.ts                   # [NEW] Teste unitário para telemetria de quadros
    ├── ManageBoardsView.test.tsx              # [NEW] Testes de componente e alternância de modos
    └── DeleteBoardModal.test.tsx              # [NEW] Testes do modal seguro de confirmação
```

---

## Proposed Implementation Plan

### Phase 1: Setup & Data Types
- Criar `src/types/boardManagement.ts` definindo `BoardSummaryMetrics`, `BoardManagementFilterState` e `DeleteBoardModalState`.
- Reexportar os novos tipos em `src/types/kanban.ts` para conveniência.

### Phase 2: Pure Calculation Utilities (TDD)
- Criar `tests/unit/boardMetrics.test.ts` validando o cálculo de contagem de tarefas, colunas, WIP e marcação de quadro ativo.
- Implementar `src/utils/boardMetrics.ts` com a função pura `computeBoardSummaryMetrics`.

### Phase 3: Core UI Components
- Implementar `DeleteBoardModal.tsx` com bloqueio para último quadro e contagem de tarefas impactadas.
- Implementar `BoardCardGrid.tsx` com cartões visuais ricos, badges de squad, estatísticas de fluxo e botões de ação.
- Implementar `BoardTableView.tsx` com tabela semântica de alta densidade e colunas estruturadas.
- Implementar `ManageBoardsView.tsx` integrando barra de pesquisa, seletor de squad, barra de criação rápida, alternador de modo e gerenciamento de estado.
- Criar `src/components/ManageBoards.css` com suporte impecável aos temas claro e escuro.

### Phase 4: Integration & Navigation
- Atualizar `src/App.tsx` para incluir `'manage'` no estado `view` e renderizar `ManageBoardsView`.
- Adicionar o botão "Gerenciar" no `.view-toggle` do cabeçalho.
- Sincronizar o botão "Gerenciar" do `BoardSwitcher.tsx` para chavear para a nova tela.

### Phase 5: Verification & Brand Audit
- Executar testes automatizados no Vitest (`npm run test`).
- Validar compilação estrita e bundle de produção (`npm run build`).
- Auditar estritamente a conformidade com a Constituição VII (Brand Independence).
