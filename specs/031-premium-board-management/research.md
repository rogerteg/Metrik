# Research & Architectural Decisions: Gerenciamento Premium de Quadros (Feature 031)

**Feature**: `031-premium-board-management`  
**Status**: Completed  
**Date**: 2026-09-17  

---

## 1. Context & Objectives

A funcionalidade atual de gerenciamento de quadros do Metrik opera através do componente legado `BoardManagementModal.tsx`, uma janela modal estreita (`max-width: 540px`) acionada pelo botão "Gerenciar" do cabeçalho. Usuários relataram que esta abordagem restringe a visualização, não oferece telemetria de fluxo sobre os quadros, utiliza alertas nativos do navegador (`window.confirm`) e não aproveita o espaço de tela para uma experiência premium corporativa.

O objetivo da Feature 031 é transformar o gerenciamento de quadros em uma experiência de primeira classe com:
1. Uma **Aba Gerenciar** dedicada no cabeçalho superior (`Espaços | Quadro | Analytics | Gerenciar | Configurações`).
2. Uma visualização ampla e responsiva com alternador dual entre **Grade de Cartões Premium** e **Tabela Compacta de Alta Densidade**.
3. Telemetria de fluxo em tempo real por quadro (WIP, total de itens, colunas, status ativo, vínculo com Squad).
4. Edição rápida de nome inline e substituição de alertas nativos por diálogo modal seguro e elegante.

---

## 2. Architectural Decisions

### Decisão 1: Promoção de "Gerenciar" a Estado de Visão de Primeira Classe no `App.tsx`
- **Decisão**: Adicionar `'manage'` ao tipo union literal do estado `view` no `App.tsx` (`'workspaces' | 'board' | 'analytics' | 'manage' | 'settings'`). Adicionar o botão "Gerenciar" ao `.view-toggle` do cabeçalho principal e sincronizar o botão "Gerenciar" em `BoardSwitcher.tsx` para executar `setView('manage')`.
- **Racional**:
  - Elimina a sobrecarga cognitiva e restrição de espaço do modal legado de 540px.
  - Oferece um canvas completo para acomodar busca, filtros por squad, criação rápida, grade de cartões e tabela administrativa.
  - Mantém retrocompatibilidade total: usuários acostumados a clicar no botão "Gerenciar" do seletor continuam sendo direcionados para a mesma interface, agora em tela cheia.
- **Alternativas descartadas**:
  - *Expandir a modal legada para 90vw*: Rejeitada porque modais sobrepostas ainda competem com o fundo, não oferecem URL/estado de aba consistente e dificultam navegação fluida.
  - *Aninhar o gerenciamento dentro de Configurações*: Rejeitada porque gestão diária e chaveamento de quadros é operação frequente de trabalho, enquanto Configurações lida com preferências de sistema, temas e persistência.

---

### Decisão 2: Alternância Dual de Visualização (Grade de Cartões vs Tabela Compacta)
- **Decisão**: Implementar o componente `ManageBoardsView` com controle de modo de exibição local persistido:
  - **Modo Grade (Cards)**: Cartões visuais destacados, com bordas temáticas da Squad, badge de "Quadro Ativo" com efeito luminoso (*glow*), estatísticas de colunas e tarefas, e botões de ação rápida.
  - **Modo Tabela (Table)**: Estrutura HTML semântica com linhas de dados de alta densidade, perfeita para gestores que operam dezenas de quadros e necessitam de ordenação rápida por nome, squad ou volume de itens.
- **Racional**:
  - Atende perfeitamente ao requisito do usuário de "melhor visualização" e "algo mais premium", permitindo tanto exploração visual rica quanto governança de alta densidade.
- **Alternativas descartadas**:
  - *Apenas Grade*: Insuficiente para usuários corporativos com 20+ quadros que precisam escanear grandes listas rapidamente.
  - *Apenas Tabela*: Pobre visualmente, não transmitindo a identidade premium do Metrik Design System.

---

### Decisão 3: Telemetria de Fluxo por Quadro via Função Pura
- **Decisão**: Criar a função utilitária pura `computeBoardSummaryMetrics(board: BoardModel, activeBoardId: string | null): BoardSummaryMetrics` em `src/utils/boardMetrics.ts`.
  - Retorna: `columnsCount`, `totalTasksCount`, `wipTasksCount`, `doneTasksCount`, `isActive`.
- **Racional**:
  - Separação estrita de responsabilidades (Constituição II).
  - Testabilidade automatizada 100% determinística via Vitest sem necessidade de montar o DOM do React.
  - Otimização de renderização via `useMemo` na lista de quadros.
- **Alternativas descartadas**:
  - *Calcular métricas dentro do JSX de cada cartão*: Rejeitada porque dispersa a lógica de cálculo, dificulta testes unitários e pode causar recálculos desnecessários a cada render do componente.

---

### Decisão 4: Eliminação de Diálogos Nativos do Navegador (`window.confirm`)
- **Decisão**: Criar o componente `DeleteBoardModal.tsx` integrado ao Metrik Design System:
  - Fundo com `backdrop-filter: blur(4px)`.
  - Destaque explícito para o nome do quadro e o número de tarefas que serão excluídas.
  - Desativação do botão de exclusão e alerta educativo quando o quadro for o único remanescente no sistema (`boards.length <= 1`).
- **Racional**:
  - Alertas nativos do navegador (`window.confirm`) bloqueiam a thread de UI, não suportam temas escuros, quebram testes automatizados e têm aparência amadora, incompatível com um produto premium.
  - Atende diretamente ao critério de sucesso SC-003.

---

## 3. Technology & Dependency Evaluation

- **Dependências Externas Novas**: Nenhuma (zero dependências adicionais, estrita aderência à Constituição V - Simplicidade & YAGNI).
- **CSS / Styling**: CSS puro com variáveis de design tokens em `src/components/ManageBoards.css`.
- **Acessibilidade (a11y)**: Atributos ARIA (`role="region"`, `aria-label`, `aria-current`, teclado `Enter`/`Escape`).
- **Independência de Marca**: 100% de conformidade com a Constituição VII (zero menção a marcas externas).
