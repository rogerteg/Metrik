# Layout & Stacking Model: Menu de Administrador e Cabeçalho (028)

**Date**: 2026-09-15
**Feature**: `028-admin-menu-header-layout`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Modelo de Camadas e Stacking Context

A ordem de empilhamento vertical (plano Z) da aplicação é formalizada para evitar regressões visuais:

```text
┌────────────────────────────────────────────────────────┐  z-index: 2000+
│ Modais Globais (.modal-overlay, TeamManagementModal)   │  (Camada mais alta)
├────────────────────────────────────────────────────────┤
│ Dropdown de Perfil (.user-profile-dropdown)            │  z-index: 1000
│ Menus Flutuantes do Cabeçalho                          │
├────────────────────────────────────────────────────────┤
│ Cabeçalho Superior (.app-header)                       │  z-index: 50
│ (position: relative - Stacking Context Pai)            │
├────────────────────────────────────────────────────────┤
│ Barra de Métricas (.metrics-bar)                       │  z-index: 10
│ (backdrop-filter ativo, contido abaixo do cabeçalho)   │
├────────────────────────────────────────────────────────┤
│ Barra de Filtros (.filter-bar)                         │  z-index: 5
├────────────────────────────────────────────────────────┤
│ Quadro Kanban (.kanban-board-container) e Colunas      │  z-index: 1 (Fluxo Base)
└────────────────────────────────────────────────────────┘
```

## 2. Invariantes de Empilhamento

1. **Invariante de Elevação do Cabeçalho**: Qualquer menu suspenso ou flyout originado dentro de `.app-header` deve ser renderizado acima de `.metrics-bar`, `.filter-bar` e `.kanban-column`.
2. **Invariante de Isolamento de Backdrop**: A ativação de `backdrop-filter` em qualquer elemento da página não pode sobrepor elementos de `z-index` superior situados no cabeçalho.
3. **Invariante de Contenção Vertical**: O menu `.user-profile-dropdown` possui altura máxima contida (`max-height: 280px` na lista) com rolagem interna para garantir que os botões "Cadastrar Novo Usuário" e "Gerenciar Squads" permaneçam sempre visíveis e acionáveis.

## 3. Modelo Estrutural dos Clusters do Cabeçalho

```text
.app-header
├── .brand-section (Logotipo + Título + Seletor de Quadro)
└── .header-actions
    ├── .header-nav-cluster (Alternador de Visão Quadro/Analytics)
    ├── .header-theme-cluster (Seletor de Tema)
    ├── .header-session-cluster (UserProfileMenu - "Administrador")
    ├── .header-cluster-divider (Divisória sutil)
    └── .header-board-ops-cluster (Importar, Exportar, Demo, Limpar)
```
