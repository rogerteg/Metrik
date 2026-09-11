# Feature Specification: Cycle Time Scatter Plot Avançado com Percentis e Navegação Analítica (ActionableAgile / Businessmap)

**Feature Branch**: `017-cycle-time-scatter-plot-percentiles`  
**Created**: 2026-09-11  
**Status**: Completed  
**Input**: Imagem fornecida pelo usuário inspirada na ferramenta de ponta **ActionableAgile / Businessmap Analytics**:
- Navegação de abas analíticas no topo (`Dashboard`, `Cycle Time` [dropdown: *Scatter Plot*, *Histogram*, *Heat Map*], `Throughput`, `WIP`, `Flow`, `Blockers`, `SLEs`, `Forecasting`).
- Gráfico principal: **Cycle Time Scatter Plot** com linhas horizontais de **Percentis (50%, 85%, 95%)** calculados estatisticamente sobre as tarefas concluídas.
- Painel lateral de controles analíticos configuráveis (*Controls for this Chart*: Percentiles toggles, Dot Colors, Blocked Items highlight, Summary Statistics).
- Barra de filtros de dataset à esquerda (Intervalo de datas, seleção de workflow / etapas).
- Sub-gráfico de linha do tempo inferior para navegação de períodos (*timeline scrubber / overview*).

---

## Clarifications

### Session 2026-09-11
- **Q1: Quais percentis de Cycle Time estarão disponíveis no Scatter Plot?**
  - **A1**: **Percentis padrão da indústria ágil: 50%, 85% e 95%** com toggles individuais no painel lateral para ligar/desligar cada linha no gráfico com suas respectivas cores e legendas.
- **Q2: Como o painel de controles do gráfico ('Controls for this Chart') deve se comportar?**
  - **A2**: **Painel lateral direito retrátil** com botão elegante de alternância/ícone (abre e fecha suavemente sem espremer o gráfico em telas menores ou médias).
- **Q3: Onde a barra de navegação de abas analíticas (Dashboard, Cycle Time, Throughput...) deve ficar?**
  - **A3**: **Integrada dentro da visualização 'Analytics'** (`AnalyticsDashboard.tsx`). Ao alternar para o modo Analytics, o usuário visualiza a barra de abas no topo permitindo navegar entre a visão geral (`Dashboard`) e as visões aprofundadas (`Cycle Time`, `Throughput`, `CFD / Fluxo`, etc.).

---

## 1. Visão Geral & Contexto

O **Metrik** possui atualmente um módulo básico de gráficos analíticos em `AnalyticsDashboard.tsx` (com Throughput, CFD e um Scatter Plot simplificado de 14 dias). 

A imagem de referência enviada pelo usuário apresenta o padrão internacional de **Flow Analytics (ActionableAgile / Daniel Vacanti)** adotado por ferramentas líderes de mercado como Businessmap e Jira Align:
1. **Cycle Time Scatter Plot com Percentis Matemáticos Reais**:
   - Cada ponto representa uma tarefa individual concluída (`X = Data de Conclusão`, `Y = Cycle Time em Dias`).
   - Linhas tracejadas pontilhadas horizontais representando os percentis do sistema:
     - **50º percentil** (Mediana: 50% das tarefas terminam em até X dias).
     - **85º percentil** (Compromisso de Nível de Serviço / SLE típico: 85% de confiança).
     - **95º percentil** (Quase certeza de entrega / cauda longa de variabilidade).
2. **Navegação Analítica Avançada por Abas**:
   - Barra superior com seções focadas: `Dashboard Geral`, `Cycle Time` (com menu para *Scatter Plot*), `Throughput`, `CFD / Flow` e `Bloqueios`.
3. **Controles Dinâmicos e Filtros do Gráfico**:
   - Painel de controle para ligar/desligar a visualização das linhas de percentis (50%, 85%, 95%).
   - Destaque visual diferenciado para itens que sofreram bloqueio durante o ciclo (pontos vermelhos ou com anel de alerta).
   - Tooltip rico ao passar o mouse sobre cada ponto exibindo título, data de início, conclusão, cycle time e se houve bloqueio.

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Visualização do Scatter Plot com Linhas de Percentis Estatísticos (Priority: P1)

Como gestor ágil ou engenheiro utilizando o Metrik, quero visualizar no gráfico de Cycle Time as linhas horizontais de percentis (50%, 85% e 95%), para que eu possa avaliar a previsibilidade do time e estabelecer Service Level Expectations (SLE) realistas baseados em dados históricos.

**Why this priority**: É o valor central da métrica de Cycle Time no Kanban moderno. Sem percentis, um gráfico de dispersão é apenas uma nuvem de pontos sem direcionamento estatístico.

**Independent Test**:
- Cadastrar ou carregar tarefas concluídas com diferentes tempos de ciclo (ex: 2d, 3d, 5d, 10d, 15d).
- Acessar o gráfico e verificar se as 3 linhas tracejadas de percentis (50%, 85%, 95%) são calculadas e renderizadas na altura correta do eixo Y, com rótulos visuais legíveis (`50%: Xd`, `85%: Yd`, `95%: Zd`).

**Acceptance Scenarios**:
1. **Given** um conjunto de tarefas concluídas, **When** o usuário visualiza o Scatter Plot, **Then** o sistema calcula ordenadamente os tempos de ciclo e projeta linhas horizontais horizontais nos percentis 50%, 85% e 95%.
2. **Given** um gráfico de dispersão com dados, **When** o usuário passa o mouse sobre uma linha de percentil, **Then** uma indicação clara do valor exato em dias e o significado do percentil é exibida.
3. **Given** um cenário sem tarefas concluídas suficientes, **When** o gráfico renderiza, **Then** exibe mensagem instrucional limpa sem quebrar a interface ou apresentar `NaN`.

---

### User Story 2 - Barra de Navegação de Métricas & Sub-Menu Cycle Time (Priority: P1)

Como usuário navegando no módulo de Analytics do Metrik, quero uma barra de abas analíticas (`Dashboard`, `Cycle Time` com dropdown de modos, `Throughput`, `CFD / Flow`, `Bloqueios`), para poder focar especificamente na análise desejada com espaço maximizado de tela.

**Why this priority**: Acomoda a crescente sofisticação analítica do Metrik em um layout limpo, exatamente como na ferramenta de referência.

**Independent Test**:
- No módulo de Analytics, clicar nas abas do topo:
  - `Dashboard`: visão consolidada de todos os gráficos.
  - `Cycle Time`: exibe o Scatter Plot expandido em tela cheia com painel de controles.
  - `Throughput`: foca no histograma de vazão diária/semanal.
  - `Fluxo (CFD)`: foca no Diagrama de Fluxo Cumulativo com suas ondas coloridas.

**Acceptance Scenarios**:
1. **Given** o usuário no Analytics, **When** clica na aba `Cycle Time`, **Then** a visualização principal do Scatter Plot é apresentada com canvas amplo e controles dedicados.
2. **Given** a aba `Cycle Time`, **When** o usuário interage com o dropdown, **Then** pode alternar entre *Scatter Plot* e os demais modos analíticos.

---

### User Story 3 - Painel de Controles e Destaque de Itens Bloqueados (Priority: P2)

Como usuário analisando variabilidade de fluxo, quero um painel lateral de controles rápidos (*Controls for this Chart*) para alternar a visibilidade dos percentis e destacar itens que tiveram bloqueios, para identificar se os pontos fora da curva foram causados por impedimentos.

**Why this priority**: Permite responder imediatamente por que certos itens ficaram acima do percentil de 85% ou 95%.

**Independent Test**:
- No painel lateral do gráfico, alternar os checkboxes dos percentis (50%, 85%, 95%) e verificar as linhas sumindo e reaparecendo.
- Ativar o toggle "Destacar Itens Bloqueados" e verificar se as tarefas com `blockedMs > 0` ou `blocked = true` mudam para cor vermelha/alerta.

**Acceptance Scenarios**:
1. **Given** o painel de controles lateral, **When** o usuário desmarca a opção do 95º percentil, **Then** a respectiva linha é ocultada instantaneamente.
2. **Given** tarefas concluídas que sofreram bloqueios, **When** o filtro de bloqueados é ativado, **Then** esses pontos recebem diferenciação visual evidente (borda vermelha ou cor de alerta).
3. **Given** um ponto de dispersão no gráfico, **When** o usuário pousa o cursor sobre ele, **Then** um tooltip rico exibe o título da tarefa, o tempo de ciclo, data de início, conclusão e motivo de eventual bloqueio.

---

## 3. Requisitos Funcionais

- **FR-001**: Implementar utilitário de cálculo estatístico de percentis (`calculatePercentile(values: number[], p: number): number`) com interpolação linear padrão (Nearest Rank ou Linear Interpolation per NIST/ActionableAgile).
- **FR-002**: O `CycleTimeScatterPlot` deve renderizar pontos (`<circle>`) correspondentes a cada tarefa concluída com escala X temporal dinâmica (data de conclusão) e escala Y em dias de tempo de ciclo.
- **FR-003**: Renderizar linhas horizontais de percentil para 50%, 85% e 95%, estilizadas com traço pontilhado (`stroke-dasharray`), cores harmoniosas de alerta (verde/azul suave para 50%, amarelo/âmbar para 85%, vermelho/coral suave para 95%) e rótulos fixos à direita do gráfico.
- **FR-004**: Criar componente de barra superior de navegação analítica (`AnalyticsNavHeader`) com as seções:
  - `Dashboard` (Visão Geral)
  - `Cycle Time` (Menu suspenso com *Scatter Plot*)
  - `Throughput`
  - `CFD / Fluxo`
  - `Bloqueios`
- **FR-005**: Criar painel retrátil ou lateral de controles analíticos (`ChartControlsPanel`) com opções:
  - Percentis: toggles independentes para 50%, 85% e 95%.
  - Destaque de Bloqueios: checkbox para colorir de vermelho tarefas que tiveram impedimentos.
  - Janela temporal: seletor de período (últimos 14 dias, 30 dias, 60 dias ou todo o histórico).
- **FR-006**: Tooltip interativo flutuante ou SVG `<title>` enriquecido exibindo:
  - Título da tarefa e ID.
  - Cycle Time exato em dias.
  - Data de início (`startedAt`) e conclusão (`completedAt`).
  - Histórico de bloqueio (`totalBlockedMs` e motivo se aplicável).
- **FR-007**: Manter conformidade estrita com as regras de negócio vigentes (todas as tarefas concluídas identificadas pela coluna com categoria `done` ou flag `completedAt`).
- **FR-008**: Manter 100% de retrocompatibilidade com a suíte de testes unitários existente (203 testes).

---

## 4. Requisitos Não-Funcionais & Estéticos

- **Estética & Design System**:
  - Seguir rigorosamente o padrão visual dark slate moderno do Metrik (`#0b0f19`, `#121a2d`, `#1e293b`).
  - Linhas de percentis discretas com tipografia monospace nítida (`JetBrains Mono`).
  - Painel de controles lateral com visual clean, acordeões compactos e switches/checkboxes ergonômicos.
- **Performance**:
  - Renderização SVG vetorial eficiente capaz de plotar até 1.000 pontos sem travamentos.
- **Acessibilidade**:
  - Elementos interativos navegáveis via teclado com `aria-label` apropriados e contrastes adequados.

---

## 5. Critérios de Aceitação da Especificação

1. O módulo de Analytics apresenta barra de navegação com as abas e o sub-menu do Cycle Time.
2. O Scatter Plot plota as tarefas concluídas e calcula corretamente os percentis 50%, 85% e 95%.
3. O usuário pode ligar e desligar a exibição das linhas de percentis através do painel de controles.
4. Pontos de tarefas bloqueadas podem ser destacados visualmente.
5. Suíte de testes automatizados com novos testes cobrindo o cálculo de percentis e renderização do gráfico, mantendo 100% de sucesso.
6. Build de produção compilando sem erros (`npm run build`).
