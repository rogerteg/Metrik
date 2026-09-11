# Feature Specification: Gráfico de Envelhecimento do Trabalho em Progresso (Aging WIP Chart)

**Feature Branch**: `020-wip-aging-chart`  
**Created**: 2026-09-11  
**Status**: Draft  
**Input**: Imagem fornecida pelo usuário do **Aging Work In Progress Chart**:
- **Cabeçalho / Navegação**: Nova aba analítica `WIP` (ou `Envelhecimento do WIP / Aging WIP`) posicionada entre `Throughput` e `CFD / Fluxo` no `AnalyticsNavHeader.tsx`.
- **Painel de Configuração Lateral Esquerdo (`Dataset configuration`)**:
  - Seletor de workflow / colunas ativas.
  - Filtro de data inicial (`Start Date after`).
  - Checkbox para ignorar configuração de Cycle Time (`Ignore Cycle Time Configuration`).
  - Botão de aplicação `LOAD`.
  - Nota de orientação analítica sobre cartões em progresso.
- **Gráfico Principal de Aging WIP**:
  - **Eixo Horizontal (X)**: Colunas / etapas ativas do workflow em ordem linear da esquerda para a direita (ex: `Working on`, `Review`, `In Progress`, `Ready for Review`, etc.). A última etapa concluída (`Done`) é delimitada como destino final.
  - **Eixo Vertical (Y)**: Idade dos itens em dias corridos (`Age (Day)`), calculada desde o momento de início (`startedAt` ou `createdAt`) até a data de observação de referência ("As of [Date]").
  - **Distribuição de Faixas Coloridas por Etapa (Pace Percentiles & Done Percentiles)**:
    - Bandas verticais coloridas por coluna mapeando as zonas de risco e ritmo:
      - **Verde (< 50% percentil)**: Ritmo saudável de fluxo.
      - **Amarelo (50% a 70% / 85% percentil)**: Atenção, item aproximando-se da mediana histórica de conclusão da etapa.
      - **Laranja (85% a 95% percentil)**: Risco elevado / item aproximando-se do SLE (Service Level Expectation).
      - **Vermelho (> 95% percentil)**: Alerta crítico / cauda longa / gargalo eminente (Aging Work Item com envelhecimento anormal).
  - **Pontos Plotados (Dots / Aging Work Items)**:
    - Cada círculo representa um cartão de tarefa atualmente em progresso naquela etapa.
    - Posição Y indica a idade exata daquele cartão em dias.
    - Contagem de WIP no topo de cada coluna (ex: `WIP: 0`, `WIP: 2`, `WIP: 5`, `WIP: 1`).
    - Tooltip interativo ao pousar o mouse sobre o ponto exibindo: Título da Tarefa, Coluna, Idade em Dias, Tempo nesta etapa, se está bloqueada e percentil correspondente.
- **Painel Lateral Direito de Controles do Gráfico (`Controls for this Chart`)**:
  - **Done Percentiles**: Checkboxes para alternar visibilidade dos percentis históricos de tarefas concluídas (50%, 70%, 85%, 95%).
  - **Pace Percentiles**: Configuração de cores das zonas (ex: Verde-Amarelo-Vermelho / Green-Yellow-Red).
  - **Stalled Alert**: Alerta visual para tarefas paradas/sem movimentação recente ou bloqueadas.
  - **Filtros de Idade**: Seletores rápidos de corte de idade.

---

## 1. Visão Geral & Contexto Lean

Enquanto o *Cycle Time Scatter Plot* analisa tarefas que **já foram concluídas** (olhar retrospectivo), o **Aging WIP Chart (Gráfico de Envelhecimento do Trabalho em Progresso)** é o instrumento preditivo e proativo mais poderoso do Kanban moderno (Daniel Vacanti / Frank Vega / Troy Magennis).

Ele monitora as tarefas que **ainda estão no sistema em tempo real**:
1. **Identificação Precoce de Riscos**: Um cartão que atinge a zona laranja ou vermelha em uma etapa inicial (ex: *Development*) antes mesmo de chegar à fase de testes certamente violará o SLE final se nenhuma ação for tomada.
2. **Priorização Orientada ao Fluxo**: Em reuniões diárias (*Daily Standup*), em vez de perguntar "o que você fez ontem?", o time inspeciona o Aging WIP do topo para a base (itens mais velhos primeiro) para desobstruir impedimentos.
3. **Lei de Little em Ação**: Controlar a idade do WIP reduz a média de tempo de ciclo do sistema, aumentando a previsibilidade e a vazão.

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Visualização de Itens Ativos em Colunas com Bandas de Percentil (Priority: P1)

Como gerente de fluxo ou líder de time ágil, quero visualizar todos os itens atualmente em progresso plotados por coluna e por idade em dias, com zonas de percentil coloridas no fundo, para identificar imediatamente itens envelhecendo perigosamente no fluxo.

**Why this priority**: É o valor central do gráfico; transforma uma lista estática de tarefas em um radar visual de risco de atraso.

**Independent Test**:
- Acessar a aba `WIP` no módulo de Analytics.
- O gráfico renderiza as colunas em andamento no eixo X.
- Tarefas não concluídas aparecem como pontos individuais com coordenada Y proporcional à idade em dias desde a data de início.
- No fundo de cada coluna, são renderizadas faixas coloridas (Verde, Amarelo, Laranja, Vermelho) baseadas nos percentis históricos de permanência calculados a partir das tarefas concluídas do board.

---

### User Story 2 - Inspeção Detalhada de Aging Work Items com Tooltip e Destaque de Bloqueio (Priority: P1)

Como membro da equipe em uma reunião de fluxo, quero passar o cursor do mouse sobre qualquer ponto do gráfico para ver os detalhes da tarefa (ID, título, idade em dias, tempo na coluna atual e se possui bloqueio ativo), para tomar decisões rápidas de desbloqueio.

**Why this priority**: Permite agir diretamente sobre os itens mais críticos sem precisar alternar de tela.

**Independent Test**:
- Pousar o mouse sobre um ponto no gráfico.
- Um tooltip estilizado exibe: Título, ID, Idade (ex: `7.2 dias`), Coluna atual, e badge de aviso se a tarefa estiver bloqueada ou exceder o percentil P85/P95.
- Clicar no ponto abre ou destaca os detalhes da tarefa.

---

### User Story 3 - Painel de Controles e Filtros de Percentil (Priority: P2)

Como usuário analítico, quero alternar a visibilidade das linhas e zonas de percentil (50%, 70%, 85%, 95%) através de um painel lateral de controles, para ajustar a sensibilidade visual do gráfico às metas da equipe.

**Why this priority**: Dá flexibilidade ao usuário para comparar diferentes patamares de confiança estatística.

**Independent Test**:
- No painel lateral direito de controles, desmarcar o checkbox `70%`.
- A linha/zona do percentil 70% é ocultada instantaneamente do gráfico em SVG.

---

### User Story 4 - Contagem de WIP por Coluna e Data de Referência "As of Date" (Priority: P2)

Como auditor de processos, quero ver o total de WIP no topo de cada coluna (ex: `WIP: 2`, `WIP: 5`) e a indicação da data de corte da análise ("As of [Data]"), para validar se os limites de WIP estabelecidos estão sendo respeitados.

**Why this priority**: Conecta a análise de envelhecimento diretamente com as políticas explícitas de limite de WIP do board.

**Independent Test**:
- No topo de cada coluna no SVG, um rótulo exibe `WIP: X`.
- O valor coincide exatamente com a quantidade de cartões ativos renderizados naquela coluna.

---

## 3. Requisitos Funcionais (FR)

- **FR-001**: O sistema deve calcular a **Idade do Item (Item Age)** para cada tarefa em andamento (tarefas que não estão na categoria `done` e não possuem `completedAt`):
  $$\text{Age (dias)} = \frac{\text{Data de Referência} - \text{startedAt (ou createdAt)}}{86.400.000\text{ ms}}$$
  arredondado para 1 casa decimal.
- **FR-002**: O sistema deve extrair os **Percentis de Ritmo (Pace / Done Percentiles)** das tarefas já concluídas para cada etapa ou para o ciclo global, gerando os limites de 50%, 70%, 85% e 95% via interpolação linear padrão (NIST / R-6 em `statistics.ts`).
- **FR-003**: As colunas do eixo horizontal (X) devem refletir as colunas ativas do board selecionado (excluindo a coluna `done` do corpo de plotagem, mantendo-a apenas como delimitador final).
- **FR-004**: No fundo de cada coluna, o gráfico deve renderizar retângulos SVG coloridos preenchendo as zonas verticais:
  - Verde: de 0 até P50.
  - Amarelo: de P50 até P70 (ou P85).
  - Laranja: de P70 (ou P85) até P95.
  - Vermelho: acima de P95.
- **FR-005**: Cada tarefa ativa é desenhada como um círculo no SVG (`<circle>`), com raio proporcional e cor destacada (azul/ciano para itens normais, vermelho/púrpura para bloqueados).
- **FR-006**: No topo de cada coluna deve ser exibido o badge `WIP: N` contabilizando o total de cartões em andamento na etapa.
- **FR-007**: A nova aba `wip` (`⏳ WIP Aging`) deve ser adicionada à barra de navegação [AnalyticsNavHeader.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/AnalyticsNavHeader.tsx) e renderizada no [AnalyticsDashboard.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/AnalyticsDashboard.tsx).
- **FR-008**: O componente deve incluir painel retrátil de filtros à esquerda (`Dataset configuration`) e painel de opções à direita (`Controls for this Chart`) permitindo ligar/desligar percentis.
- **FR-009**: Estado vazio didático (*Empty/Guidance State*) caso não haja cartões em andamento ou nenhuma tarefa concluída para gerar a linha base de percentis.

---

## 4. Requisitos Não Funcionais (NFR)

- **NFR-001 (Performance)**: Renderização gráfica 100% SVG vetorial nativo em menos de 50ms, sem bibliotecas pesadas de terceiros (Princípio V da Constituição).
- **NFR-002 (Acessibilidade & Contraste)**: As bandas de cores devem ter opacidade e contraste calibrados para permitir leitura clara dos pontos sobrepostos, respeitando os temas claro e escuro.
- **NFR-003 (Independência Estrita de Marca - Princípio VII)**: Nomenclatura 100% científica e neutra (Daniel Vacanti, Aging Work In Progress, Lei de Little, Padrão NIST). Nenhuma menção a marcas comerciais ou ferramentas terceiras em código, labels, DOM ou CSS.

---

## 5. Critérios de Sucesso Mensuráveis

1. **Acurácia Temporal**: Idade dos cartões calculada com precisão de frações de dias em relação à data atual.
2. **Cobertura de Testes**: Mínimo de 10 novos testes unitários cobrindo o cálculo de idade de WIP, mapeamento de bandas de percentil e renderização da UI.
3. **Preservação Global**: Os 234 testes existentes no Metrik continuam passando com zero quebras.
