# Feature Specification: 054 — Previsibilidade Dinâmica & Alertas de SLE (Service Level Expectation)

**Feature Branch**: `054-dynamic-sle-predictive-alerts`  
**Created**: 2026-11-03  
**Status**: Implemented & Verified (2026-11-03)  
**Input**: User description: "Previsibilidade Dinâmica & Alertas de SLE (Service Level Expectation): Sinalização preditiva automática no cartão antes que ele estoure os percentis 50%, 85% ou 95% de Cycle Time histórico."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Badges Preditivos de Risco de SLE nos Cartões do Quadro (Priority: P1) 🎯 MVP

Como membro de squad trabalhando no quadro Kanban,  
quero bater o olho em qualquer cartão em andamento e ver imediatamente um indicador preditivo de saúde de entrega (Normal, Atenção P50, Risco P85, Crítico P95),  
para agir proativamente antes que o item quebre a expectativa de nível de serviço histórica do time.

**Why this priority**: Entrega o valor central da funcionalidade imediatamente no fluxo diário de trabalho, transformando dados analíticos históricos estáticos em sinalização acionável no momento presente.

**Independent Test**: Criar um quadro com tarefas concluídas estabelecendo percentis históricos (ex.: P50 = 2d, P85 = 4d, P95 = 7d). Criar um cartão em progresso com envelhecimento de 3 dias e verificar a renderização automática do badge "Atenção (P50 Excedido)", e com 5 dias "Risco SLE (P85 Excedido)".

**Acceptance Scenarios**:

1. **Given** um quadro com histórico de entregas onde P50 = 3 dias e P85 = 6 dias,  
   **When** um cartão na coluna "Em Desenvolvimento" atinge 3.2 dias de envelhecimento (WIP Aging),  
   **Then** o cartão deve exibir um badge sutil na cor amarela indicando que 50% das entregas históricas ocorrem mais rápido que o tempo atual deste item.

2. **Given** um cartão em progresso cujo tempo decorrido ultrapassa o percentil de 85% (SLE acordado da equipe),  
   **When** o cartão é visualizado na coluna ativa,  
   **Then** o cartão deve exibir um badge na cor laranja de alerta com a indicação visual de que a expectativa de nível de serviço foi rompida.

3. **Given** um cartão em progresso cujo tempo decorrido ultrapassa o percentil 95% histórico (cauda longa estatística),  
   **When** renderizado no quadro,  
   **Then** o cartão deve exibir um badge na cor vermelha com pulso ou destaque de item crítico de cauda longa.

4. **Given** um cartão localizado em colunas da categoria `done` (concluído) ou `todo` (não iniciado),  
   **When** renderizado no quadro,  
   **Then** ele NÃO deve exibir o badge preditivo de SLE em andamento, mantendo o visual limpo.

---

### User Story 2 - Popover / Tooltip Analítico de Previsibilidade ao Passar o Mouse (Priority: P2)

Como líder técnico ou membro da equipe inspecionando um item em risco,  
quero passar o cursor ou tocar no indicador preditivo de SLE do cartão e ver um resumo contextual com barra de progresso dos percentis,  
para compreender exatamente quantos dias faltam para o próximo marco estatístico ou o quanto o item já excedeu o esperado.

**Why this priority**: Concede clareza probabilística à equipe sem poluir o visual do cartão, explicando o "porquê" do alerta de forma transparente e educativa.

**Independent Test**: Passar o mouse sobre o badge de alerta preditivo de um cartão com 4.5 dias de aging e verificar o tooltip contendo: tempo atual (4.5d), régua visual P50/P85/P95, e distância para a próxima faixa percentil.

**Acceptance Scenarios**:

1. **Given** um cartão com badge de SLE,  
   **When** o usuário posiciona o cursor sobre o badge,  
   **Then** deve ser exibido um popover flutuante contendo:
     - Dias em progresso (Aging formatado, ex.: 4,2 dias).
     - Régua estatística com os marcos de P50, P85 e P95 da equipe.
     - Probabilidade histórica restante de entrega dentro do SLE acordado.

2. **Given** que o usuário retira o cursor do badge,  
   **When** decorre o tempo de tolerância (150ms),  
   **Then** o popover analítico deve ser fechado suavemente.

---

### User Story 3 - Filtro de Foco Rápido em Itens com Risco de SLE (Priority: P3)

Como facilitador de Daily Standup ou Agile Coach,  
quero filtrar rapidamente o quadro Kanban exibindo apenas os itens que atingiram ou romperam os limites de P50, P85 ou P95,  
para direcionar a conversa da equipe exclusivamente aos itens que necessitam de desbloqueio ou esforço conjunto (*stop starting, start finishing*).

**Why this priority**: Facilita cerimônias e reuniões diárias de fluxo ágil focando nas exceções e impedimentos antes que os prazos colapsem.

**Independent Test**: Clicar no botão/chip de filtro rápido "Em Risco SLE" na barra de filtros e verificar que apenas os cartões em status de Atenção (P50+), Risco (P85+) ou Crítico (P95+) permanecem visíveis nas colunas ativas.

**Acceptance Scenarios**:

1. **Given** um quadro com 10 cartões em progresso (6 dentro do padrão, 2 em P50 e 2 em P85),  
   **When** o usuário ativa o filtro "Risco de SLE",  
   **Then** os 4 cartões com alerta preditivo permanecem visíveis e os 6 itens saudáveis são temporariamente ocultados.

2. **Given** o filtro de SLE ativo,  
   **When** o usuário clica novamente para desativar ou limpa os filtros,  
   **Then** todos os itens do quadro voltam a ser exibidos normalmente.

---

### User Story 4 - Preferências de Sensibilidade de SLE do Quadro (Priority: P4)

Como administrador do quadro,  
quero escolher nas configurações do quadro se o cálculo de SLE preditivo usará o percentil observado automaticamente (P85) ou uma meta estipulada em dias fixos, bem como habilitar/desabilitar os badges de P50,  
para adaptar a sensibilidade dos alertas ao ritmo e maturidade do squad.

**Why this priority**: Permite flexibilidade operacional para equipes com acordos explícitos contratados ou squads em estágio inicial de maturidade.

**Independent Test**: Alterar a configuração de SLE do quadro para meta de 5 dias. Verificar que cartões com envelhecimento recalculam seus alertas baseados na meta configurada.

**Acceptance Scenarios**:

1. **Given** as preferências de políticas do quadro,  
   **When** o administrador seleciona "Meta estipulada" de 5 dias para o SLE,  
   **Then** o ponto de corte do alerta de Risco de SLE passa a considerar 5 dias em vez do percentil flutuante observado.

2. **Given** que o administrador desmarca a exibição de badges preventivos de P50,  
   **When** o quadro é renderizado,  
   **Then** itens entre P50 e P85 não exibem badge amarelo, surgindo apenas alertas a partir de P85 (laranja/vermelho).

---

## Edge Cases

- **Amostra Histórica Insuficiente**: Se o quadro possui menos de 5 tarefas concluídas, o sistema não possui base amostral estatisticamente válida para calcular P50/P85/P95. O sistema deve emitir badge neutro com tooltip: "Amostra insuficiente para cálculo de SLE (< 5 itens concluídos)" sem disparar alarmes falsos.
- **Tarefas Paradas em Colunas Buffer (Wait Columns)**: Se o quadro utiliza colunas do tipo fila/espera (ex.: "Pronto para Teste"), o aging continua acumulando, pois o cliente aguarda o tempo total de ciclo. O alerta de SLE deve refletir o tempo total desde o início (`startedAt`).
- **Cartões Bloqueados**: Se um cartão está bloqueado há dias, o badge de SLE deve coexistir harmoniosamente com o badge de bloqueio (`blocked`), destacando que o impedimento é a causa raiz da ameaça ao SLE.
- **Transição de Status Instantânea**: Quando um cartão é arrastado para a coluna `done`, o badge preditivo deve ser removido instantaneamente da renderização, pois o item agora possui tempo de ciclo definitivo e não mais aging preditivo.
- **Tempo Decorrido Negativo ou Datas Futuras**: Se `startedAt` contiver um timestamp corrompido no futuro, o cálculo defensivo deve normalizar o aging para 0 dias sem lançar exceções.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE calcular dinamicamente os percentis estatísticos de tempo de ciclo (P50, P85, P95) com base no histórico de tarefas concluídas do quadro ativo.
- **FR-002**: O sistema DEVE classificar o risco de SLE de cada cartão em andamento (categoria `in_progress`) nos seguintes níveis determinísticos:
  - `normal`: Aging < P50.
  - `warning_p50`: P50 ≤ Aging < P85 (tempo mediano ultrapassado).
  - `risk_p85`: P85 ≤ Aging < P95 (Expectativa de Nível de Serviço rompida).
  - `critical_p95`: Aging ≥ P95 (cauda longa extrema, maior que 95% do histórico).
- **FR-003**: O sistema DEVE renderizar badges visuais no cartão Kanban (`BoardTask.tsx`) correspondentes ao nível de risco calculado, respeitando a paleta e os tokens do Metrik Design System.
- **FR-004**: O sistema DEVE disponibilizar um popover informativo acionável ao passar o mouse ou focar o badge de SLE, exibindo a régua comparativa e os valores numéricos em dias.
- **FR-005**: O sistema DEVE suportar filtro rápido de cartões com alerta de SLE na barra de filtros do quadro (`FilterBar.tsx`).
- **FR-006**: O sistema DEVE permitir ao usuário definir opcionalmente uma meta de SLE estipulada em dias nas preferências do quadro, que substitui o P85 observado como limiar de conformidade.
- **FR-007**: O sistema DEVE operar de forma 100% Local-First e cliente-side, calculando os percentis em memória com latência inferior a 5ms para até 1000 cartões.
- **FR-008**: O sistema DEVE tratar graciosamente quadros sem histórico de tarefas concluídas (amostra < 5), sem emitir alarmes errôneos ou quebrar o layout.
- **FR-009**: O sistema DEVE atualizar os alertas preditivos em tempo real durante a sessão, bem como a cada minuto através do ciclo de sincronização temporal.
- **FR-010**: O sistema DEVE manter estrita conformidade com a identidade de marca (Constituição VII), utilizando terminologia científica padronizada (*Service Level Expectation*, *Percentil P85*, *Cycle Time*, *WIP Aging*) e zero marcas de terceiros.

---

### Key Entities

- **`SleThresholdConfig`**: Configuração do quadro para SLE contendo `targetPercentile: number` (padrão 85), `customTargetDays?: number | null`, `enableP50Alert: boolean` e `enableP95Alert: boolean`.
- **`CardSlePrediction`**: Objeto derivado contendo `taskId`, `wipAgingDays`, `p50Days`, `p85Days`, `p95Days`, `riskLevel: 'normal' | 'warning_p50' | 'risk_p85' | 'critical_p95' | 'insufficient_data'`, e `daysToBreach: number`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O cálculo de previsibilidade e classificação de risco de SLE para todos os cartões ativos de um quadro deve ser executado em **menos de 3 milissegundos** em navegadores modernos.
- **SC-002**: Equipes conseguem identificar visualmente 100% dos cartões com tempo de ciclo em risco de estouro diretamente no quadro em **menos de 1 segundo** após carregar a página.
- **SC-003**: Zero regressão nos 143 arquivos de teste e mais de 880 testes existentes do projeto.
- **SC-004**: Nova cobertura de testes unitários para a lógica de previsão e componentes de badge superior a 90%.
- **SC-005**: O código deve manter a estrita conformidade constitucional (módulos com menos de 400 linhas, TypeScript estrito sem `any`, linter e formatação Prettier 100% limpos).

---

## Assumptions

- O cálculo de envelhecimento (WIP Aging) utiliza a data de início da tarefa (`startedAt`) ou, na sua ausência, a data de criação (`createdAt`).
- O percentil 85% (P85) é a convenção canônica da indústria Lean/Kanban como ponto de corte primário para SLE.
- A amostra mínima de tarefas concluídas para calcular percentis com significância estatística mínima é de 5 itens.
- As preferências de visualização e metas de SLE são salvas localmente no `localStorage` por quadro (`metrik_sle_config_${boardId}`).

