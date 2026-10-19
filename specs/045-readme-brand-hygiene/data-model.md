# Data Model: Entidades Conceituais e Modelo de Domínio Documentado

**Feature**: `045-readme-brand-hygiene`  
**Date**: 2026-10-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Visão Geral

Esta funcionalidade formaliza o modelo conceitual apresentado na documentação de entrada do produto. O modelo reflete a ontologia real do Metrik já implementada no código e nos schemas do banco de dados.

---

## 2. Mapa Conceitual do Domínio

```text
[Workspace] 1 ──── * [Board] 1 ──── * [Column] 1 ──── * [Task]
    │                  │                                  │
    │ (TeamId)         │ (TeamId)                         ├── * [Subtask]
    ▼                  ▼                                  ├── * [Comment]
 [Team / Squad] 1 ── * [TeamMember]                       └── * [TaskLink]
                                                                  (intra/cross-squad)
```

### Entidades Documentadas no README:
- **Workspace (Espaço de Trabalho)**: Container de agrupamento de múltiplos quadros por unidade de negócio ou departamento.
- **Board (Quadro Kanban)**: Superfície de gestão de fluxo com colunas categorizadas (`backlog`, `in_progress`, `done`) e limites de WIP configuráveis.
- **Task (Cartão de Trabalho)**: Item rastreável com prazos, prioridade (`urgent`, `high`, `medium`, `low`), etiquetas, métricas de tempo (lead time, cycle time) e dependências.
- **Flow Metrics (Métricas de Fluxo)**: Indicadores calculados automaticamente com base nos timestamps determinísticos de transição (`createdAt`, `startedAt`, `completedAt`).
- **Sprint**: Período de planejamento com compromissos de entrega, story points e projeções de burndown/burnup.
- **Squad & TBAC**: Equipes com membros em papéis delimitados (`admin`, `member`, `guest`) para isolamento de dados.
