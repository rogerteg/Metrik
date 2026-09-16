# Implementation Plan: Subtarefas e Comentários nos Cartões

**Branch**: `027-card-subtasks-and-comments` | **Date**: 2026-09-15 | **Status**: In Planning | **Spec**: [spec.md](spec.md) | **Data Model**: [data-model.md](data-model.md) | **Contract**: [contracts/subtask-comment.contract.md](contracts/subtask-comment.contract.md)

**Input**: Feature specification from `/specs/027-card-subtasks-and-comments/spec.md`

## Summary

O sistema hoje possui subtarefas como lista simples aninhada no cartão (`SubtaskModel`), porém sua criação e gestão ocorrem **apenas dentro do modal de detalhes** (`TaskDetailsModal.tsx`). No cartão do quadro (`Task.tsx`), há apenas um indicador numérico de progresso. Além disso, o sistema **não possui nenhuma capacidade de comentário**, nem no cartão pai, nem nas subtarefas (cartões filhos).

**Abordagem técnica**:
1. **Extensão dos modelos de dados** em `src/types/kanban.ts`: introduzir `CommentModel` e campos opcionais `comments?: CommentModel[]` tanto em `TaskModel` (cartão pai) quanto em `SubtaskModel` (cartão filho).
2. **Módulo de domínio puro** em `src/utils/cardChildren.ts`: centralizar todas as operações de criação, validação (espaços em branco / não-vazios), alternância de conclusão, deleção em cascata, contagens e regras de autorização/permissões (D2, D3).
3. **Superfície no Cartão** em `src/components/Task.tsx`: adicionar seção recolhível de subtarefas e comentários mantendo paridade visual, acessibilidade (teclado/leitor de tela) e contenção de rolagem (FR-019, FR-020).
4. **Paridade no Modal** em `src/components/TaskDetailsModal.tsx`: incorporar a gestão de comentários do cartão pai e das subtarefas com autoria e timestamps estáveis.
5. **Integração de Estado** via `useTaskCollection`: funções puras integradas ao dispatch de atualização de tarefas, persistindo automaticamente no `localStorage` por quadro existente.

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19, Vite 6

**Primary Dependencies**: React 19 + CSS nativo (sem dependências externas adicionadas, NFR-007)

**Storage**: `localStorage` local-first sob a chave do quadro `metrik-tasks-<boardId>` (sem migração necessária, campos opcionais)

**Testing**: Vitest 3 (jsdom) + React Testing Library; verificação de tipos e build com `tsc && vite build`

**Target Platform**: Edge, Chrome, Firefox e Safari modernos; conformidade WCAG 2.1 AA

**Project Type**: Web application (SPA local-first, projeto único)

**Performance Goals**: Interações instantâneas (< 16 ms); rolagem suave em cartões com até 50 subtarefas e 200 comentários (NFR-004)

**Constraints**:
- Zero impacto nas métricas de fluxo (Lead Time, Cycle Time, CFD, diagramas) (FR-018)
- Zero liberação ou movimentação involuntária de cartões bloqueados (FR-017, integração Feature 025)
- Preservação da tolerância de layout e contenção de rolagem da Feature 026 (FR-019, FR-020)
- Perfil convidado (somente leitura) restringe todas as ações de escrita (FR-016)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Specification-Driven Development** — `spec.md`, `research.md`, `data-model.md`, `contracts/subtask-comment.contract.md` e checklists formalizados antes de qualquer código.
- [x] **II. Qualidade & Modularidade** — lógica encapsulada em módulo puro `src/utils/cardChildren.ts`, desacoplado do ciclo de renderização do React.
- [x] **III. Verificação Automatizada** — suítes dedicadas para funções de domínio, contratos de autorização e componentes de UI; TDD estrito com Red-Bar inicial.
- [x] **IV. Observabilidade** — mensagens informativas claras em ações bloqueadas e diagnósticos com prefixo canônico `[Metrik]`.
- [x] **V. Simplicidade & YAGNI** — sem bibliotecas de rich-text, sem sincronização remota, sem campos discriminantes complexos; aninhamento estrutural direto.
- [x] **VI. Raciocínio Analítico Pré-Tarefas** — mandatório antes da lista de tarefas em `tasks.md`.
- [x] **VII. Independência de Marca** — terminologia canônica (*Subtarefas*, *Comentários*, *Cartão Filho*).
- [x] **VIII. Soberania Local-First** — dados contidos estritamente no armazenamento local do navegador do usuário.

## Project Structure & Architecture

```text
src/
├── types/
│   └── kanban.ts                     # Estendido: CommentModel, SubtaskModel.comments, TaskModel.comments
├── utils/
│   └── cardChildren.ts               # Novo: Funções puras de manipulação, validação e autorização
├── components/
│   ├── Task.tsx                      # Estendido: Área recolhível de subtarefas e comentários, badges
│   ├── TaskDetailsModal.tsx          # Estendido: Gestão de comentários no pai e no filho
│   └── ...
└── App.css                           # Estilos e contenção de rolagem para listas e campos no cartão

tests/unit/
├── cardChildren.test.ts              # Novo: Testes unitários para regras puras de domínio e integridade
├── cardChildrenContract.test.ts      # Novo: Verificação do contrato de permissões e invariantes
├── Task.test.tsx                     # Estendido: Testes de interação de criação/comentário no cartão
└── TaskDetailsModal.test.tsx         # Estendido: Testes de comentários no modal
```

## Proposed Implementation Phasing

1. **Fase 1: Fundação & Modelos**
   - Atualizar tipagens em `src/types/kanban.ts`.
   - Implementar testes Red-Bar para `src/utils/cardChildren.ts`.
   - Implementar `src/utils/cardChildren.ts` com criação, alternância, exclusão em cascata, validação de payload e matriz de autorização.
2. **Fase 2: User Story 1 (Subtarefas no Cartão)**
   - Testes de UI para criação e alternância de subtarefas em `Task.tsx`.
   - Superfície de entrada e lista de subtarefas no cartão.
   - Atualização imediata do badge de progresso.
3. **Fase 3: User Story 2 (Comentários no Cartão Pai)**
   - Testes de UI para publicação, edição, exclusão e exibição cronológica de comentários no cartão pai.
   - Implementação no `Task.tsx` e no `TaskDetailsModal.tsx`.
   - Badge indicador de quantidade de comentários no cartão.
4. **Fase 4: User Story 3 (Comentários na Subtarefa / Cartão Filho)**
   - Testes de UI para comentários dedicados dentro de cada subtarefa.
   - Confirmação de exclusão em cascata (remover subtarefa remove seus comentários).
   - Isolamento total entre comentários do pai e comentários do filho.
5. **Fase 5: Polimento, Acessibilidade & Regressão**
   - Revisão WCAG 2.1 AA (foco visível, navegação por teclado, rótulos semânticos).
   - Contenção de rolagem (`max-height` e `overflow-y: auto`) para suportar 50 subtarefas / 200 comentários sem estourar o layout.
   - Execução da suíte completa de testes (`npm test`) e verificação de build (`npm run build`).
