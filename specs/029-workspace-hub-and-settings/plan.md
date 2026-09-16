# Implementation Plan: Hub de Espaços de Trabalho e Módulo Separado de Configurações

**Branch**: `029-workspace-hub-and-settings` | **Date**: 2026-09-15 | **Spec**: [spec.md](spec.md) | **Research**: [research.md](research.md)

**Input**: Feature specification from `/specs/029-workspace-hub-and-settings/spec.md`

## Summary

Implementar a visão panorâmica de alto nível inspirada no protótipo executivo fornecido pelo usuário, composta pelo **Hub de Espaços de Trabalho** (com barra lateral de departamentos com marcadores de cor, vitrine superior de quadros favoritos com atalhos e relógio, barra de comando com botões circulares e filtro em pílula, e grade de quadros por espaço ativo), complementada por um **Módulo de Configurações Separado e Dedicado** em tela cheia (*Full View*) com layout em duas colunas, proporcionando uma experiência de gestão visual premium sem poluir o cabeçalho do fluxo Kanban.

**Abordagem Técnica**:
1. **Topologia de Telas e Roteamento Local**: Expandir `view` no `App.tsx` para suportar `'workspaces' | 'board' | 'analytics' | 'settings'`. O seletor de topo passa a oferecer: **"Espaços" | "Quadro" | "Analytics"**, além de botão dedicado para **"Configurações"**.
2. **Modelo de Dados & Migração Automática**: Criar tipos em `src/types/workspace.ts` e hook `useWorkspaces.ts` com migração transparente dos quadros existentes em `localStorage` para um espaço inicial padrão ("Geral"), acrescido de espaços secundários prontos (*Produção, P&D, Gestão, etc.*).
3. **Componentes Modulares do Hub (`src/components/WorkspaceHub/`)**:
   - `WorkspaceSidebar`: Lista de espaços com cores HSL, botão "Todos os espaços" e botão "+ Novo painel".
   - `FavoriteBoardsSection`: Vitrine superior com cards elevados, contadores de prazos e botão de favoritar (coração).
   - `WorkspaceActionBar`: Barra com título, botões de ação flutuantes e busca/filtro em formato de pílula (*Pill Filter*).
   - `WorkspaceBoardsGrid`: Grade de cards responsivos com menu de 3 pontinhos para abrir, renomear, duplicar e favoritar.
4. **Módulo de Configurações Separado (`src/components/Settings/SettingsView.tsx`)**:
   - Visão em tela cheia com cabeçalho de retorno (`"← Voltar ao Quadro"`).
   - Menu lateral de 4 abas (*Geral & Aparência*, *Espaços & Squads*, *Políticas de Fluxo*, *Dados & Backup*).
   - Reutilização elegante das ações utilitárias (temas, exportação/importação, limpeza e equipes) em ambiente espaçoso e seguro.

---

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19, Vite 6

**Primary Dependencies**: React 19 + Vanilla CSS com variáveis semânticas de design system (zero novas dependências externas, NFR-003 / Constituição V)

**Storage**: `localStorage` (chaves: `metrik_workspaces`, `metrik_favorite_boards`, `metrik_app_settings`, `metrik_boards`) sob modelo soberano Local-First (Constituição VIII)

**Testing**: Vitest 3 (jsdom) + React Testing Library; execução automatizada via `npm test` e validação visual de fidelidade de design via browser subagent

**Target Platform**: Microsoft Edge, Google Chrome, Mozilla Firefox e Safari modernos; desktop e telas a partir de 1024px

**Project Type**: Web application (SPA local-first de projeto único)

**Performance Goals**: Alternância de visão e transição entre espaços < 50ms; animações a 60 fps; zero recálculos pesados de layout

**Constraints**:
- Não alterar os dados ou histórico de tarefas dos quadros existentes
- Manter o isolamento e controle de acesso por squad (Feature 023)
- Conformidade estrita com acessibilidade WCAG 2.1 AA e independência de marca (Constituição VII)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Specification-Driven Development** — `spec.md`, `research.md`, `data-model.md`, `contracts/` e `quickstart.md` gerados formalmente antes da decomposição de tarefas.
- [x] **II. Qualidade & Modularidade** — Componentes isolados em subpastas dedicadas (`WorkspaceHub/` e `Settings/`), hooks puros de dados e CSS desacoplado.
- [x] **III. Verificação Automatizada** — Testes unitários para `useWorkspaces`, `WorkspaceHub` e `SettingsView`; validação contínua com `npm test` e `npm run build`.
- [x] **IV. Observabilidade** — Mensagens e logs com prefixo padronizado `[Metrik]`.
- [x] **V. Simplicidade & YAGNI** — Solução pura com React e CSS nativo; nenhuma dependência externa desnecessária.
- [x] **VI. Raciocínio Analítico Pré-Tarefas** — Obrigatório documentar os 6 modelos antes de listar tarefas em `tasks.md`.
- [x] **VII. Independência de Marca** — Zero vazamentos de nomes de ferramentas concorrentes; terminologia proprietária e científica do Metrik.
- [x] **VIII. Soberania Local-First** — Persistência 100% cliente-side em `localStorage` com suporte ao controle de equipes (TBAC).

---

## Project Structure

### Documentation (this feature)

```text
specs/029-workspace-hub-and-settings/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de navegação, topologia e separação do módulo de configurações
├── data-model.md        # Entidades Workspace, FavoriteBoard, AppSettings e invariantes
├── quickstart.md        # Guia passo a passo de validação dos 6 cenários
├── contracts/
│   └── workspace-hub.contract.md # Contrato visual, estrutural e de acessibilidade
└── checklists/
    └── requirements.md  # Checklist de qualidade da especificação (16/16 aprovado)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── workspace.ts                  # [NEW] Tipos Workspace, FavoriteBoard, AppSettings
├── hooks/
│   ├── useWorkspaces.ts              # [NEW] Gerenciamento e migração local de espaços de trabalho
│   └── useAppSettings.ts             # [NEW] Gerenciamento e persistência das configurações globais
├── components/
│   ├── WorkspaceHub/
│   │   ├── WorkspaceHub.tsx          # [NEW] Componente principal do Hub de Espaços e Favoritos
│   │   ├── WorkspaceSidebar.tsx      # [NEW] Barra lateral de espaços com cores e botão + Novo painel
│   │   ├── FavoriteBoardsSection.tsx # [NEW] Vitrine superior de quadros favoritos com atalhos
│   │   ├── WorkspaceActionBar.tsx    # [NEW] Barra de ações com FABs e filtro em formato de pílula
│   │   ├── WorkspaceBoardsGrid.tsx   # [NEW] Grade responsiva de quadros do espaço selecionado
│   │   └── CreateWorkspaceModal.tsx  # [NEW] Modal para cadastro de novo espaço ou quadro
│   ├── Settings/
│   │   ├── SettingsView.tsx          # [NEW] Tela cheia de configurações em duas colunas
│   │   ├── GeneralSettingsTab.tsx    # [NEW] Aba de aparência, temas e densidade
│   │   ├── WorkspacesSettingsTab.tsx # [NEW] Aba de gestão de espaços, cores e membros
│   │   ├── BoardPoliciesTab.tsx      # [NEW] Aba de limites WIP e políticas de fluxo
│   │   └── DataPortabilityTab.tsx    # [NEW] Aba de backup, exportação, importação e limpeza
│   └── ...
├── App.tsx                           # [MODIFY] Alternador de visualizações (Espaços/Quadro/Analytics/Settings)
└── App.css                           # [MODIFY] Estilos do WorkspaceHub, Pill Filter e SettingsView
tests/
└── unit/
    ├── useWorkspaces.test.ts         # [NEW] Testes unitários do hook de espaços e migração
    ├── WorkspaceHub.test.tsx         # [NEW] Testes de interface da navegação e favoritos
    └── SettingsView.test.tsx         # [NEW] Testes de interface do módulo separado de configurações
```

---

## Proposed Changes

### 1. Modelos de Dados & Hooks
- **[NEW] `src/types/workspace.ts`**: Declaração das interfaces `Workspace`, `FavoriteBoardRecord`, `AppSettings` e `WorkspaceFilterState`.
- **[NEW] `src/hooks/useWorkspaces.ts`**: Hook com lógica de carregamento, migração automática de dados brownfield, alternância de espaço ativo, inclusão/remoção de favoritos e operações CRUD de espaços.
- **[NEW] `src/hooks/useAppSettings.ts`**: Hook para gerenciar configurações globais (tema, densidade, preferências) de forma desacoplada.

### 2. Interface do Workspace Hub (`src/components/WorkspaceHub/`)
- **[NEW] `WorkspaceHub.tsx`**: Orquestrador da visualização panorâmica.
- **[NEW] `WorkspaceSidebar.tsx`**: Barra lateral esquerda com indicador cromático e botão inferior `+ Novo painel`.
- **[NEW] `FavoriteBoardsSection.tsx`**: Vitrine superior com cards elevados e botão de favoritar instantâneo.
- **[NEW] `WorkspaceActionBar.tsx`**: Título "Meus espaços de trabalho", botões flutuantes circulares e barra em pílula (*Pill Filter*).
- **[NEW] `WorkspaceBoardsGrid.tsx`**: Grade de quadros com menus de 3 pontinhos.
- **[NEW] `CreateWorkspaceModal.tsx`**: Modal de criação de novos espaços e quadros.

### 3. Módulo Separado de Configurações (`src/components/Settings/`)
- **[NEW] `SettingsView.tsx`**: Visão em tela cheia com duas colunas e botão "← Voltar ao Quadro".
- **[NEW] `GeneralSettingsTab.tsx`**, **`WorkspacesSettingsTab.tsx`**, **`BoardPoliciesTab.tsx`**, **`DataPortabilityTab.tsx`**: Painéis especializados para cada área de ajuste.

### 4. Integração na Aplicação Raiz
- **[MODIFY] `src/App.tsx`**: Integrar as novas visões no estado central `view`, atualizando o seletor do cabeçalho com as opções "Espaços", "Quadro" e "Analytics", acompanhado do botão de acesso direto a "Configurações".
- **[MODIFY] `src/App.css`**: Design tokens e estilização com visual enterprise de alto padrão (cards com glassmorphism, sombras em camadas, paletas HSL afinadas e responsividade).

---

## Verification Plan

### Automated Tests
- `npm test tests/unit/useWorkspaces.test.ts` (testes do hook e da migração transparente)
- `npm test tests/unit/WorkspaceHub.test.tsx` (testes de renderização, seleção de espaços e favoritos)
- `npm test tests/unit/SettingsView.test.tsx` (testes da tela dedicada de configurações e abas)
- `npm test` (suite completa — todos os testes devem permanecer 100% verdes)
- `npm run build` (validação de tipos TypeScript e build de produção Vite)

### Manual / Browser Verification
- Abrir `http://localhost:5173/` no Chromium via browser subagent.
- Clicar na aba "Espaços" no cabeçalho e validar a renderização idêntica ao protótipo.
- Testar a seleção de espaços na barra lateral (*Gestão, Produção, P&D*), observando a atualização da grade de quadros.
- Clicar no ícone de coração de um quadro e comprovar a inclusão imediata na vitrine de "Quadros favoritos".
- Testar a barra em pílula de busca e conferir a filtragem em tempo real.
- Clicar no botão "Configurações", validar a abertura da tela dedicada em duas colunas, alternar entre as 4 abas e clicar em "← Voltar ao Quadro".
- Capturar screenshots comprobatórios para walkthrough.
