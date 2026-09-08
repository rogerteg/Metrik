# Feature Specification: 002-wip-limits-and-flow-metrics

**Feature Branch**: `002-wip-limits-and-flow-metrics`  
**Created**: 2026-09-08  
**Status**: Draft  
**Input**: User description: "Feature 002: Limites de WIP e Métricas de Fluxo (Lead Time e Cycle Time)"

---

## 🎯 Visão Geral do Produto

O **Metrik** tem como essência a visibilidade e otimização do fluxo de trabalho contínuo, inspirado nas melhores práticas do *Kanbanize* e no Método Kanban clássico (David J. Anderson).

Esta especificação introduz duas capacidades fundamentais de gestão ágil sobre o quadro existente:
1. **Limites de Trabalho em Progresso (WIP Limits)**: Capacidade de estipular limites máximos de tarefas simultâneas para colunas intermediárias (`In Progress` e `Blocked`), com sinalização visual imediata de alerta/sobrecarga para prevenir gargalos.
2. **Métricas de Fluxo Essenciais (Lead Time e Cycle Time)**: Rastreamento automático de timestamps de transição entre colunas para calcular e exibir o Lead Time (criação ➔ conclusão) e o Cycle Time (início da execução ➔ conclusão), tanto individualmente em cada cartão concluído quanto em um painel sumarizado no cabeçalho do quadro.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configuração e Sinalização de Limites de WIP (Priority: P1) 🎯 MVP

Como líder de equipe ou usuário do Metrik, quero definir um limite máximo de trabalho em progresso (WIP) para as colunas intermediárias e ver alertas visuais claros quando o limite for atingido ou ultrapassado, para poder aplicar o princípio ágil de "parar de começar e começar a terminar".

**Why this priority**: O controle de WIP é a regra definidora do Kanban autêntico. Sem WIP limits, o quadro é apenas um "todo list" disfarçado e não combate gargalos de fluxo.

**Independent Test**: Configurar o limite da coluna `In Progress` para 2 itens. Mover 3 tarefas para `In Progress`. Verificar que o contador passa a exibir `3/2` com estilo visual de sobrecarga (borda âmbar/pulsante e badge de alerta).

**Acceptance Scenarios**:
1. **Given** que a coluna `In Progress` possui limite WIP de 3 tarefas e atualmente tem 2 tarefas, **When** o usuário visualiza o cabeçalho da coluna, **Then** o contador exibe `2/3` em tom neutro/normal.
2. **Given** que a coluna `In Progress` possui 3 tarefas (limite atingido), **When** uma 4ª tarefa é movida para ela, **Then** a coluna aceita o movimento (soft limit defensivo), mas o cabeçalho e o contador mudam instantaneamente para estado de alerta de sobrecarga (`4/3 ⚠️` com borda e badge âmbar).
3. **Given** que o usuário clica diretamente no contador/badge de limite da coluna, **When** um campo numérico inline é exibido e o usuário digita um novo limite positivo (ou deixa em branco para sem limite) e confirma via Enter ou blur, **Then** o novo limite é salvo imediatamente no `localStorage` e a coluna reavalia seu estado de sobrecarga em tempo real.

---

### User Story 2 - Rastreamento e Exibição de Lead Time e Cycle Time por Cartão (Priority: P1) 🎯 MVP

Como desenvolvedor ou gestor, quero que o sistema registre automaticamente quando uma tarefa foi criada, quando entrou em execução (`In Progress`) e quando foi concluída (`Completed`), exibindo o Lead Time e Cycle Time no cartão, para entender quanto tempo cada entrega levou.

**Why this priority**: Fornece feedback objetivo e imediato sobre a velocidade de entrega de cada item de trabalho sem exigir que o usuário marque tempos manualmente.

**Independent Test**: Criar uma tarefa (registrando `createdAt`), movê-la para `In Progress` (registrando `startedAt`) e em seguida movê-la para `Completed` (registrando `completedAt`). Inspecionar o cartão em `Completed` e comprovar a presença das badges com o tempo legível de Lead Time e Cycle Time.

**Acceptance Scenarios**:
1. **Given** uma tarefa criada às 10:00 e movida para `In Progress` às 10:15, **When** ela é movida para `Completed` às 11:00, **Then** o cartão em `Completed` exibe:
   - `Lead Time: 1h 00m` (das 10:00 às 11:00)
   - `Cycle Time: 45m` (das 10:15 às 11:00)
2. **Given** uma tarefa concluída que é reaberta (movida de volta para `In Progress` ou `Todo`), **When** seu status muda, **Then** o timestamp `completedAt` é limpo e as métricas de conclusão são reajustadas de forma idempotente.

---

### User Story 3 - Barra de Métricas de Fluxo do Quadro (Priority: P2)

Como usuário, quero visualizar uma barra de métricas consolidada no topo do quadro exibindo as médias de Lead Time, Cycle Time e Throughput (total concluído), para avaliar a eficiência global do fluxo de trabalho.

**Why this priority**: Permite uma tomada de decisão macro baseada em dados históricos reais acumulados na sessão local.

**Independent Test**: Com tarefas concluídas no quadro, inspecionar a barra de métricas acima do grid e verificar o cálculo correto da média de Lead Time e Cycle Time de todas as tarefas da coluna `Completed`.

**Acceptance Scenarios**:
1. **Given** que o quadro possui 3 tarefas concluídas com Cycle Times de 10m, 20m e 30m, **When** o usuário consulta a barra de métricas do quadro, **Then** a métrica `Cycle Time Médio` exibe `20m`.
2. **Given** que nenhuma tarefa foi concluída ainda, **When** o usuário consulta a barra de métricas, **Then** os indicadores exibem `-` (placeholder elegante sem NaN ou erros de divisão por zero).

---

### Edge Cases

- **Transição Direta sem Passar por `In Progress`**: Se uma tarefa for movida diretamente de `Todo` para `Completed`, o sistema deve definir `startedAt` igual ao momento da conclusão ou usar `createdAt` como fallback para evitar `Cycle Time` nulo ou negativo.
- **Tarefas do Seed Inicial**: As tarefas existentes no seed sem timestamps de transição antigos devem exibir dados temporais simulados plausíveis ou indicar cálculo a partir da primeira movimentação.
- **Formatação de Durações Variadas**: O formatador de tempo deve lidar graciosamente com durações em segundos (`< 1m`), minutos (`15m`), horas (`2h 30m`) e dias (`3d 4h`), mantendo a leitura compacta.
- **WIP Limit com Valor Zero ou Negativo**: O input de limite WIP só deve aceitar inteiros positivos (>= 1) ou valor vazio/nulo (sem limite). Valores inválidos devem ser revertidos defensivamente.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir a configuração opcional de um limite de WIP (*Work in Progress*) para cada coluna individualmente. Por padrão inicial de demonstração (seed), `In Progress` inicia com limite 3 e `Blocked` com limite 2, enquanto `Todo` e `Completed` iniciam sem limite.
- **FR-002**: Se uma coluna possuir limite de WIP configurado, o cabeçalho DEVE exibir a razão `[tarefas_atuais]/[limite_wip]` (ex: `2/3`).
- **FR-003**: Quando o número de tarefas em uma coluna exceder seu limite de WIP, a coluna DEVE exibir estado visual de sobrecarga (estilo âmbar de alerta na borda e no contador).
- **FR-004**: O sistema DEVE adotar a política de *Soft WIP Limit*: não proibir o movimento de cartões, mas sinalizar enfaticamente a violação para que o time reaja.
- **FR-005**: Cada tarefa DEVE armazenar os seguintes timestamps no modelo de dados:
  - `createdAt` (ISO 8601): momento da criação do cartão.
  - `startedAt` (ISO 8601 opcional): momento em que a tarefa entrou pela primeira vez na coluna `In Progress`.
  - `completedAt` (ISO 8601 opcional): momento em que a tarefa entrou na coluna `Completed`.
- **FR-006**: Ao mover um cartão para a coluna `Completed`, o sistema DEVE registrar automaticamente `completedAt = new Date().toISOString()`.
- **FR-007**: Ao mover um cartão para `In Progress` pela primeira vez, o sistema DEVE registrar `startedAt = new Date().toISOString()` caso ainda não exista.
- **FR-008**: Ao mover um cartão concluído de volta para uma coluna anterior, o sistema DEVE limpar o campo `completedAt`.
- **FR-009**: Os cartões situados na coluna `Completed` DEVEM exibir visualmente badges informativas com:
  - **Lead Time**: tempo total decorrido entre a criação e a conclusão (`completedAt - createdAt`).
  - **Cycle Time**: tempo total decorrido desde o primeiro ingresso em execução até a conclusão (`completedAt - startedAt`), incluindo eventuais períodos em que o cartão esteve na coluna `Blocked` (métrica clássica Lean/Kanban de tempo de ciclo).
- **FR-010**: O sistema DEVE disponibilizar uma barra de métricas (Metrics Bar) no topo da aplicação exibindo:
  - Throughput (quantidade total de tarefas concluídas).
  - Lead Time Médio das tarefas concluídas.
  - Cycle Time Médio das tarefas concluídas.
  - Status dos limites de WIP das colunas ativas.
- **FR-011**: As configurações de limite de WIP por coluna DEVEM ser persistidas no `localStorage` de forma integrada ou na chave de configuração do quadro.
- **FR-012**: As durações temporais DEVEM ser exibidas em formato amigável e legível por humanos (`< 1m`, `Xm`, `Xh Ym`, `Xd Yh`).

---

### Key Entities

- **TaskModel (Extensão)**:
  - `id` (string UUID v4)
  - `title` (string)
  - `column` (ColumnType)
  - `createdAt` (string ISO 8601)
  - `updatedAt` (string ISO 8601 opcional)
  - `startedAt` (string ISO 8601 opcional): Registro da primeira transição para `In Progress`.
  - `completedAt` (string ISO 8601 opcional): Registro da transição para `Completed`.
- **ColumnWipConfig**:
  - `column`: ColumnType
  - `limit`: number | null (null indica sem limite).
- **FlowMetricsSummary**:
  - `completedCount`: number
  - `averageLeadTimeMs`: number | null
  - `averageCycleTimeMs`: number | null

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Visibilidade Imediata de Gargalo)**: O usuário percebe a sobrecarga de WIP de uma coluna em menos de 1 segundo através do destaque âmbar.
- **SC-002 (Cálculo Preciso de Métricas)**: 100% dos cálculos de Lead Time e Cycle Time refletem com precisão matemática os timestamps armazenados.
- **SC-003 (Zero Perda de Dados em Recargas)**: Os limites de WIP e os timestamps de transição são integralmente mantidos e recarregados via `localStorage` após recarregar com `F5`.
- **SC-004 (Performance de Renderização)**: O cálculo das médias das métricas de fluxo no cabeçalho deve ser executado em menos de 5ms via memoização (`useMemo`).

---

## 📌 Clarifications & Decisions Recorded (`/speckit-clarify`)

| # | Área / Tema | Questão Clarificada | Decisão Homologada | Impacto no Design / Arquitetura |
|---|-------------|---------------------|--------------------|---------------------------------|
| 1 | **UX de Configuração de WIP** | Como o usuário altera o limite de uma coluna? | **Clique direto no contador/badge** da coluna para abrir input numérico inline com salvamento no blur/Enter. | Simplifica a UI evitando modais pesados; edição atômica em `Column.tsx`. |
| 2 | **Cálculo de Cycle Time com Bloqueios** | Como contabilizar tempo em `Blocked`? | **Tempo total decorrido** (do 1º `In Progress` até `Completed`, sem deduzir bloqueios), seguindo a métrica canônica Lean/Kanban. | `Cycle Time = completedAt - startedAt`; lógica determinística e pura. |
| 3 | **Valores Padrão de WIP** | Quais os limites de fábrica (seed/demo)? | `In Progress: 3`, `Blocked: 2`, `Todo: ∞` (sem limite), `Completed: ∞` (sem limite). | Injeta limites demonstrativos realistas em `INITIAL_WIP_LIMITS`. |
