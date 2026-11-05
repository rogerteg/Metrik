# Feature Specification: 056 — Simulação de Monte Carlo Preditiva de Backlog & Épicos

**Feature Branch**: `056-monte-carlo-backlog-forecast`  
**Created**: 2026-11-04  
**Status**: Draft  
**Input**: User description: "Simulação de Monte Carlo Preditiva de Backlog & Épicos (Recomendada)"

---

## Contexto & Propósito

O Metrik já disponibiliza um motor de simulação probabilística de Monte Carlo (`monteCarlo.ts`) e visualizações de histograma para estimativas genéricas de "Quantos Itens?" (*How Many*) e "Quando?" (*When*). Além disso, a Feature 054 introduziu expectativas de nível de serviço dinâmicas (SLE P50, P85, P95) por cartão.

No entanto, equipes ágeis e líderes de engenharia necessitam responder a perguntas concretas sobre entregas agregadas:
1. *"Quando todas as tarefas deste Épico/Iniciativa serão concluídas?"*
2. *"Qual a probabilidade estatística de entregarmos o escopo desta Sprint até a data limite acordada?"*
3. *"Se selecionarmos um conjunto específico de 18 cartões do backlog (ex.: tag `#MVP`), qual é a data limite de entrega com 85% e 95% de confiança?"*

Hoje, o usuário precisa contar manualmente os cartões abertos e digitar o número no campo genérico de simulação. Não há conexão entre o escopo estruturado do quadro (Iniciativas, Sprints, Tags e colunas ativas) e as projeções probabilísticas de calendário.

Esta funcionalidade tem como objetivo **integrar a simulação de Monte Carlo diretamente ao modelo de dados de cartões, iniciativas e sprints do Metrik**, permitindo previsões probabilísticas automáticas de término de escopo, cálculo de probabilidade de cumprimento de prazos-meta (*Target Date Confidence*) e diagnóstico antecipado de risco de entrega.

---

## Clarifications

### Session 2026-11-04

- Q: Como o usuário deve definir o escopo de cartões para a previsão probabilística de Monte Carlo? → A: Agrupadores lógicos de alto nível (Iniciativa/Épico, Sprint ou Tag) com seleção granular fina (lista de cartões exibida com caixas de seleção/checkboxes para inclusão/exclusão pontual antes do cálculo).
- Q: Como o sistema deve determinar a Data Meta (Target Date) para o cálculo de probabilidade de cumprimento de prazo? → A: Inferência automática com override (pré-carrega o `dueDate` da Iniciativa ou o `endDate` da Sprint como Data Meta padrão, mantendo seletor de calendário aberto para ajustes e cenários alternativos).
- Q: Onde a interface de previsão de escopo deve ser acessada e integrada no Metrik? → A: Integração híbrida no painel analítico de Monte Carlo (modo de previsão de escopo em `MonteCarloSimulationView`) combinada com botão de atalho contextual ("🎲 Previsão de Entrega") no modal de detalhes da Iniciativa que direciona para a visualização com o escopo pré-carregado.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Previsão Probabilística de Conclusão por Iniciativa ou Épico (Priority: P1) 🎯 MVP

Como líder técnico ou Product Owner,  
quero selecionar uma Iniciativa/Épico no painel de previsão probabilística e visualizar as datas estimadas de término com 50%, 85% e 95% de confiança,  
para comunicar prazos realistas e cientificamente embasados a stakeholders sem depender de estimativas subjetivas.

**Why this priority**: É o valor central da funcionalidade: transformar itens de trabalho vinculados em datas de entrega confiáveis via simulação empírica de Monte Carlo.

**Independent Test**: Selecionar uma iniciativa que possua 10 cartões vinculados (3 concluídos e 7 abertos). O sistema deve isolar automaticamente os 7 itens restantes, alimentar o motor de Monte Carlo com a vazão histórica e exibir as datas de término para P50, P85 e P95.

**Acceptance Scenarios**:

1. **Given** um quadro com histórico de Throughput e uma Iniciativa selecionada contendo tarefas pendentes,  
   **When** o usuário abre a aba de previsão de escopo,  
   **Then** o sistema lista a quantidade de cartões pendentes da iniciativa e calcula as datas de entrega nos níveis de confiança 50%, 85% e 95%.
2. **Given** uma iniciativa cujas tarefas vinculadas já estejam 100% concluídas,  
   **When** selecionada no filtro de escopo,  
   **Then** o sistema exibe estado indicando que o escopo já foi finalizado, sem executar simulações redundantes.

---

### User Story 2 - Cálculo de Probabilidade de Cumprimento de Data Meta (Priority: P2)

Como gestor de projeto com um compromisso de prazo acordado,  
quero informar ou herdar uma data meta de entrega para o escopo selecionado e obter a probabilidade exata (0% a 100%) de concluir até essa data,  
para saber antecipadamente se o compromisso é de baixo, moderado ou alto risco.

**Why this priority**: Permite tomar decisões ativas de corte de escopo ou alocação antes que o atraso aconteça.

**Independent Test**: Definir uma data meta distante onde 92% das 10.000 simulações de Monte Carlo concluem a tempo; o sistema deve indicar "92% de probabilidade (Baixo Risco)". Em seguida, adiantar a data meta para um prazo inviável; o sistema deve indicar "Risco Crítico (<20%)".

**Acceptance Scenarios**:

1. **Given** um escopo de 12 tarefas e uma data meta configurada,  
   **When** o cálculo probabilístico é executado com 10.000 iterações,  
   **Then** o sistema apresenta a porcentagem exata de ensaios que terminaram em ou antes da data meta e uma classificação semântica de risco (Verde $\ge 85\%$, Amarelo $50\% \text{ a } 84\%$, Vermelho $< 50\%$).
2. **Given** uma data meta configurada anterior à data corrente ou impossível mesmo na velocidade máxima histórica,  
   **When** avaliada,  
   **Then** o sistema exibe probabilidade $<1\%$ com mensagem instrutiva de inviabilidade probabilística.

---

### User Story 3 - Filtro por Sprint, Tag ou Backlog Geral (Priority: P3)

Como membro de um time ágil planejando uma iteração,  
quero filtrar o escopo da previsão por Sprint ativa, por Etiqueta temática (ex.: `#Release-1.0`) ou por todas as tarefas não concluídas das colunas de entrada,  
para avaliar a capacidade real do time em diferentes agrupamentos de trabalho.

**Why this priority**: Dá flexibilidade operacional para equipes que não trabalham exclusivamente com hierarquias de Iniciativa.

**Independent Test**: Filtrar por tag `#Release-1.0` (6 tarefas). O sistema executa a simulação para exatamente essas 6 tarefas, recalculando as curvas e percentis.

**Acceptance Scenarios**:

1. **Given** tarefas marcadas com a tag `#MVP` distribuídas entre colunas Todo e In Progress,  
   **When** o usuário escolhe a tag `#MVP` no seletor de escopo,  
   **Then** a contagem de itens pendentes é atualizada e a simulação de prazo é recalculada em tempo real.

---

### User Story 4 - Resguardo Amostral e Alinhamento com SLE Dinâmico (Priority: P4)

Como analista de fluxo,  
quero ser avisado se o histórico de Throughput for estatisticamente insuficiente ($N < 10$ dias de histórico com vazão) ou se cartões em andamento dentro do escopo violarem seus SLEs individuais,  
para não tomar decisões estratégicas baseadas em amostras ruidosas.

**Why this priority**: Cumpre a Constituição III e VI (rigor científico e ausência de falsos sinais).

**Independent Test**: Em um quadro com menos de 10 dias de histórico, a visualização apresenta o alerta de amostra insuficiente e silencia conclusões categóricas.

**Acceptance Scenarios**:

1. **Given** um quadro novo com menos de 10 amostras diárias registradas,  
   **When** o usuário tenta gerar previsões de Monte Carlo para o backlog,  
   **Then** o sistema exibe estado instrutivo indicando quantas entregas adicionais são necessárias para atingir significância estatística.
2. **Given** itens do escopo selecionado que estejam em andamento e em risco de SLE (P85/P95),  
   **When** exibido o detalhamento do escopo,  
   **Then** selos visuais destacam os cartões com envelhecimento crítico que ameaçam a previsão do grupo.

---

## Edge Cases

- **O que acontece se todas as tarefas do backlog selecionado estiverem bloqueadas?**  
  O sistema emite um alerta contextual informando que $100\%$ do escopo está impedido, o que invalida a premissa de vazão contínua da simulação de Monte Carlo.
- **O que acontece se a vazão média histórica for zero (nenhuma tarefa entregue)?**  
  A simulação é bloqueada e substituída por uma tela explicativa orientando a registrar entregas para calibrar o modelo probabilístico.
- **O que acontece se a data de referência for customizada (testes ou auditoria retroativa)?**  
  Todas as projeções de calendário (`projectedDate`) e contagens de tempo decorrido devem calcular a partir do parâmetro `referenceDate?: Date`, blindando a suíte contra skew temporal (aprendizado durável da Feature 054).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer um seletor de escopo no painel de previsão de Monte Carlo permitindo escolher agrupadores lógicos (Iniciativa/Épico, Sprint ou Tag) e listar os cartões pendentes correspondentes com caixas de seleção (*checkboxes*) para inclusão ou exclusão granular pontual antes do cálculo.
- **FR-002**: O sistema DEVE quantificar automaticamente os itens pendentes (não concluídos) pertencentes ao escopo selecionado, desconsiderando tarefas já finalizadas (`completedAt` preenchido).
- **FR-003**: O sistema DEVE executar 10.000 iterações de Monte Carlo (*When*) sobre a série histórica de Throughput para projetar as datas de término nos percentis de confiança P50, P85 e P95.
- **FR-004**: O sistema DEVE calcular e exibir a probabilidade exata ($0\%$ a $100\%$) de concluir o escopo selecionado em ou antes da Data Meta, inferindo-a automaticamente a partir do `dueDate` da Iniciativa ou `endDate` da Sprint quando disponível, com suporte a override manual livre pelo usuário.
- **FR-005**: O sistema DEVE classificar visualmente o nível de risco da Data Meta com base na probabilidade de sucesso: Verde ($\ge 85\%$), Amarelo ($50\% \le p < 85\%$) e Vermelho ($< 50\%$).
- **FR-006**: O sistema DEVE validar o tamanho da amostra histórica de Throughput ($N \ge 10$ dias com entregas na janela selecionada) antes de validar os resultados, apresentando mensagem instrutiva caso a amostra seja insuficiente.
- **FR-007**: O sistema DEVE suportar o parâmetro opcional `referenceDate?: Date` em todas as funções de simulação e componentes de previsão para garantir reprodutibilidade determinística e proteção contra skew temporal nos testes.
- **FR-008**: O sistema DEVE integrar os selos de risco de SLE dinâmico (P50/P85/P95 da Feature 054) na listagem dos cartões que compõem o escopo da previsão, destacando itens em andamento estagnados.
- **FR-009**: O sistema DEVE disponibilizar um botão de atalho contextual ("🎲 Previsão de Entrega") no modal de detalhes de itens do tipo Iniciativa, permitindo abrir diretamente o painel de Monte Carlo com o escopo e a data meta da iniciativa já pré-selecionados.

---

### Key Entities

- **`BacklogForecastScope`**: Modelo que define a origem do escopo (`type: 'all' | 'initiative' | 'sprint' | 'tag'`), o identificador do agrupador (`scopeId?: string`), a contagem total de itens pendentes e a lista de IDs de tarefas participantes.
- **`TargetDateProbabilityResult`**: Resultado contendo a data meta analisada, o total de ensaios favoráveis, a porcentagem de probabilidade ($0..100$) e a categoria de risco (`low` | `moderate` | `high` | `critical`).
- **`BacklogMonteCarloForecast`**: Estrutura consolidada com resultados de prazos (P50, P85, P95 em dias e datas de calendário), análise da data meta (se informada) e metadados amostrais de confiabilidade.

---

## Success Criteria *(mandatory)*

- **SC-001**: **Autonomia de Previsão**: O usuário consegue obter previsões com 50%, 85% e 95% de certeza para qualquer Iniciativa ou Sprint em menos de 2 cliques, sem necessidade de digitação manual de quantidades.
- **SC-002**: **Velocidade de Execução**: A simulação completa com 10.000 iterações e cálculo de probabilidade para a data meta deve rodar no navegador em menos de 100 milissegundos sem congelar a interface.
- **SC-003**: **Clareza de Decisão**: 100% das simulações com Data Meta devem indicar visualmente e textualmente o grau de risco (Verde/Amarelo/Vermelho) e a probabilidade percentual calculada.
- **SC-004**: **Rigor Metodológico**: Zero falsos positivos estatísticos em quadros com dados insuficientes ($N < 10$), com exibição obrigatória do estado instrutivo de alerta.

---

## Assumptions

- As tarefas pertencentes a uma Iniciativa são identificadas pelo vínculo de relacionamento (`type === 'initiative'` com links `relates_to` / `child`, ou campo `initiativeId` existente).
- A base empírica para o sorteio de Monte Carlo é a série de vazão diária (Throughput) do quadro ativo, calculada em janelas de 30, 60 ou 90 dias com dias de vazão zero preservados.
- Todas as operações operam estritamente no modelo Local-First (Constituição VIII), sem exigência de conexão com serviços de nuvem externos para rodar o motor estocástico.

