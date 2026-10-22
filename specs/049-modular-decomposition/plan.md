# Implementation Plan: Decomposição de Módulos Extensos (OPP-002)

**Branch**: `049-modular-decomposition` | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/049-modular-decomposition/spec.md`

---

## Summary

Execução da Fase 1 do Roadmap (OPP-002 de `specs/043-system-health-and-roadmap/vision.md`) para sanar a dívida técnica de concentração de responsabilidades em quatro módulos centrais de interface e estado (`Task.tsx`, `App.tsx`, `TaskDetailsModal.tsx`, `useTaskCollection.ts`), todos atualmente acima de 700 linhas (totalizando 3.148 linhas).

A solução adota:
1. **Pastas Modulares Dedicadas**: Subdiretórios `src/components/Task/` e `src/components/TaskDetailsModal/` com subcomponentes atômicos e fachadas raiz retrocompatíveis.
2. **Padrão Fachada (*Facade Pattern*)**: Desacoplamento de `useTaskCollection.ts` em sub-hooks especialistas em `src/hooks/taskCollection/` com interface pública 100% inalterada.
3. **Segregação de Casca (*App Shell*)**: Separação de modais e navegação em `AppDialogsContainer.tsx` e `AppHeaderBar.tsx`, reduzindo `App.tsx` para < 250 linhas.
4. **Garantia de Qualidade & Não-Regressão**: Meta estrita de **nenhum arquivo exceder 400 linhas**, verificado por guard test automatizado (`moduleLineCountGuard.test.ts`) sem regressão nos 744 testes existentes.

---

## Technical Context

**Language/Version**: TypeScript 5.6+ / React 18+  
**Primary Dependencies**: React, Lucide-react, `@hello-pangea/dnd` — **Zero novas dependências no `package.json`**.  
**Storage**: `localStorage` (persistência atômica inalterada).  
**Testing**: Vitest + React Testing Library (744 testes existentes em 125 arquivos mantidos verdes).  
**Target Platform**: Navegadores Web modernos (Desktop/Mobile).  
**Project Type**: Single-Page Application (Local-First Kanban Analytics).  
**Performance Goals**: Zero degradação de FPS durante drag-and-drop; build < 5 segundos; tempo de carregamento inalterado.  
**Constraints**: Todos os arquivos alvos ≤ 400 linhas; 0 erros e 0 warnings no ESLint (`no-explicit-any`); zero quebra de contratos públicos de props ou exportações.  
**Scale/Scope**: 4 módulos refatorados, 15 subcomponentes/sub-hooks criados, 1 guard test automatizado.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Specification-Driven Development):** ✅ Aprovado. Especificação formal (`spec.md`), clarificações registradas e artefatos de arquitetura gerados antes de qualquer código.
- **Princípio II (Code Quality & Modularity):** ✅ Aprovado. Resolução direta de OPP-002: elimina módulos inchados (*bloated modules*), aplicando SRP e interfaces coesas.
- **Princípio III (Automated Verification & Testing):** ✅ Aprovado. Preserva 100% de aprovação dos 744 testes, build em < 5s e adiciona teste automatizado de guarda para linhas de código.
- **Princípio V (Simplicidade & YAGNI):** ✅ Aprovado. Zero novas dependências npm; refatoração estrutural pura sem camadas especulativas.
- **Princípio VI (Raciocínio Analítico Pré-Tarefas):** ✅ Aprovado. A geração de tarefas em `tasks.md` obedecerá aos 6 Modelos de Raciocínio Analítico.
- **Princípio IX (User Data Integrity & Draft Protection):** ✅ Aprovado. Preserva estritamente o guard de rascunhos sujos (`showDirtyConfirmDialog`) e listener `beforeunload` no `TaskDetailsModal`.

---

## Project Structure

### Documentation (this feature)

```text
specs/049-modular-decomposition/
├── spec.md              # Especificação funcional com clarificações da sessão 2026-10-21
├── plan.md              # Este plano de arquitetura técnica
├── research.md          # Decisões técnicas de decomposição e padrões arquiteturais
├── data-model.md        # Modelos de composição de componentes, props e hooks
├── quickstart.md        # Roteiro de validação ponta a ponta e medição estática
├── contracts/           # Esquemas JSON de validação de contratos de props e facades
│   ├── task-props-contract.json
│   └── task-collection-facade-contract.json
└── checklists/
    ├── requirements.md  # Checklist de qualidade dos requisitos
    └── architecture.md  # Checklist de arquitetura, limites e retrocompatibilidade
```

### Source Code Touched & Created

```text
src/
├── components/
│   ├── Task/                               # [NOVO DIRETÓRIO MODULAR]
│   │   ├── types.ts                        # Interfaces internas de subcomponentes
│   │   ├── TaskCardContainer.tsx           # Wrapper draggable com refs DND e foco
│   │   ├── TaskHeader.tsx                  # Título, ID, badges de prioridade/tipo e menu
│   │   ├── TaskBadges.tsx                  # Badges de métricas de fluxo (Cycle/Lead Time, SLE)
│   │   ├── TaskBlockerChips.tsx            # Chips de bloqueio, impedimentos e dependências
│   │   └── TaskChecklistSummary.tsx        # Resumo de checklist com barra de progresso
│   ├── Task.tsx                            # [REFATORADO] Fachada raiz (< 200 linhas)
│   │
│   ├── TaskDetailsModal/                   # [NOVO DIRETÓRIO MODULAR]
│   │   ├── types.ts                        # Interfaces internas das seções do modal
│   │   ├── TaskModalHeader.tsx             # Cabeçalho, ID e botão fechar
│   │   ├── TaskModalPrimaryFields.tsx      # Coluna, responsável, tags, datas e pontos
│   │   ├── TaskModalDescription.tsx        # Editor Markdown com toolbar e ações Salvar/Descartar
│   │   └── TaskModalActivityTab.tsx        # Abas de comentários e feed de atividades
│   ├── TaskDetailsModal.tsx                # [REFATORADO] Orquestrador raiz com dirty guard (< 250 linhas)
│   │
│   ├── App/                                # [NOVO DIRETÓRIO MODULAR]
│   │   ├── AppHeaderBar.tsx                # Barra superior com logo, navegação e ações
│   │   └── AppDialogsContainer.tsx         # Hospedeiro central de modais e gavetas globais
│   └── App.tsx                             # [REFATORADO] Layout container enxuto (< 250 linhas)
│
├── hooks/
│   ├── taskCollection/                     # [NOVO DIRETÓRIO MODULAR]
│   │   ├── useTaskMutations.ts             # CRUD de tarefas (add, update, delete, archive)
│   │   ├── useTaskReorderManager.ts        # Transições de coluna e ordenação DND
│   │   ├── useTaskChecklistManager.ts      # Manipulações atômicas de checklist
│   │   └── useTaskCommentsManager.ts       # Gestão de comentários e decisões
│   └── useTaskCollection.ts                # [REFATORADO] Fachada composta 100% retrocompatível (< 220 linhas)
│
tests/
└── unit/
    └── moduleLineCountGuard.test.ts        # [NOVO TESTE DE GUARDA] Assegura que nenhum módulo excede 400 linhas
```

---

## Architecture Phases & Implementation Steps

### Phase 1: Setup & Guard Test Base
1. Criar o teste de guarda `tests/unit/moduleLineCountGuard.test.ts` com inventário dos 4 módulos alvos.
2. Criar as estruturas de pastas `src/components/Task/`, `src/components/TaskDetailsModal/`, `src/components/App/` e `src/hooks/taskCollection/`.

### Phase 2: Decomposição de `Task.tsx` (907 linhas → ≤ 200 linhas)
1. Extrair `TaskHeader.tsx`, `TaskBadges.tsx`, `TaskBlockerChips.tsx`, `TaskChecklistSummary.tsx` e `TaskCardContainer.tsx`.
2. Refatorar `src/components/Task.tsx` como fachada e container orquestrador.
3. Executar suíte de testes de Task (`npm test -- tests/unit/Task`) garantindo 100% verde.

### Phase 3: Decomposição de `TaskDetailsModal.tsx` (728 linhas → ≤ 250 linhas)
1. Extrair `TaskModalHeader.tsx`, `TaskModalPrimaryFields.tsx`, `TaskModalDescription.tsx` e `TaskModalActivityTab.tsx`.
2. Preservar o estado de rascunho sujo (`isDirty`), atalhos de teclado e `showDirtyConfirmDialog` no container `TaskDetailsModal.tsx`.
3. Executar suíte de testes do modal (`npm test -- tests/unit/TaskDetailsModal*`) garantindo 100% verde.

### Phase 4: Decomposição de `useTaskCollection.ts` (751 linhas → ≤ 220 linhas)
1. Extrair sub-hooks especialistas em `src/hooks/taskCollection/`.
2. Refatorar `useTaskCollection.ts` compondo os sub-hooks e reexportando a assinatura idêntica.
3. Executar suíte de testes de hooks (`npm test -- tests/unit/useTaskCollection.test.ts`, `taskReorder.test.ts`, `taskTransitions.test.ts`).

### Phase 5: Decomposição de `App.tsx` (762 linhas → ≤ 250 linhas)
1. Extrair `AppHeaderBar.tsx` e `AppDialogsContainer.tsx`.
2. Simplificar `App.tsx` para layout container puro.
3. Executar testes de integração de App e fluxos analíticos.

### Phase 6: Polish & Validação dos Portões de Qualidade
1. Executar `npx vitest run tests/unit/moduleLineCountGuard.test.ts` para certificar que todos os arquivos têm ≤ 400 linhas.
2. Executar `npm run lint` assegurando 0 erros e 0 warnings.
3. Executar `npm test` garantindo que todos os 744 testes continuam verdes.
4. Executar `npm run build` atestando compilação limpa em < 5 segundos.
