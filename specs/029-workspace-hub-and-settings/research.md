# Research & Technical Decisions: Hub de Espaços de Trabalho e Módulo Separado de Configurações

**Feature Branch**: `029-workspace-hub-and-settings`
**Date**: 2026-09-15
**Spec**: [spec.md](spec.md)

---

## 1. Pesquisa & Decisões Arquiteturais

### Decisão 1: Topologia de Navegação e Alternância de Telas (Hub, Quadro, Analytics, Configurações)

- **Contexto**: A aplicação atualmente alterna entre `view === 'board'` e `view === 'analytics'` no `App.tsx`. O novo Hub de Espaços de Trabalho exige uma visão executiva própria, enquanto o Módulo de Configurações deve ser uma visão dedicada e separada (*Full View*), conforme solicitado pelo usuário.
- **Decisão**:
  - Estender o tipo de visão da aplicação no `App.tsx`:
    ```typescript
    type ActiveView = 'workspaces' | 'board' | 'analytics' | 'settings';
    ```
  - No cabeçalho principal (`app-header`), o cluster de navegação passa a exibir o seletor segmentado de alto nível: **"Espaços" | "Quadro" | "Analytics"**, acompanhado pelo botão de atalho direto para **"Configurações"** (com ícone de engrenagem) e perfil de usuário.
  - Ao clicar em um quadro no Hub de Espaços, o estado `activeBoardId` é atualizado e a visão transita automaticamente para `'board'`.
  - A tela de Configurações oferece um cabeçalho dedicado com botão de retorno proeminente: `"← Voltar ao Quadro"` (ou `"← Voltar aos Espaços"` dependendo da origem).
- **Rationale**: Proporciona separação estrita de responsabilidades visuais, sem poluir o cabeçalho do quadro Kanban e com transições instantâneas (<50ms) sem recarregamento de página.
- **Alternativas descartadas**:
  - *Modal flutuante para configurações*: Descartado por limitar o espaço para formulários ricos de gerenciamento de equipes, backups e temas.
  - *Sidebar fixa em todas as telas*: Descartado para o quadro Kanban, pois reduziria o espaço horizontal precioso para visualização das colunas de fluxo (preservando o design estabelecido na Feature 026).

---

### Decisão 2: Arquitetura Visual do Workspace & Board Hub (Fidelidade ao Protótipo)

- **Contexto**: O protótipo estabelece 5 elementos fundamentais: (1) Sidebar com lista de espaços e "Todos os espaços", (2) Botão "+ Novo painel", (3) Vitrine "Quadros favoritos", (4) Barra "Meus espaços de trabalho" com contadores e botões de ação circulares, e (5) Barra de filtro em pílula (*pill filter*).
- **Decisão**:
  - Construir o componente `WorkspaceHub.tsx` dividido em:
    1. `WorkspaceSidebar`: Barra lateral com lista de espaços de trabalho, marcadores de cor HSL personalizados, indicador do espaço ativo, botão superior "Todos os espaços de trabalho" e botão inferior "+ Novo painel".
    2. `WorkspaceMainArea`: Área principal contendo:
       - `FavoriteBoardsSection`: Vitrine superior com cartões elevados, botão de favoritar/desfavoritar (coração) e badges de status.
       - `WorkspaceActionBar`: Barra de ações com título, botões flutuantes circulares (FAB) de adicionar/arquivar e barra de busca/filtro em formato de pílula (*pill filter*).
       - `WorkspaceBoardsGrid`: Grade responsiva com cards dos quadros pertencentes ao espaço ativo, com menus contextuais de 3 pontinhos (abrir, renomear, duplicar, favoritar, arquivar).
- **Rationale**: Reflete com fidelidade de 100% a ergonomia do protótipo, integrando os dados dinâmicos do Metrik.
- **Alternativas descartadas**:
  - *Acordeão vertical*: Menos ergonômico e visualmente poluído comparado à grade de cartões com vitrine de favoritos.

---

### Decisão 3: Arquitetura do Módulo Separado de Configurações (Design Enterprise em 2 Colunas)

- **Contexto**: O usuário exigiu: *"crie a funcionalidade configurações de forma separada. aplique otmos conceitos de Design."*
- **Decisão**:
  - Implementar o componente `SettingsView.tsx` em tela cheia com layout em duas colunas:
    - **Coluna Esquerda (Navegação de Categorias)**: Abas verticais com ícones e descrições sutis:
      - 🎨 **Geral & Aparência**: Seleção de temas visuais (Dark Enterprise, Light Modern, Slate Minimal), densidade de cartões e preferências de animação.
      - 👥 **Espaços & Squads**: Gestão de Espaços de Trabalho (adicionar, renomear, selecionar cor cromática) e gerenciamento de membros/funções (Admin, Member, Guest) integrado à Feature 023.
      - 📊 **Políticas de Fluxo & Quadros**: Limites WIP sugeridos por coluna, políticas de trabalho e regras de bloqueio.
      - 💾 **Dados, Backup & Portabilidade**: Exportação completa em JSON, importação com validação de esquema, restauração de dados demo e limpeza de dados com diálogo de segurança.
    - **Coluna Direita (Painel de Ajustes & Cartões)**: Superfície com elevação suave, cartões com bordas sutis (`border-subtle`), interruptores (*toggles*), paletas de cores clicáveis e feedback visual instantâneo.
- **Rationale**: Eleva o padrão estético do Metrik para o nível enterprise, agrupando todas as ferramentas de administração em um ambiente seguro, espaçoso e livre de distrações.

---

### Decisão 4: Modelo de Dados e Migração Automática (Brownfield Coexistence)

- **Contexto**: O Metrik já armazena múltiplos quadros em `localStorage` sob a chave `metrik_boards`. Não podemos corromper ou perder esses dados ao introduzir o conceito de "Espaço de Trabalho".
- **Decisão**:
  - Criar o hook `useWorkspaces.ts` e persistir espaços em `localStorage` sob a chave `metrik_workspaces`.
  - **Estratégia de Migração Transparente**:
    - No primeiro carregamento, se `metrik_workspaces` não existir:
      - Criar automaticamente o espaço inicial padrão: `id: 'workspace-default'`, `name: 'Geral'`, `color: '#38bdf8'` (azul ciano Metrik).
      - Associar todos os `boardIds` existentes no `localStorage` a esse espaço inicial.
      - Adicionalmente, fornecer os espaços de exemplo sugeridos no protótipo (*Produção*, *P&D*, *Gestão*) como espaços secundários prontos para uso.
    - O estado de quadros favoritos é persistido em `metrik_favorite_boards` como um array de `boardId`.
- **Rationale**: Garante retrocompatibilidade total (zero perda de dados prévios) e inicialização rica e imediata para novos usuários.

---

### Decisão 5: Conformidade com Design System & Acessibilidade (WCAG 2.1 AA)

- **Contexto**: O produto deve manter padrões visuais de alta excelência e acessibilidade sem bibliotecas externas.
- **Decisão**:
  - Utilizar variáveis semânticas de cores (`--bg-primary`, `--bg-card`, `--border-subtle`, `--text-primary`, `--brand-gradient`) garantindo contraste mínimo de 4.5:1 em todos os 3 temas (Dark, Light, Slate).
  - Cards de quadros com foco visível (`:focus-visible`), navegação por teclado (`Tab`, `Enter`, `Space`, `Escape`), e atributos `aria-selected`, `aria-expanded` e `aria-label`.
  - Transições suaves via CSS (`all 0.18s cubic-bezier(0.16, 1, 0.3, 1)`) com 60 fps garantidos.
