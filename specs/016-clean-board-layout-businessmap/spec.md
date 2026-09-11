# Feature Specification: Layout Clean e Moderno do Board (Inspirado no Businessmap / Kanbanize)

**Feature Branch**: `016-clean-board-layout-businessmap`  
**Created**: 2026-09-11  
**Status**: Implemented & Converged (Verified)  
**Input**: Solicitação do usuário: "melhorar layout do board, mais clean, pegue o exemplo/modelo do BusinessMap"

---

## Clarifications

### Session 2026-09-11
- **Q1: Comportamento dos campos de 'Critérios de Aceitação' e 'Cenários de Testes' no card?**
  - **A1**: **Exibição compacta/resumida com toggle inline expandir/recolher**: Preserva a altura original do cartão no fluxo; quando preenchidos ou sob demanda, o usuário pode expandir com 1 clique para inspecionar ou editar sem precisar obrigatoriamente abrir o modal de detalhes.
- **Q2: Como as cores customizadas das colunas devem se refletir nos cartões?**
  - **A2**: **Faixa lateral esquerda sutil (3px a 4px de border-left sólida)** com fundo neutro escuro elegante (padrão de design enterprise do Businessmap/Jira), evitando poluição com fundos excessivamente saturados.
- **Q3: Visibilidade dos botões de ação do card (navegação direcional e exclusão)?**
  - **A3**: **Sempre visíveis com opacidade moderada/discreta (0.6)**, elevando suavemente para opacidade total (1.0) no hover/focus, garantindo usabilidade imediata e compatibilidade touch sem ruído visual constante.

---

## 1. Visão Geral & Contexto

O **Metrik** evoluiu com múltiplos recursos essenciais de fluxo Kanban (WIP limits, bloqueios, fluxo unidirecional, governança de cores, critérios de aceitação e cenários de teste nos cards). Com a expansão desses dados, a densidade visual do quadro precisa de um refinamento de design enterprise inspirado no **Businessmap** (antigo Kanbanize), uma das referências mundiais de Kanban profissional.

### Características-chave do modelo Businessmap:
1. **Hierarquia Visual Limpa e Estruturada**:
   - Cabeçalhos de coluna discretos, com tipografia refinada, contadores de WIP compactos estilo pill/badge e ações contextuais bem distribuídas.
   - Divisórias sutis entre colunas com grid consistente, sem poluição visual ou sobreposição de sombras pesadas.
2. **Cards Enxutos, Funcionais e Elegantes**:
   - Cabeçalho do card com ID/código de referência sutil (`#TK-...` ou índice), prioridade expressa de forma harmoniosa e badges compactas de status (ex: ⛔ Bloqueado, ⏳ Parado).
   - Tipografia limpa no título da tarefa com hierarquia clara.
   - Seções de Qualidade e Engenharia (*Critérios de Aceitação* e *Cenários de Testes*) com layout organizado em micro-boxes limpos, colapsáveis ou compactos, preservando a legibilidade sem sobrecarregar a altura do card.
   - Rodapé do card limpo: tags como pequenas pílulas monocromáticas/suaves, datas de entrega e lead time com ícones minimalistas e botões de navegação e exclusão que aparecem com suavidade (hover/focus states discretos).
3. **Alto "Signal-to-Noise Ratio" (Relação Sinal-Ruído)**:
   - Eliminação de gradientes espalhafatosos e sombras duras.
   - Adoção de superfícies escuras premium (dark slate/navy: `#0f172a`, `#1e293b`, `#334155`), com bordas sutis (`rgba(255, 255, 255, 0.08)`) e acentos de cor focados e funcionais.
   - Micro-interações e transições fluidas durante drag-and-drop e hover.

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Grid e Colunas do Board Estilo Businessmap (Priority: P1)

Como gestor ou desenvolvedor utilizando o Metrik, quero visualizar o quadro com colunas bem delimitadas, cabeçalhos modernos e contadores de WIP discretos, para que o fluxo de trabalho seja imediatamente legível, limpo e profissional.

**Why this priority**: O board é a visão primária de todo o sistema. A ergonomia visual determina o nível de estresse cognitivo e a clareza do fluxo de ponta a ponta.

**Independent Test**: Acessar o quadro e verificar:
- Cabeçalhos das colunas alinhados, com título nítido, indicador de limite de WIP elegante (`X / Y` em pill discreta) e ações (adicionar, cor, menu) integradas com elegância.
- Espaçamento regular entre colunas, bordas refinadas e fundo de coluna que destaca os cards com alto contraste e clareza.

**Acceptance Scenarios**:
1. **Given** o quadro carregado com colunas configuradas, **When** o usuário examina os cabeçalhos de coluna, **Then** as informações de título, cor teme e contagem de itens/limite de WIP são apresentadas em formato compacto, sem quebras indesejadas e com tipografia profissional.
2. **Given** uma coluna com limite de WIP excedido, **When** a contagem ultrapassa o limite, **Then** o indicador exibe status de alerta limpo (borda/fundo âmbar/coral sutil) sem poluir o restante da coluna.
3. **Given** o container do quadro Kanban, **When** renderizado em telas largas ou com scroll horizontal, **Then** as divisões entre colunas utilizam linhas de separação discretas no estilo swimlane/grid profissional do Businessmap.

---

### User Story 2 - Cartões de Tarefa com Visual Clean e Organização de Metadados (Priority: P1)

Como membro do time técnico, quero que cada cartão no quadro exiba seu título, prioridade, status e campos de qualidade com clareza visual, sem parecer sobrecarregado ou poluído, para que eu possa inspecionar o trabalho com rapidez.

**Why this priority**: O card abriga múltiplas dimensões (prioridade, tags, bloqueios, estagnação, datas, critérios de aceitação e cenários de testes). Sem um design limpo e estruturado como o do Businessmap, o card fica excessivamente alto e desordenado.

**Independent Test**: Criar um cartão com título, tags, bloqueio e preencher critérios de aceitação e cenários de testes. Inspecionar o card na coluna e atestar que os elementos estão agrupados de forma harmoniosa, com tipografia legível, padding equilibrado e bordas suaves.

**Acceptance Scenarios**:
1. **Given** um cartão com título e prioridade, **When** exibido na coluna, **Then** o topo do cartão traz um indicador discreto da prioridade alinhado a badges de status compactas (bloqueio ou estagnação) com espaçamento harmônico.
2. **Given** um cartão com critérios de aceitação e cenários de testes preenchidos, **When** renderizado no board, **Then** esses campos aparecem em micro-seções limpas com fundo translúcido sutil (`rgba(255, 255, 255, 0.03)`), ícones discretos e opção de expansão/recolhimento ou visualização resumida (compact previews) para não inflar a altura do card.
3. **Given** o rodapé do cartão, **When** tags e métricas de tempo (lead time, due date) estão presentes, **Then** são dispostos em linha com pílulas compactas e ícones minimalistas, mantendo botões de ação (mover, excluir) discretos e acessíveis via hover/focus.

---

### User Story 3 - Estados Interativos e Feedback de Drag-and-Drop Harmoniosos (Priority: P2)

Como usuário arrastando tarefas entre colunas, quero que o feedback visual (drop target, placeholder, hover) seja sutil e preciso como nas ferramentas modernas de Kanban, para ter segurança tátil sem distorções visuais abruptas.

**Why this priority**: A usabilidade no drag-and-drop precisa acompanhar a nova estética limpa, evitando sombras pesadas ou saltos de layout.

**Independent Test**: Arrastar um cartão entre colunas permitidas e verificar se a linha indicadora de inserção (drop indicator) e a coluna de destino reagem com destaque suave e consistente.

**Acceptance Scenarios**:
1. **Given** o usuário arrastando um card, **When** sobrevoa uma coluna de destino válida, **Then** a coluna exibe uma borda sutilmente iluminada com o acento da sua cor configurada.
2. **Given** a linha indicadora de soltura (drop target indicator), **When** posicionada entre dois cards, **Then** exibe uma linha fina e elegante sem deslocar bruscamente os cards adjacentes.
3. **Given** um card bloqueado, **When** o usuário tenta arrastar, **Then** o cursor e feedback visual reforçam suavemente o impedimento sem ruído gráfico.

---

## 3. Requisitos Funcionais

- **FR-001**: O layout das colunas (`Column.tsx`, `App.css`) deve adotar estrutura de cabeçalho unificada, com padding refinado (ex: 12px 14px), título tipograficamente harmonizado e badge de contagem/WIP em formato pill compacto.
- **FR-002**: A área de tarefas da coluna deve ter background neutro escuro com alto contraste relativo aos cards, scrollbar fina e customizada e espaçamento vertical uniforme entre cards (gap de 8px a 10px).
- **FR-003**: Os cards de tarefas (`Task.tsx`) devem possuir superfície com bordas arredondadas modernas (8px a 10px), contorno sutil (`border: 1px solid rgba(255, 255, 255, 0.08)` ou accent da coluna) e sombra suave (`box-shadow: 0 1px 3px rgba(0,0,0,0.3)`).
- **FR-004**: O cabeçalho interno do card deve unificar a indicação de prioridade (pill minimalista) e eventuais badges de alerta (`⛔ Bloqueado`, `⏳ Parado`) em uma única linha enxuta.
- **FR-005**: As seções de "Critérios de Aceitação" e "Cenários de Testes" no card devem adotar visual estruturado, com títulos em caixa baixa/alta refinados, ícones de checklist minimalistas e opção de exibição compacta (ou colapsável com toggle limpo) para permitir que o usuário mantenha o card compacto ou expandido.
- **FR-006**: O rodapé do card deve agrupar tags, badge de prazo (due date) e lead time em linha horizontal enxuta, mantendo as ações secundárias (botões de avanço unidirecional e exclusão) organizadas sem poluir o cartão.
- **FR-007**: As cores temáticas configuradas nas colunas devem ser aplicadas como detalhes de requinte (borda esquerda estilizada de 3px ou accent pill sutil), preservando o tema escuro limpo do card sem criar blocos de cores saturadas excessivas.
- **FR-008**: O botão de "Adicionar Coluna" e o botão de "Adicionar Tarefa" devem seguir a linguagem de design minimalista, com botões discretos e de alta usabilidade.
- **FR-009**: Compatibilidade total: nenhuma alteração estética deve quebrar as regras de negócio vigentes (fluxo unidirecional, bloqueio de tarefas impedidas, limites de coluna, drag and drop, filtros, persistência local).

---

## 4. Requisitos Não-Funcionais & Estéticos

- **Tipografia**: Utilizar a família tipográfica moderna do sistema com tamanhos harmoniosos (13px-14px para títulos de tarefas, 11px-12px para metadados/tags/critérios).
- **Paleta de Cores (Inspirada no Businessmap)**:
  - Fundo do board: `#0b0f19` / `#0f172a`.
  - Fundo da coluna: `#131b2e` / `#182238`.
  - Fundo do card: `#1e293b` (com elevação limpa no hover para `#243047`).
  - Bordas: `rgba(255, 255, 255, 0.06)` a `rgba(255, 255, 255, 0.12)`.
  - Textos: `#f1f5f9` (primário), `#94a3b8` (secundário/labels), `#64748b` (placeholders e metadados secundários).
- **Performance**: Nenhuma animação pesada; todas as transições de hover e foco devem rodar a 60fps usando `transform` e `opacity`.
- **Acessibilidade**: Contraste WCAG AA para todos os textos legíveis contra as superfícies escuras.

---

## 5. Critérios de Aceitação da Especificação

1. O layout do board apresenta aparência visual notavelmente mais limpa, sofisticada e profissional, diretamente inspirada nas melhores práticas do Businessmap.
2. Os cartões de tarefa exibem informações com alta hierarquia: título legível, prioridade e status em destaque discreto, e campos de critérios/cenários perfeitamente integrados.
3. O cabeçalho das colunas é compacto, com contadores de WIP em formato pill e botões de ação contextuais elegantes.
4. Todos os 202+ testes unitários continuam passando sem regressão e novos testes de interface validam a estrutura limpa.
5. O build de produção (`npm run build`) compila com zero erros.
