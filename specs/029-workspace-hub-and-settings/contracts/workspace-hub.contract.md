# Visual & Interface Contract: Hub de Espaços de Trabalho e Módulo Separado de Configurações

**Feature Branch**: `029-workspace-hub-and-settings`
**Date**: 2026-09-15
**Spec**: [spec.md](../spec.md) | **Data Model**: [data-model.md](../data-model.md)

---

## 1. Contrato de Roteamento e Estados de Visão

A aplicação Metrik passa a suportar 4 visões de primeiro nível gerenciadas no estado raiz do `App.tsx`:

| Visão (`view`) | Descrição | Ponto de Entrada |
| :--- | :--- | :--- |
| `'workspaces'` | Hub panorâmico de Espaços de Trabalho e Quadros Favoritos (conforme protótipo) | Botão "Espaços" no cabeçalho ou logotipo |
| `'board'` | Visão operacional do Quadro Kanban interativo com colunas e cartões | Botão "Quadro" no cabeçalho ou clique em card no Hub |
| `'analytics'` | Painel de métricas analíticas avançadas (CFD, Scatter Plot, Monte Carlo, Aging) | Botão "Analytics" no cabeçalho |
| `'settings'` | Módulo dedicado de configurações em tela cheia (*Full View*) em 2 colunas | Botão com ícone de engrenagem / "Configurações" |

---

## 2. Contrato de Estrutura do Workspace Hub

### 2.1 Barra Lateral de Espaços (`.workspace-sidebar`)

- **Largura**: `260px` fixa (em desktop), colapsável em telas estreitas (`<1180px`).
- **Botão Superior**: Item "Todos os espaços de trabalho" com ícone de Home, exibindo contagem total consolidada de quadros.
- **Lista de Espaços**:
  - Cada item exibe: marcador circular colorido (`width: 14px; height: 14px; border-radius: 50%`) com a cor do espaço, nome do espaço com tipografia `font-weight: 600`, e menu de ações rápidas (3 pontinhos).
  - Estado ativo: borda esquerda destacada, fundo `var(--btn-secondary-hover-bg)` e texto de alto contraste.
- **Botão Inferior Fixo**:
  - Botão estilizado `+ Novo painel`: `width: 100%`, borda tracejada ou sutil, ícone `+` centralizado, abrindo o modal de criação de espaço ou quadro.

### 2.2 Seção de Quadros Favoritos (`.favorite-boards-section`)

- **Posicionamento**: Topo da área de conteúdo principal.
- **Cabeçalho**: Ícone de coração (`fill: #f43f5e; color: #f43f5e`), título `"Quadros favoritos"`, e contador de favoritos.
- **Cards de Favoritos**:
  - Superfície em card elevado: `background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 16px; min-height: 110px;`.
  - Conteúdo: Título do quadro, badge de tempo/deadline (ex.: ícone de relógio + contagem de tarefas), menu contextual (3 pontos) no canto superior direito e ícone de coração preenchido no canto inferior direito.
  - Interação: Clique no corpo do card navega para a visão `'board'` com aquele quadro ativo.

### 2.3 Barra de Ações & Filtro em Pílula (`.workspace-action-bar`)

- **Layout**: Flexbox `align-items: center; justify-content: space-between; margin: 20px 0;`.
- **Lado Esquerdo**: Título `"Meus espaços de trabalho"` + Botões Flutuantes Circulares (*FAB*):
  - Botão circular `+` (adicionar quadro rápido).
  - Botão circular de arquivo/gerenciamento com badge numérico.
- **Lado Direito**: Barra de busca e filtro em formato de pílula (*Pill Filter*):
  - `border-radius: 9999px; padding: 8px 18px; border: 1px solid var(--border-subtle); background: var(--bg-card); display: flex; align-items: center; gap: 8px;`.
  - Ícone de funil (*Filtro*) + campo de entrada de texto + badge indicador de resultados.

### 2.4 Grade de Quadros do Espaço Ativo (`.workspace-boards-grid`)

- **Layout**: Grid CSS responsivo `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;`.
- **Cards de Quadros**:
  - Superfície translúcida com `border-radius: 14px; backdrop-filter: var(--backdrop-blur)`.
  - Hover effect: `transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--brand-accent)`.
  - Menus de 3 pontinhos com `aria-haspopup="menu"` contendo opções: *Abrir Quadro, Favoritar/Desfavoritar, Renomear, Duplicar, Arquivar*.

---

## 3. Contrato do Módulo Separado de Configurações (`.settings-view`)

- **Apresentação**: Visão em tela cheia (*Full View*) independente, sem poluição da barra de ferramentas do Kanban.
- **Barra Superior de Navegação**:
  - Botão `"← Voltar ao Quadro"` (ou `"← Voltar ao Hub"`): `btn btn-secondary`, ícone de seta para a esquerda.
  - Título `"Configurações do Sistema"` com subtítulo `"Personalização, Espaços, Políticas e Gerenciamento de Dados"`.
- **Estrutura em 2 Colunas**:
  - **Coluna Esquerda (Menu de Abas - 240px)**:
    - Lista vertical de abas:
      1. `🎨 Geral & Aparência`: Temas (Dark, Light, Slate), densidade e efeitos visuais.
      2. `👥 Espaços & Squads`: Lista de espaços, editor de nomes, seletores de cor cromática e controle de membros.
      3. `📊 Políticas de Fluxo`: Limites WIP sugeridos por coluna e regras de bloqueio.
      4. `💾 Dados & Backup`: Botões de exportação de dados (JSON), importação de backup, restauração de dados demonstrativos e limpeza de quadro.
  - **Coluna Direita (Painel de Conteúdo Expandido)**:
    - Cartões brancos/translúcidos bem espaçados com títulos claros, explicações de cada configuração e controles de fácil acionamento (*toggles*, botões, inputs).

---

## 4. Contrato de Acessibilidade & Teclado (WCAG 2.1 AA)

- **Foco Visível**: Todos os botões, cards e controles interativos possuem anel de foco bem delineado (`outline: 2px solid #38bdf8; outline-offset: 2px;`).
- **Teclado**:
  - `Escape`: Fecha qualquer modal de criação de espaço ou menu contextual aberto.
  - `Enter` / `Space`: Aciona a abertura de quadros nos cards e alterna favoritos.
  - `Tab` / `Shift+Tab`: Navegação sequencial lógica e sem armadilhas de foco (*no focus traps*).
- **Rótulos ARIA**:
  - Botão de favoritar: `aria-label="Adicionar [Nome do Quadro] aos favoritos"` ou `aria-label="Remover [Nome do Quadro] dos favoritos"`.
  - Menus contextuais: `aria-expanded="false|true"` e `aria-haspopup="menu"`.
