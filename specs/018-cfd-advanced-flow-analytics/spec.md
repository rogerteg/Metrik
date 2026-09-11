# Feature Specification: CFD Avançado com Análise de Fluxo e Gargalos

**Feature Branch**: `018-cfd-advanced-flow-analytics`  
**Created**: 2026-09-11  
**Status**: Completed  
**Input**: Imagem fornecida pelo usuário do **Cumulative Flow Diagram (CFD) com Análise Avançada de Fluxo**:
- Barra superior de navegação (`DASHBOARD`, `CYCLE TIME`, `THROUGHPUT`, `WIP`, `FLOW`, `FORECASTING`).
- Filtros laterais à esquerda:
  - Intervalo de datas: `Requested after` (Data inicial) e `Finished before` (Data final).
  - Seletor de fluxo/etapas: `Workflow is [Engineering]...`.
  - Checkbox de configuração de tempo de ciclo (`Ignore Cycle Time Configuration`).
  - Botão de aplicação `LOAD`.
- Gráfico principal de CFD:
  - Curvas de fluxo cumulativo em camadas empilhadas (bandas de áreas coloridas por etapa).
  - Anotação / tooltip interativo de **WIP vs Lead Time**:
    - **Medição horizontal**: Lead Time / Tempo de permanência no sistema (ex: `11 days` com seta horizontal bidirecional vermelha).
    - **Medição vertical**: WIP / Quantidade de itens em fila/andamento naquela data (ex: `14 items` com linha vertical de corte).
    - Destaque analítico com tag explicativa de gargalo (ex: `A queue column expanding`).
- Sub-gráfico de linha do tempo (*Timeline Scrubber / Zoom Preview*):
  - Mini-gráfico inferior com caixa de seleção de intervalo arrastável para zoom no período.

---

## Clarifications

### Session 2026-09-11
- **Q1: Como você prefere a apresentação do painel lateral de filtros do CFD ('Requested after', 'Finished before', seletor de workflow)?**
  - **A1**: **Painel retrátil colapsável** (drawer à esquerda com botão elegante que recolhe para dar espaço total ao gráfico em telas médias/menores sem espremer o canvas).
- **Q2: Como deve funcionar a anotação visual de gargalo e medição ('11 days' / '14 items' / 'A queue column expanding')?**
  - **A2**: **Inspeção interativa dinâmica**: ao passar o mouse ou clicar em uma data no gráfico, o sistema projeta dinamicamente a linha vertical de corte de WIP (ex: `14 items`), a seta horizontal bidirecional medindo o tempo de ciclo da banda (ex: `11 days`) e badge de alerta em vermelho quando a fila estiver crescendo desproporcionalmente (*queue column expanding*).

---

## 1. Visão Geral & Contexto

O **Metrik** já possui um componente de CFD básico em `CumulativeFlowChart.tsx` (com cálculo cumulativo em `useCfdData.ts`), mas a visualização ainda carece dos recursos analíticos profissionais avançados:
1. **Inspeção Dual de Fluxo (Lei de Little / Análise de Bandas)**:
   - Em qualquer ponto do gráfico de CFD, a distância **vertical** representa a quantidade de itens no sistema (**WIP**).
   - A distância **horizontal** entre a curva de entrada e a curva de saída de uma etapa representa a duração média do ciclo naquele instante (**Lead Time / Cycle Time aproximado**).
2. **Filtro Temporal Dinâmico e Controles de Workflow**:
   - Painel lateral ou retrátil para definir data de início (`Requested after`) e data de fim (`Finished before`), além de filtros de colunas visíveis.
3. **Mini-Timeline Scrubber (Navegador de Período)**:
   - Miniatura do CFD na parte inferior permitindo selecionar e navegar por janelas temporais de forma fluida.
4. **Detecção Visual de Gargalos / Expansão de Filas**:
   - Destaque visual e indicação para colunas cuja banda vertical esteja crescendo desproporcionalmente (*queue column expanding* / gargalo acumulando).

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Inspeção Dual Interativa de Lead Time e WIP no CFD (Priority: P1)

Como gestor de fluxo Kanban, quero clicar ou pousar o mouse sobre as faixas do gráfico de CFD para visualizar a medição horizontal de dias (tempo decorrido) e a medição vertical de cartões (WIP), para que eu possa diagnosticar visualmente se uma etapa está se tornando um gargalo no processo.

**Why this priority**: É o diferencial analítico fundamental de diagramas de fluxo cumulativo avançados, transformando um gráfico cumulativo estático em um instrumento de diagnóstico de gargalos.

**Independent Test**:
- Acessar a aba `CFD / Fluxo` no módulo de Analytics.
- Ao passar o mouse sobre uma data, o gráfico projeta uma linha vertical exibindo o WIP do dia e uma medição horizontal entre a banda de início e conclusão exibindo a duração média em dias.
- Um badge informativo indica o total de itens e a duração calculada.

**Acceptance Scenarios**:
1. **Given** um gráfico de CFD com dados históricos, **When** o usuário passa o cursor sobre uma etapa em uma data específica, **Then** o sistema projeta uma linha vertical indicando o WIP (ex: `14 items`) e uma seta horizontal indicando o tempo de ciclo estimado (ex: `11 days`).
2. **Given** um cenário onde uma etapa intermediária tem sua banda crescendo em relação às demais, **Then** o sistema sinaliza um indicador de atenção de fila em expansão.

---

### User Story 2 - Barra Lateral de Filtros Temporais e Configurações (Priority: P1)

Como usuário analisando métricas de fluxo, quero selecionar um intervalo de datas personalizado (`Data Inicial` e `Data Final`) e filtrar etapas/colunas do board, para focar exatamente no período do projeto ou sprint em análise.

**Why this priority**: Essencial para analisar períodos específicos de entregas ou isolar eventos sazonais sem poluir com o histórico completo.

**Independent Test**:
- Definir datas nos campos de início e fim e clicar em `Filtrar` / `Carregar`.
- O CFD recalcula imediatamente o intervalo projetado no eixo X.

**Acceptance Scenarios**:
1. **Given** os campos de data inicial e final, **When** o usuário altera a data e aplica, **Then** o gráfico recalcula os dados cumulativos no período selecionado.
2. **Given** a seleção de colunas/etapas, **When** o usuário desmarca uma coluna que não deseja no fluxo, **Then** a banda correspondente é omitida e as demais mantêm sua cumulativa correta.

---

### User Story 3 - Timeline Scrubber / Navegador de Zoom Inferior (Priority: P2)

Como usuário com meses de dados históricos, quero um mini-gráfico de linha do tempo na base do CFD com controles de zoom e seleção de intervalo, para navegar de forma rápida entre períodos macro e micro.

**Why this priority**: Idêntico ao componente visível na parte inferior da imagem de referência, garantindo usabilidade em boards maduros com centenas de dias de dados.

**Independent Test**:
- Arrastar as bordas do seletor da mini-timeline inferior e observar o gráfico principal atualizar sua janela temporal com animação suave.

**Acceptance Scenarios**:
1. **Given** o mini-gráfico inferior de timeline, **When** o usuário arrasta o controle de janela, **Then** o gráfico superior amplia a escala correspondente ao trecho delimitado.

---

## 3. Requisitos Funcionais

- **FR-001**: O componente de CFD deve calcular e renderizar a medição de **WIP vertical** (diferença entre o topo e a base da banda ativa) e **Lead Time horizontal** (distância temporal até a curva anterior correspondente) com badges e setas estilizadas.
- **FR-002**: Exibir tag analítica explicativa (ex: `A queue column expanding` / `Gargalo em expansão`) quando a taxa de crescimento da banda exceder o desvio padrão da vazão.
- **FR-003**: Criar painel de filtros analíticos integrado à esquerda ou retrátil com campos de data inicial, data final e seletor de workflow/colunas.
- **FR-004**: Criar mini-timeline scrubber na base do gráfico com visualização em miniatura e alças de redimensionamento do período visível.
- **FR-005**: Atualizar a visualização em `AnalyticsDashboard.tsx` tanto no modo consolidado `Dashboard` quanto na aba focada `CFD / Fluxo` para utilizar o novo CFD enriquecido.
- **FR-006**: Preservar 100% de compatibilidade com a suíte de testes existentes (213 testes) e garantir performance de 60fps na interação com os cursores e mini-timeline.
