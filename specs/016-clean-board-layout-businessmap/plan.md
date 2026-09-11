# Implementation Plan: Layout Clean e Moderno do Board (Inspirado no Businessmap / Kanbanize)

**Branch**: `016-clean-board-layout-businessmap` | **Date**: 2026-09-11 | **Spec**: [specs/016-clean-board-layout-businessmap/spec.md](spec.md)

**Input**: Feature specification e Clarificações de design consolidadas em `specs/016-clean-board-layout-businessmap/spec.md`.

---

## 1. Summary & Visual Architecture

Transformar a interface visual do quadro Kanban do Metrik em um layout limpo, moderno e de alto padrão enterprise inspirado diretamente no **Businessmap** (antigo Kanbanize). 

A evolução equilibra a riqueza de dados e controle de fluxo do Metrik com uma relação sinal-ruído exemplar:
1. **Board & Column Grid**:
   - Cabeçalhos de coluna unificados e compactos com tipografia nítida.
   - Contadores de itens e limites de WIP no formato *pill* minimalista (`X / Y` em badge discreta e elegante).
   - Divisórias de coluna refinadas com bordas translúcidas (`rgba(255, 255, 255, 0.08)`), superfícies escuras balanceadas (`#131b2e` / `#162033`) e scrollbars customizadas sutis.
   - Seletor de cores temáticas da coluna compacto e integrado harmonicamente.
2. **Task Card Architecture**:
   - Superfície refinada em dark slate (`#1e293b`), com elevação suave no hover e borda neutra fina.
   - Aplicação da cor temática da coluna em **faixa lateral esquerda sólida de 3px a 4px** (`border-left`), mantendo fundo neutro e elegância sem saturações excessivas.
   - Cabeçalho do card em linha única com prioridade e badges de status compactas (`⛔ Bloqueado`, `⏳ Parado`).
   - Seções de Qualidade (**Critérios de Aceitação** e **Cenários de Testes**) com toggle inline de expandir/recolher: por padrão, se preenchidos, exibem contador compacto (ex: `✓ 2 critérios` / `🧪 1 cenário`) ou preview resumido de 1 linha; um clique no chevron/header expande para edição inline instantânea.
   - Rodapé enxuto: tags em pílulas compactas, badges de prazo e lead time harmonizadas, e botões de ação com **opacidade 0.6 persistente**, elevando para **1.0 no hover/focus**.
3. **Integridade de Negócio**:
   - Zero regressão em: fluxo unidirecional, bloqueio de tarefas impedidas, âncora fixa na 1ª coluna, limites de WIP e dinamismo de cores do CFD.

---

## 2. Technical Context

- **Language / Framework**: TypeScript 5.7+ / React 19 / Vite 6.
- **Styling Architecture**: Vanilla CSS tokens e componentes CSS modernos em `src/App.css` com variáveis de design tokens (`--bg-board`, `--bg-column`, `--bg-card`, etc.).
- **Componentes Afetados**:
  - `src/components/Board.tsx`: Grid, banners de aviso de limite e layout container.
  - `src/components/Column.tsx`: Cabeçalho compacto, alinhamento de ações, badges e drop indicator.
  - `src/components/WipLimitBadge.tsx`: Pill moderna de WIP limit.
  - `src/components/Task.tsx`: Cabeçalho em linha, toggle de expandir/recolher para critérios/cenários, border-left de 3px/4px e botões de ação discretos.
  - `src/App.css`: Design system tokens, micro-interações, hover states, scrollbars e contrastes WCAG AA.
- **Testing**: Vitest + React Testing Library (202+ testes unitários mantidos e novos testes de interface).

---

## 3. Constitution & SDD Check

- **I. Spec-Driven Precedence**: **PASS** — `spec.md` e `checklists/requirements.md` devidamente completados e aprovados antes deste plano.
- **II. Code Quality & Modularity**: **PASS** — Refatoração estética modularizada, mantendo props e interfaces dos componentes compatíveis.
- **III. Automated Verification**: **PASS** — Suíte de testes unitários executada como baseline (202 testes passando) e plano de validação detalhado.
- **IV. Backward Compatibility & Business Rules**: **PASS** — Não altera regras de domínio (`isTaskStagnant`, `blocked`, regras de reordenação ou guards de fluxo).

---

## 4. Proposed File Changes

### Component Layer
#### [MODIFY] [Board.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Board.tsx)
- Refinar classes e container do grid para alinhamento profissional estilo swimlane/grid do Businessmap.
- Estilizar o botão de "Nova Coluna" com estética pontilhada/translúcida elegante.

#### [MODIFY] [Column.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Column.tsx)
- Compactar a área do cabeçalho de coluna (`column-header`).
- Integrar os controles (drag handle, badge de título, indicador de coluna fixa 🔒, pill de WIP e ações de cor/exclusão) em uma linha limpa e balanceada.
- Aplicar o acento de cor da coluna como sutil indicador superior ou traço distintivo de 3px sem saturações agressivas.

#### [MODIFY] [WipLimitBadge.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/WipLimitBadge.tsx)
- Modernizar o visual do badge: pílula arredondada (`pill`), tipografia monospace refinada, contraste suave quando dentro do limite e alerta em âmbar/coral discreto quando sobrecarregado (`overloaded`).

#### [MODIFY] [Task.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Task.tsx)
- Reorganizar o `task-card-header`: prioridade minimalista à esquerda, badges de status (`⛔ Bloqueado`, `⏳ Parado`) à direita em linha única enxuta.
- Implementar estado local `isQaExpanded` (com persistência visual ou toggle explícito):
  - Modo compacto: exibe barra de status compacta com contadores e botão discreto `▼ Expandir` ou resumo de 1 linha.
  - Modo expandido: exibe os micro-boxes editáveis de Critérios de Aceitação e Cenários de Testes com visual limpo.
- Garantir que a cor da coluna seja injetada exclusivamente como `borderLeft: 3px solid ${color}` (ou 4px) com fundo neutro uniforme.
- Estilizar botões de ação do rodapé com opacidade 0.6 persistente e transição para 1.0 no hover/focus.

### Style Layer
#### [MODIFY] [App.css](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/App.css)
- Atualizar tokens de cores:
  - Fundo do board: `#0b0f19` / `#0f172a`.
  - Superfície da coluna: `#121a2d` com borda `rgba(255, 255, 255, 0.07)`.
  - Superfície do card: `#1e293b` com hover para `#233148` e sombra leve `0 1px 3px rgba(0, 0, 0, 0.35)`.
- Adicionar estilos dedicados para:
  - `.task-qa-toggle-btn`: botão discreto de expandir/recolher critérios e cenários.
  - `.badge-wip`: pílula clean estilo Businessmap.
  - `.task-nav-buttons` e `.btn-delete-task`: opacidade 0.6 e hover suave.
  - Scrollbars da lista de tarefas e transições fluidas de drop target.

### Testing Layer
#### [MODIFY] [Task.test.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/tests/unit/Task.test.tsx)
- Validar a nova estrutura visual de cabeçalho, a aplicação da faixa lateral `borderLeft` e a interação de toggle/expansão dos campos de QA.

---

## 5. Verification Plan

### Automated Tests
1. Rodar suíte de testes unitários:
   ```bash
   npm test
   ```
   *Critério*: 100% dos testes passando (mínimo de 202 testes).
2. Rodar verificação de tipos e compilação de produção:
   ```bash
   npm run build
   ```
   *Critério*: Zero erros TypeScript e build gerado com sucesso.

### Visual & Interactive Manual Verification
1. Abrir a aplicação no navegador (`http://localhost:5173/` ou dev server ativo).
2. Validar que o quadro possui visual limpo, espaçamento regular, colunas bem delimitadas e cabeçalhos compactos.
3. Verificar a aparência dos cards:
   - Faixa lateral sutil da cor da coluna.
   - Cabeçalho limpo com prioridade e badges de status.
   - Seções de Critérios e Cenários de Testes compactas e expansíveis com 1 clique.
   - Botões de navegação e lixeira visíveis com opacidade suave.
4. Testar movimentações de drag-and-drop e verificar que o fluxo unidirecional e o bloqueio de tarefas impedidas permanecem 100% invioláveis.
