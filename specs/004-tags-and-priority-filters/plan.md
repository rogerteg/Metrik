# Implementation Plan: Etiquetas (Tags), Prioridades e Barra de Filtros

**Branch**: `004-tags-and-priority-filters` | **Date**: 2026-09-09 | **Spec**: [specs/004-tags-and-priority-filters/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/004-tags-and-priority-filters/spec.md)

**Input**: Feature specification from `specs/004-tags-and-priority-filters/spec.md`

---

## Summary

Implementação de níveis de prioridade visualmente diferenciados (`urgent`, `high`, `medium`, `low`), sistema de etiquetas (tags coloridas geradas deterministicamente) nos cartões de tarefas e uma barra de controle de busca e filtragem instantânea (`FilterBar`). A arquitetura separa o estado persistido das tarefas (`useTaskCollection`) do pipeline de filtros efêmeros (`useBoardFilters`), garantindo que métricas de fluxo (`MetricsBar`) e limites de WIP continuem apurando o total real do quadro, enquanto o usuário visualiza fatias focadas de trabalho com resposta visual inferior a 50ms.

---

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19.x  
**Primary Dependencies**: React 19, Vite 6, Vanilla CSS Tokens (0 bibliotecas externas adicionadas)  
**Storage**: `localStorage` sob a chave existente `metrik_kanban_tasks` (extensão retrocompatível)  
**Testing**: Vitest 3.x, React Testing Library, jsdom  
**Target Platform**: Navegadores modernos (Desktop e Mobile responsivo)  
**Project Type**: SPA Frontend Offline-First  
**Performance Goals**: Filtragem e busca em < 50ms (O(N) memoizado no cliente)  
**Constraints**: Zero novas dependências, 100% retrocompatibilidade com tarefas das Features 001 a 003, preservar DnD e métricas de fluxo  

---

## Constitution Check

*GATE: Avaliação contra a Constituição do Metrik (v1.1.0)*

| Princípio Constitucional | Status | Justificativa / Conformidade |
|---|---|---|
| **I. Spec-Driven Development** | ✅ Aprovado | Especificação (`spec.md`), pesquisa (`research.md`), modelo de dados (`data-model.md`) e plano de implementação gerados antes do código. |
| **II. Code Quality & Modularity** | ✅ Aprovado | Hook dedicado `useBoardFilters`, utilitários puros `tagColors.ts` e `priorityConfig.ts`, componente modular `FilterBar.tsx`. |
| **III. Automated Verification & Testing** | ✅ Aprovado | TDD (Red-Bar First) cobrindo algoritmos de filtragem, renderização de badges, tags e input de busca. |
| **IV. Observability & Structured Logging** | ✅ Aprovado | Indicadores claros de contagem de tarefas filtradas vs totais. |
| **V. Simplicity & YAGNI** | ✅ Aprovado | Paleta determinística de cores para tags sem formulários pesados de gerenciamento de cores; busca pura em memória sem fuzzy engines pesadas. |
| **VI. Analytical Reasoning Pre-Tasks** | 🔒 Obrigatório | O breakdown de tarefas em `tasks.md` será precedido pelos 6 Modelos de Raciocínio Analítico. |

---

## Project Structure

### Documentation (this feature)

```text
specs/004-tags-and-priority-filters/
├── spec.md              # Especificação formal de requisitos
├── plan.md              # Plano técnico de implementação (este arquivo)
├── research.md          # Pesquisa técnica sobre prioridades, cores de tags e pipeline de filtros
├── data-model.md        # Contratos de tipos, modelo de filtros e extensões
├── quickstart.md        # Roteiro passo a passo de validação interativa
└── tasks.md             # Breakdown de tarefas com Modelos Analíticos (Phase 2)
```

### Source Code Impact

```text
src/
├── types/
│   ├── kanban.ts          # [MODIFICADO] Adiciona PriorityLevel, priority?, tags? ao TaskModel
│   └── filter.ts          # [NOVO] Tipos e interfaces de filtros (FilterState, UseBoardFiltersReturn)
├── utils/
│   ├── priorityConfig.ts  # [NOVO] Configurações de cores, rótulos e estilos de prioridade
│   └── tagColors.ts       # [NOVO] Função pura para mapeamento determinístico de cores de tags
├── hooks/
│   ├── useTaskCollection.ts # [MODIFICADO] Adiciona setTaskPriority, addTaskTag, removeTaskTag
│   └── useBoardFilters.ts # [NOVO] Hook memoizado gerenciando busca, prioridade e tags
├── components/
│   ├── PriorityBadge.tsx  # [NOVO] Badge interativo e seletor rápido de prioridade
│   ├── TagList.tsx        # [NOVO] Lista de tags do cartão com input inline para novas tags
│   ├── FilterBar.tsx      # [NOVO] Barra de busca instantânea e filtros por prioridade e tags
│   ├── Task.tsx           # [MODIFICADO] Renderiza PriorityBadge e TagList
│   └── Board.tsx          # [MODIFICADO] Renderiza estado vazio quando coluna é filtrada a 0
├── App.tsx                # [MODIFICADO] Integra useBoardFilters e FilterBar
└── App.css                # [MODIFICADO] Estilos da FilterBar, PriorityBadge, TagChips e animações

tests/
└── unit/
    ├── priorityConfig.test.ts # [NOVO] Testes das configurações e rótulos de prioridade
    ├── tagColors.test.ts      # [NOVO] Testes de determinismo das cores de tags
    ├── useBoardFilters.test.ts # [NOVO] Testes do pipeline de filtragem (busca, prioridade, tags)
    ├── PriorityBadge.test.tsx # [NOVO] Testes do componente visual PriorityBadge
    ├── TagList.test.tsx       # [NOVO] Testes de adição/remoção de tags no cartão
    └── FilterBar.test.tsx     # [NOVO] Testes de interação com a barra de filtros
```

---

## Phase 0: Research & Discovery
- Concluída com sucesso em [`specs/004-tags-and-priority-filters/research.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/004-tags-and-priority-filters/research.md).
- Paleta determinística para tags via hash de string sem dependências.
- Pipeline de filtros memoizado isolando a UI sem distorcer métricas Lean na `MetricsBar`.

---

## Phase 1: Design & Contracts
- Concluída com sucesso em [`specs/004-tags-and-priority-filters/data-model.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/004-tags-and-priority-filters/data-model.md) e [`specs/004-tags-and-priority-filters/quickstart.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/004-tags-and-priority-filters/quickstart.md).
- Contratos de dados 100% retrocompatíveis.
