# Implementation Plan: Tipos de Tarefas, Vinculação Hierárquica e Vínculos Cross-Squad

**Branch**: `024-task-types-and-linking` | **Date**: 2026-09-13 | **Spec**: [specs/024-task-types-and-linking/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Esta funcionalidade introduz o suporte formal a **Tipos de Tarefas (Work Item Types)** e **Vinculação Relacional Intra e Cross-Squad** no Metrik.
O trabalho no Kanban passa a se estruturar em três níveis semânticos:
1. **Iniciativas (`initiative`)**: Épicos estratégicos de alto nível com barra de progresso percentual reativa calculada com base na conclusão de seus itens filhos.
2. **Cards (`card`)**: Itens de fluxo padrão do quadro Kanban.
3. **Subtarefas (`subtask`)**: Entidades granulares de trabalho que transitam no quadro ou servem como divisões de tarefas maiores.

Além dos tipos, o sistema ganha um motor relacional de **vínculos semânticos** (`parent`, `child`, `blocks`, `is_blocked_by`, `relates_to`) com integridade bidirecional, limpeza automática de referências órfãs e **anexação de tarefas pertencentes a outras squads/times (Cross-Squad Linking)**. Para mitigar gargalos, é implementada uma barreira com confirmação (**Soft Block**) ao tentar mover para *Concluído* (`done`) qualquer tarefa que possua dependências bloqueadoras pendentes.

A solução opera sob a soberania **Local-First (Princípio VIII da Constituição)**, com zero dependências externas adicionadas, renderização rápida em 60fps e conformidade visual com os temas Claro, Escuro e Neutro.

---

## 2. Contexto Técnico

- **Linguagem / Versão**: TypeScript 5.7+, React 19+ (Vite 6)
- **Dependências Principais**: React 19, CSS Custom Properties, `uuid` (Zero bibliotecas externas adicionadas)
- **Armazenamento**: `localStorage` integrado aos schemas de `Board` e `TaskModel`
- **Testes**: Vitest, React Testing Library, jsdom
- **Plataforma Alvo**: Navegadores Web Modernos (Chrome, Firefox, Safari, Edge)
- **Tipo de Projeto**: Web Application / Enterprise Kanban & Flow Analytics
- **Metas de Performance**: Renderização e atualização de vínculos em $< 16\text{ ms}$ (60fps)
- **Restrições**: Conformidade WCAG AA, 100% CSS nativo sem Tailwind, isolamento de squad preservado (Princípio VIII), estrita independência de marca (Princípio VII)

---

## 3. Constitution Check (Gates Constitucionais Metrik v1.3.0)

- [x] **Gate I (Specification-Driven Development)**: `spec.md`, `checklists/`, `research.md`, `data-model.md`, `quickstart.md` e `plan.md` formalizados na branch `024-task-types-and-linking`.
- [x] **Gate II (Qualidade de Código & Modularidade)**: Módulo de utilitários e tipos dedicado (`src/types/taskTypes.ts`, `src/utils/taskRelations.ts`), componentes desacoplados (`TaskTypeBadge.tsx`, `TaskLinksSection.tsx`, `DependencySoftBlockModal.tsx`) com zero acoplamento circular.
- [x] **Gate III (Verificação Automatizada)**: Testes unitários cobrindo tipos de tarefas, relações bidirecionais, busca cross-squad, cálculo de progresso e soft block, mantendo 100% de aprovação nos 287 testes legados.
- [x] **Gate IV (Observabilidade & Logs Estruturados)**: Logs informativos `[Metrik]` para operações de vinculação, expurgo de referências órfãs e detecção de dependências.
- [x] **Gate V (Simplicidade & YAGNI)**: Solução client-side elegante sem micro-serviços ou bibliotecas pesadas de grafos.
- [x] **Gate VI (Modelos de Raciocínio Analítico Pré-Tarefas)**: Mandatório na elaboração de `tasks.md`.
- [x] **Gate VII (Independência Estrita de Marca)**: Terminologia canônica e neutra (*Metrik Work Item Types*, *Cross-Squad Flow Linking*).
- [x] **Gate VIII (Soberania Local-First & Isolamento de Squads)**: Exposição segura de metadados externos (título, squad, coluna) sem vazamento de permissões de escrita em quadros externos.

---

## 4. User Review Required

> [!IMPORTANT]
> - **Preservação Retrocompatível de Dados**: Todas as tarefas existentes sem `type` recebem o valor padrão `'card'` automaticamente. A propriedade existente `subtasks?: SubtaskModel[]` (checklist leve) continua 100% suportada e coexiste pacificamente com o tipo de trabalho `subtask`.
> - **Busca Cross-Squad Transparente**: Usuários podem vincular tarefas de qualquer squad para rastrear dependências organizacionais. A visualização externa é estritamente segura e somente-leitura, exibindo o resumo necessário (título, squad e status da coluna).
> - **Comportamento do Soft Block**: Tarefas com dependências pendentes não impedem bruscamente a movimentação; o sistema exibe um diálogo de confirmação claro, permitindo ao operador confirmar a transição se a dependência estiver acordada verbalmente.

---

## 5. Estrutura do Projeto & Arquivos Envolvidos

```text
specs/024-task-types-and-linking/
├── spec.md              # Especificação formal e decisões clarificadas
├── plan.md              # Este plano de implementação
├── research.md          # Decisões arquiteturais e fundamentação técnica
├── data-model.md        # Modelagem de TaskType, TaskLinkModel e CrossSquadTaskSummary
├── quickstart.md        # Guia de validação e cenários passo a passo
└── checklists/
    ├── requirements.md  # Checklist de qualidade dos requisitos
    └── task-types-and-linking.md # Checklist de integridade e domínio

src/
├── types/
│   ├── kanban.ts        # Atualização de TaskModel (type?, links?)
│   └── taskTypes.ts     # NOVO: Tipagem TaskType, TaskRelationType, TaskLinkModel, configs
├── utils/
│   └── taskRelations.ts # NOVO: Utilitários puros para vínculos recíprocos e progresso
├── components/
│   ├── TaskCard.tsx (ou subcomponente em Board.tsx) # Atualização com badges e chip de links
│   ├── TaskDetailsModal.tsx # Atualização com seletor de tipo e seção de vínculos
│   ├── TaskLinksSection.tsx # NOVO: Seção de vínculos locais e cross-squad
│   ├── DependencySoftBlockModal.tsx # NOVO: Modal de confirmação para Soft Block
│   └── TaskTypeBadge.tsx # NOVO: Badge reutilizável de tipo de tarefa
├── hooks/
│   └── useBoards.ts     # Atualização com helpers de vinculação e integridade referencial
└── App.css              # Estilos semânticos para badges, links e barras de progresso

tests/unit/
├── taskTypesAndLinking.test.ts # NOVO: Testes de regras de negócio e utilitários
├── TaskLinksSection.test.tsx   # NOVO: Testes de componentes de vínculos
└── boardMovementSoftBlock.test.tsx # NOVO: Testes de movimentação e soft block
```

---

## 6. Fases de Implementação (Estratégia TDD Red-Bar First)

### Phase 1: Setup & Data Modeling
- Criar `src/types/taskTypes.ts` com as definições de `TaskType`, `TaskRelationType`, `TaskLinkModel`, `TaskTypeConfig`, `TASK_TYPE_CONFIGS` e `TASK_RELATION_CONFIGS`.
- Atualizar `TaskModel` em `src/types/kanban.ts` adicionando os campos opcionais `type?: TaskType` e `links?: TaskLinkModel[]`.

### Phase 2: Foundational Relational State & Utilitários
- Implementar testes unitários em `tests/unit/taskTypesAndLinking.test.ts` para funções de manipulação de links (adição recíproca, remoção, integridade após exclusão de tarefa e cálculo de progresso de iniciativa).
- Implementar `src/utils/taskRelations.ts` com funções puras:
  - `getReciprocalRelation(relation)`
  - `addBidirectionalLink(sourceTask, targetTask, relation, sourceBoardId, targetBoardId, sourceTeamId, targetTeamId)`
  - `removeBidirectionalLink(sourceTask, targetTask)`
  - `cleanupOrphanedLinks(tasks, deletedTaskId)`
  - `calculateInitiativeProgress(initiativeTask, allTasks)`
  - `getPendingBlockers(task, allTasks, allBoards)`
- Atualizar `useBoards.ts` para suportar atualização atômica de tarefas com vínculos e limpeza em caso de exclusão.

### Phase 3: User Story 1 - Tipos de Tarefas e Badges Visuais nos Cards
- Implementar testes de renderização do componente `TaskTypeBadge.tsx`.
- Criar componente `src/components/TaskTypeBadge.tsx` e integrá-lo ao cabeçalho do cartão de tarefa em `Board.tsx`.
- Adicionar seletor de tipo de tarefa no `TaskDetailsModal.tsx`.
- Estilizar badges com visual moderno, gradientes sutis e cores semânticas nos temas Claro, Escuro e Neutro em `src/App.css`.

### Phase 4: User Story 2 - Vinculação Relacional Intra-Quadro
- Implementar `src/components/TaskLinksSection.tsx` para gerenciar a lista de vínculos dentro de `TaskDetailsModal.tsx`.
- Permitir selecionar outra tarefa do quadro ativo, escolher a relação semântica e persistir o vínculo bidirecionalmente.
- Adicionar botão de remoção de vínculo com feedback imediato.
- Renderizar contador compacto de vínculos no cartão Kanban (ex: `🔗 2 vínculos`).

### Phase 5: User Story 3 - Vínculos e Anexos Cross-Squad
- Expandir `TaskLinksSection.tsx` com aba/seletor "Outro Time / Squad":
  - Dropdown 1: Selecionar Squad (a partir de `teams` do `useTeamAccess`).
  - Dropdown 2: Selecionar Quadro da Squad (a partir de `boards` do `useBoards`).
  - Dropdown 3: Selecionar Tarefa Alvo.
  - Dropdown 4: Tipo de Relação.
- Renderizar chip destacado da squad externa no cartão Kanban (`🏢 Squad Engenharia • #T-102`) e no modal.
- Permitir navegação rápida para o quadro remoto se o usuário fizer parte da squad vinculada.

### Phase 6: User Story 4 - Progresso de Iniciativas e Validação de Soft Block
- Renderizar barra de progresso visual nos cartões com `type: 'initiative'` e no cabeçalho do `TaskDetailsModal`.
- Criar `src/components/DependencySoftBlockModal.tsx` para interceptar movimentação de cartões com dependências pendentes (`is_blocked_by` não concluídas) para colunas da categoria `done`.
- Integrar a interceptação de soft block no manipulador de drop/movimentação em `Board.tsx`.

### Phase 7: Verification, Quality Gate & Release
- Executar a suíte dedicada de testes unitários (`taskTypesAndLinking.test.ts`, `TaskLinksSection.test.tsx`, `boardMovementSoftBlock.test.tsx`).
- Executar a suíte de regressão completa do Metrik (`npm test`), garantindo que todos os 287 testes existentes continuem verdes.
- Executar `npm run build` com verificação estrita de tipos TypeScript sem nenhum erro.

---

## 7. Critérios de Conclusão & Quality Gate

1. **Testes Unitários**: Mínimo de 15 novos testes cobrindo todas as 4 User Stories.
2. **Regressão Zero**: 287/287 testes legados passando com 100% de sucesso.
3. **Build Limpo**: Compilação TypeScript de produção (`npm run build`) sem erros.
4. **Governança Constitucional**: Conformidade atestada com os Princípios I a VIII da Constituição v1.3.0.
