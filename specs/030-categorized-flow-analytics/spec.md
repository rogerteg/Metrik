# Feature Specification: Distribuição e Categorização dos Gráficos Analíticos de Fluxo

**Feature Branch**: `030-categorized-flow-analytics`  
**Created**: 2026-09-17  
**Status**: Draft  
**Input**: User description: "Melhoria: Melhore a distribuição dos graficos, aloque em diferentes categorias"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegação Estruturada por Categorias Analíticas de Fluxo (Priority: P1)

Como líder técnico, analista de fluxo ou membro de equipe ágil,  
Quero navegar pelos gráficos e métricas através de abas temáticas categorizadas (*Dashboard*, *Cycle Time*, *Throughput*, *WIP*, *Flow*, *Blockers*, *SLEs*, *Forecasting*),  
Para que as análises de fluxo sejam focadas, intuitivas e livres de poluição visual ou sobrecarga cognitiva de rolagem longa.

**Why this priority**: É o cerne da melhoria solicitada pelo usuário. Permite segmentar visualizações especializadas em categorias analíticas consagradas da ciência do fluxo, proporcionando acesso direto e sem ruído à métrica desejada.

**Independent Test**: Pode ser validado clicando em cada aba de categoria na barra superior do módulo analítico, confirmando que a tela carrega a categoria selecionada e altera a rota/estado visual de forma determinística e reativa.

**Acceptance Scenarios**:

1. **Given** que o usuário está no módulo analítico, **When** seleciona a categoria *Flow*, **Then** a interface exibe com exclusividade o Diagrama de Fluxo Cumulativo (CFD) com controles de intervalo e legendas dinâmicas.
2. **Given** que o usuário está na categoria *Cycle Time*, **When** seleciona o menu suspenso ou alternador de modo, **Then** pode alternar facilmente entre o *Gráfico de Dispersão (Scatter Plot)* e o *Histograma de Frequência*.
3. **Given** que o usuário seleciona a categoria *Dashboard*, **When** a página é renderizada, **Then** é apresentada uma visão executiva consolidada contendo cartões de síntese chave (SLE P85, WIP total, Vazão recente) e visão integrada de alto nível.

---

### User Story 2 - Visão Executiva do Dashboard com Cartões de Síntese e SLEs (Priority: P2)

Como gestor de entrega ou stakeholder executivo,  
Quero visualizar na categoria *Dashboard* e *SLEs* cartões de destaque com indicadores objetivos de nível de serviço (ex.: "15 dias ou menos para concluir 85% dos itens" e "30 itens ativos em WIP"),  
Para compreender rapidamente a saúde e previsibilidade do fluxo da equipe sem necessidade de interpretar gráficos complexos em um primeiro momento.

**Why this priority**: Transforma dados brutos de dispersão e lead time em conclusões acionáveis em linguagem natural e direta para tomadores de decisão.

**Independent Test**: Pode ser testado carregando o *Dashboard* ou aba *SLEs* com um conjunto de dados conhecido e verificando se os cartões resumem os percentis P85/P50 e contagem de WIP em cartões de destaque visual.

**Acceptance Scenarios**:

1. **Given** um quadro com itens concluídos, **When** o usuário acessa o *Dashboard*, **Then** os cartões de destaque exibem o tempo de ciclo no percentil 85% (SLE) com texto explicativo claro.
2. **Given** que o usuário acessa a categoria *SLEs*, **When** visualiza a lista de expectativas acordadas, **Then** o sistema detalha o percentual de conformidade histórica dos cartões entregues frente à expectativa.

---

### User Story 3 - Categorização Especializada de Impedimentos e Dinâmica de Bloqueios (Priority: P2)

Como facilitador ágil ou engenheiro do time,  
Quero acessar a categoria *Blockers* com sub-visões dedicadas (*Blocker Clustering* e *Blocker Dynamics*),  
Para identificar causas raízes recorrentes de impedimento e mensurar o impacto temporal dos bloqueios na vazão do time.

**Why this priority**: Atualmente o sistema possui suporte a tarefas bloqueadas, mas carecia de uma categoria analítica dedicada que diferencie agrupamento por causas versus dinâmica temporal de bloqueios.

**Independent Test**: Pode ser testado criando cartões com bloqueios e motivos variados e verificando na aba *Blockers* o agrupamento por categoria e a linha do tempo de duração de bloqueios.

**Acceptance Scenarios**:

1. **Given** cartões com motivos de bloqueio registrados, **When** o usuário abre *Blockers > Blocker Clustering*, **Then** visualiza a distribuição percentual e contagem por motivo de impedimento.
2. **Given** cartões bloqueados, **When** o usuário abre *Blockers > Blocker Dynamics*, **Then** visualiza a duração acumulada em bloqueio e impacto gerado no lead time.

---

### User Story 4 - Painel Lateral de Configuração do Conjunto de Dados & Filtros Rápidos (Priority: P3)

Como analista de métricas,  
Quero contar com uma gaveta/painel de configuração do conjunto de dados (*Dataset Configuration*) e visualizações rápidas,  
Para ajustar janelas de amostragem (ex.: 14 dias, 30 dias, 90 dias, período customizado) e tipos de cartões analisados sem perder o contexto da categoria selecionada.

**Why this priority**: Fornece flexibilidade analítica para filtrar ruídos sazonais ou isolar iniciativas específicas.

**Independent Test**: Pode ser testado alterando o intervalo de datas na configuração e verificando que todas as categorias respeitam a nova janela amostral.

**Acceptance Scenarios**:

1. **Given** uma categoria analítica ativa, **When** o usuário ajusta a janela do conjunto de dados para "Últimos 30 dias", **Then** as métricas e gráficos da categoria são recalculados instantaneamente.

---

### Edge Cases

- **Ausência de dados históricos suficientes**: Se o quadro tiver 0 ou poucas tarefas concluídas (< 5), os cartões de SLE e percentis devem exibir estado vazio amigável informando a necessidade de mais dados para cálculo estatístico válido.
- **Transição rápida entre abas**: Alternar rapidamente entre categorias pesadas (ex.: Monte Carlo com 10.000 iterações e CFD de 90 dias) não deve provocar vazamento de memória ou renderizações inconsistentes.
- **Preservação de filtros ao mudar de categoria**: Configurações de período ou squads selecionados no painel devem ser preservadas ao navegar entre *Cycle Time*, *Throughput* e *Flow*.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma barra de navegação categorizada no topo do módulo analítico contendo as categorias: *Dashboard*, *Cycle Time*, *Throughput*, *WIP*, *Flow*, *Blockers*, *SLEs* e *Forecasting*.
- **FR-002**: A categoria *Dashboard* DEVE exibir cartões de síntese executiva (*Metric Summary Cards*) destacando: Tempo de Ciclo no percentil acordado (SLE P85), total de itens ativos em WIP, Vazão da última semana e taxa de impedimentos.
- **FR-003**: A categoria *Cycle Time* DEVE permitir alternância entre *Scatter Plot* (gráfico de dispersão com percentis P50, P70, P85, P95) e *Histograma de Frequência* de tempo de ciclo.
- **FR-004**: A categoria *Throughput* DEVE exibir a taxa de entrega diária/semanal e o histograma de distribuição de vazão.
- **FR-005**: A categoria *WIP* DEVE apresentar o gráfico de envelhecimento de trabalho em progresso (*WIP Aging*) com segmentação visual por coluna e limiares de alerta de estagnação.
- **FR-006**: A categoria *Flow* DEVE exibir o Diagrama de Fluxo Cumulativo (*Cumulative Flow Diagram - CFD*) com controle de datas, cálculo de WIP aproximado e tempo de ciclo médio.
- **FR-007**: A categoria *Blockers* DEVE fornecer visualizações para:
  1. *Blocker Clustering*: Agrupamento de tarefas por motivo ou tag de impedimento.
  2. *Blocker Dynamics*: Duração acumulada e impacto temporal nos cartões.
- **FR-008**: A categoria *SLEs* DEVE calcular e exibir o percentual de conformidade das entregas da equipe em relação à Expectativa de Nível de Serviço (ex: % entregue dentro do tempo de SLE).
- **FR-009**: A categoria *Forecasting* DEVE integrar a Simulação de Monte Carlo com cálculo probabilístico de entregas para intervalos de confiança de 50%, 85% e 95%.
- **FR-010**: O sistema DEVE disponibilizar painel retrátil ou gaveta de configuração de dados (*Dataset Configuration*) com seleção de período (14d, 30d, 90d ou customizado).
- **FR-011**: O sistema DEVE preservar estrita conformidade com o Princípio VII da Constituição (Brand Independence), utilizando terminologia científica e canônica (*Cumulative Flow Diagram*, *Cycle Time Scatter Plot*, *Service Level Expectations*, *WIP Aging*, *Monte Carlo Simulation*) sem qualquer vazamento de nomes de marcas de terceiros.
- **FR-012**: O sistema DEVE operar integralmente em modo Local-First (Princípio VIII da Constituição), calculando métricas client-side sobre os dados do armazenamento local e sincronizando com o Supabase quando conectado.

---

### Key Entities

- **`AnalyticsCategory`**: Enum/tipo representativo das categorias da barra de navegação (`'dashboard' | 'cycle-time' | 'throughput' | 'wip' | 'flow' | 'blockers' | 'sles' | 'forecasting'`).
- **`ServiceLevelExpectation (SLE)`**: Estrutura contendo o percentil de referência (ex.: 85%), o tempo limite em dias/horas, e a taxa de conformidade real observada na amostra.
- **`BlockerAnalyticsData`**: Agrupamento estruturado contendo motivos de bloqueio, contagem de ocorrências, tempo médio retido em bloqueio e impacto no lead time.
- **`DatasetFilterConfig`**: Configuração ativa do escopo de dados (janela temporal em dias, data inicial, data final, tags ou tipos de cartões considerados).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O usuário consegue transitar entre qualquer uma das 8 categorias analíticas com tempo de resposta visual imediato (< 100ms).
- **SC-002**: 100% dos gráficos analíticos existentes no sistema são redistribuídos em suas categorias temáticas correspondentes, eliminando rolagens verticais desnecessárias na visão padrão.
- **SC-003**: Os cartões de síntese executiva do *Dashboard* e *SLEs* apresentam valores calculados de forma determinística e com 100% de consistência em relação aos dados brutos do quadro.
- **SC-004**: O conjunto de dados filtrado no *Dataset Configuration* sincroniza de forma unificada entre todas as categorias selecionadas durante a mesma sessão.
- **SC-005**: 100% dos testes da suíte automatizada (`npm run test`) e build de produção (`npm run build`) continuam passando com zero erros e zero advertências de tipagem.

---

## Assumptions

- Os cálculos de percentis continuam utilizando o método padronizado NIST (Nearest Rank / Linear Interpolation) já estabelecido nas especificações 017 e 018.
- A categorização não altera a estrutura dos dados persistidos no `localStorage` ou no Supabase, atuando na camada de apresentação, agregação analítica e experiência do usuário.
- Usuários com papel `guest` (TBAC) possuem acesso de leitura total às categorias analíticas do quadro acessível.
