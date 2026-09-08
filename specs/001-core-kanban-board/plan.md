# Implementation Plan: Core Kanban Board (MVP Fase 1)

**Branch**: `001-core-kanban-board` | **Date**: 2026-09-08 | **Spec**: [specs/001-core-kanban-board/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-core-kanban-board/spec.md`

---

## Summary

Implementação do núcleo funcional do quadro Kanban do Metrik (Fase 1 do MVP). A solução contempla um layout responsivo de 4 colunas (`Todo`, `In Progress`, `Blocked`, `Completed`), criação e edição atômica de tarefas inline com redimensionamento dinâmico de altura, transição de estado entre colunas e persistência reativa no `localStorage` do navegador.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19  
**Primary Dependencies**: Vite 6, Emotion / Vanilla CSS tokens, `uuid` (v4), `usehooks-ts` (para abstração tipada de Web Storage)  
**Storage**: Web Storage API (`localStorage` sob a chave `metrik_kanban_tasks`)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Navegadores Web Modernos (Desktop & Mobile)  
**Project Type**: Single Page Web Application (SPA)  
**Performance Goals**: Tempo de renderização inicial < 200ms; resposta de edição e transição de estado < 16ms (60 FPS)  
**Constraints**: 100% offline-first no MVP (Zero dependência inicial de backend em nuvem); cota de storage < 1MB  
**Scale/Scope**: Suporte a até 500 cartões ativos sem degradação perceptível de fluidez  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Specification-Driven Development**: **PASS** — O ciclo cumpre a precedência estrita: `constitution.md` → `spec.md` → `plan.md` → `tasks.md` antes de qualquer escrita de código.
- **II. Code Quality & Modularity**: **PASS** — Arquitetura dividida em componentes puros (`Column`, `Task`, `Board`), hooks especializados (`useTaskCollection`, `useColumnTasks`) e tipos declarativos (`src/types/kanban.ts`). Zero acoplamento circular.
- **III. Automated Verification & Testing**: **PASS** — Cobertura planejada com testes unitários para a lógica de mutação do estado e testes de renderização/interação de componentes.
- **IV. Observability & Structured Logging**: **PASS** — Mensagens informativas em console para inicialização do storage, eventos de transição e fallbacks de recuperação de dados.
- **V. Simplicity & YAGNI**: **PASS** — Sem frameworks pesados de gerenciamento de estado global nem backends prematuros; usa React Hooks nativos e `localStorage`.
- **VI. Analytical Reasoning Pre-Task Creation**: **PASS** — A criação de `tasks.md` pelo `/speckit-tasks` será antecedida obrigatoriamente pelos 6 modelos analíticos formais (Primeiros Princípios, Premortem, MECE, Tree of Thoughts, Falsificabilidade e Triangulação Constitucional).

---

## Project Structure

### Documentation (this feature)

```text
specs/001-core-kanban-board/
├── spec.md              # Especificação de requisitos funcionais e histórias de usuário
├── plan.md              # Este plano de arquitetura técnica
├── research.md          # Decisões técnicas e trade-offs avaliados
├── data-model.md        # Modelos TypeScript e regras de validação
├── quickstart.md        # Guia de execução e roteiro de testes
├── contracts/           # Contratos de schema JSON para persistência
│   └── board-storage-contract.json
└── tasks.md             # Tarefas atômicas geradas pelo /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Board.tsx             # Container grid do quadro Kanban (4 colunas)
│   ├── Column.tsx            # Coluna individual com badge de status e contador
│   ├── Task.tsx              # Cartão de tarefa com edição inline e exclusão
│   └── AutoResizeTextarea.tsx # Componente de textarea com auto-ajuste de altura
├── hooks/
│   ├── useTaskCollection.ts  # Hook mestre de persistência e operações no LocalStorage
│   └── useColumnTasks.ts     # Hook contextual para operações específicas de uma coluna
├── types/
│   └── kanban.ts             # Tipos TaskModel, ColumnType, BoardState
├── utils/
│   └── seedData.ts           # Dados iniciais para primeiro carregamento
├── App.tsx                   # Entrada da aplicação com cabeçalho e controles globais
├── App.css                   # Estilos globais e tokens de cores
└── main.tsx                  # Ponto de montagem React 19
```

**Structure Decision**: Aplicação web React modularizada por componentes, hooks e tipos dedicados, mantendo responsabilidade única e desacoplamento total entre lógica de armazenamento e camada visual.

---

## Complexity Tracking

> **Status**: Nenhuma violação aos princípios constitucionais. Arquitetura enxuta, minimalista e 100% alinhada com YAGNI e código limpo.
