# Feature Specification: Mika AI Copilot Preditivo de Monte Carlo

**Feature Branch**: `057-mika-monte-carlo-copilot`  
**Created**: 2026-11-05  
**Status**: Clarified  
**Input**: User description: "Opção 1 (Recomendada): Mika AI Copilot Preditivo de Monte Carlo"

---

## Clarifications

### Session 2026-11-05

- Q: Como a Mika AI deve responder quando o usuário fizer uma pergunta genérica sobre prazos (ex: *"Como estão as iniciativas?"* ou *"Quando entregamos os projetos?"*) havendo múltiplas iniciativas ativas no quadro? → A: Resumo Consolidado de Portfólio (Opção A): Listar todas as iniciativas ativas em tópicos objetivos, detalhando itens pendentes, percentil P85 com data projetada e indicador de risco (Baixo, Moderado, Alto ou Crítico).
- Q: Como a Mika AI deve determinar a quantidade de dias para simular a capacidade de entrega (*"Quantos itens cabem?"*) quando a sprint ativa não possuir data final cadastrada ou quando a pergunta for geral? → A: Janela Padrão de 14 Dias Declarada (Opção A): Simular para 14 dias corridos, informando explicitamente na mensagem a premissa adotada (ex: *"Considerando uma sprint de 14 dias..."*) e permitindo ao usuário refinar com durações customizadas (ex: *"E para 7 dias?"*).
- Q: Como o botão de ação consultiva (*CTA*) na resposta da Mika (ex: *"📊 Ver Simulação Completa no Painel"*) deve navegar o usuário para a aba de Previsão de Backlog? → A: Navegação com Fechamento do Drawer (Opção A): Fecha o drawer da Mika, navega para a aba de Previsão de Backlog no Analytics e pré-seleciona a iniciativa ou sprint em foco, maximizando a área útil para visualização dos gráficos.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Diagnóstico Conversacional de Prazos e Previsão Estocástica (Priority: P1)

Como gestor de fluxo, líder técnico ou membro da equipe, desejo conversar em linguagem natural com a Mika AI dentro do chat para obter previsões estocásticas de término de Iniciativas/Épicos, Sprints ou do Backlog Geral (ex: *"Mika, quando entregamos a Iniciativa Portal?"* ou *"Qual o risco de não cumprirmos o prazo do projeto?"*), recebendo percentis probabilísticos (P50, P85, P95), datas projetadas e probabilidade exata de cumprimento de prazos com nível de risco semântico.

**Why this priority**: É a essência do copilot preditivo. Conecta a inteligência conversacional ao motor estatístico de Monte Carlo da Feature 056, permitindo tomada de decisão executiva ágil diretamente pelo chat.

**Independent Test**: Pode ser testado enviando perguntas como *"Mika, qual a previsão da Iniciativa X?"* ou *"Qual a probabilidade de entregar até 15 de dezembro?"* e verificando que a Mika responde com os percentis P50/P85/P95, probabilidade percentual de data meta e classificação de risco, tanto no modo heurístico local offline quanto com LLM (Gemini).

**Acceptance Scenarios**:

1. **Given** um quadro com histórico de vazão suficiente ($N \ge 10$ dias de entregas) e uma Iniciativa com data meta cadastrada, **When** o usuário pergunta no chat *"Mika, quando terminamos a Iniciativa X?"*, **Then** a Mika responde detalhando: quantidade de itens pendentes, percentis P50 (otimista), P85 (recomendado) e P95 (conservador) com datas de calendário projetadas, a probabilidade percentual de cumprimento da data meta e a classificação de risco (Baixo, Moderado, Alto ou Crítico).
2. **Given** múltiplas iniciativas ativas no quadro, **When** o usuário faz uma pergunta genérica de portfólio (ex: *"Como estão as iniciativas?"* ou *"Quando entregamos os projetos?"*), **Then** a Mika gera um resumo consolidado em tópicos cobrindo cada iniciativa com itens pendentes, P85, data meta e selo de risco.
3. **Given** um quadro onde o histórico de vazão possui menos de 10 dias com entregas ($N < 10$), **When** o usuário solicita uma previsão estocástica, **Then** a Mika inclui explicitamente a ressalva estatística NIST orientando que a margem de erro é elevada devido à amostragem reduzida.
4. **Given** um usuário operando em ambiente offline ou sem chave de API externa, **When** envia perguntas sobre previsão de entrega, **Then** a resposta é gerada em sub-10ms pelo motor heurístico local sem lançar exceções ou degradar a interface.

---

### User Story 2 - Consulta de Capacidade e Dimensionamento Estocástico de Sprint (Priority: P2)

Como Product Owner ou time de entrega, desejo perguntar à Mika quantos itens o time consegue entregar na próxima Sprint ou período com 85% de confiança estatística (ex: *"Mika, quantos itens cabem na sprint?"* ou *"Quantos itens puxar com 85% de certeza?"*), para planejar o trabalho baseado no ritmo empírico real do quadro sem estimativas subjetivas.

**Why this priority**: Substitui estimativas arbitrárias de esforço por dimensionamento probabilístico baseado na Lei de Little e no Throughput histórico, aumentando a previsibilidade operacional das sprints.

**Independent Test**: Pode ser testado perguntando *"Quantos itens puxar para a sprint com 85% de certeza?"* e validando que a Mika calcula a capacidade estocástica baseada na vazão histórica e no número de dias da sprint (ou janela padrão de 14 dias).

**Acceptance Scenarios**:

1. **Given** um quadro com vazão histórica registrada, **When** o usuário pergunta *"Quantos itens cabem na próxima sprint?"* e a sprint não define data de término, **Then** a Mika calcula a capacidade para 14 dias corridos, declarando explicitamente essa premissa na resposta, e indica o número recomendado de itens para 50%, 85% e 95% de certeza.
2. **Given** que o usuário pergunta por uma duração específica (ex: *"E para 7 dias?"* ou *"Quantos itens em 21 dias?"*), **When** a Mika processa a consulta, **Then** recalcula dinamicamente a capacidade estocástica para o período exato solicitado.
3. **Given** que a sprint atual já possui itens em andamento e pendentes, **When** o usuário pergunta *"A sprint atual vai atrasar?"*, **Then** a Mika avalia a probabilidade de conclusão de todos os itens restantes até a data de encerramento da sprint, emitindo recomendação de manutenção de escopo ou corte preventivo.

---

### User Story 3 - Pílulas de Sugestões Rápidas (Quick Prompts) e Ações Consultivas (Priority: P3)

Como usuário explorando o chat da Mika, desejo visualizar botões de sugestões rápidas relacionadas a previsões estocásticas e receber links/ações consultivas para aprofundar a análise no painel completo de Monte Carlo.

**Why this priority**: Melhora a descoberta (*discoverability*) da nova capacidade preditiva e permite alternar rapidamente entre o diagnóstico conversacional e a visualização detalhada em gráfico.

**Independent Test**: Pode ser testado abrindo o chat da Mika e verificando a presença das pílulas preditivas, clicando em uma delas e verificando o envio automático da consulta, bem como a exibição do botão de atalho consultivo para o painel de simulação.

**Acceptance Scenarios**:

1. **Given** o drawer do chat da Mika aberto, **When** o usuário visualiza as opções de sugestões rápidas, **Then** são exibidas pílulas contextuais tais como *"🎲 Previsão da Iniciativa"*, *"📅 Risco de Prazo da Sprint"* e *"🎯 Capacidade (85% SLE)"*.
2. **Given** uma resposta da Mika contendo diagnóstico de previsão de escopo, **When** o usuário clica na ação consultiva *"📊 Ver Simulação Completa no Painel"*, **Then** o sistema fecha o drawer da Mika, navega para a tela de Analytics na aba *"📦 Previsão de Backlog & Épicos"* e seleciona automaticamente o escopo da iniciativa ou sprint correspondente, sem mutar os dados do quadro.

---

### Edge Cases

- **Amostra Histórica Vazia ou Insuficiente**: Se o quadro tiver 0 entregas concluídas, a Mika informa de maneira empática que ainda não há dados suficientes para simulação estocástica e convida a registrar as primeiras entregas.
- **Escopo 100% Concluído**: Se todas as tarefas do escopo consultado já estiverem concluídas, a Mika reporta 100% de sucesso sem necessidade de simulação de dias futuros.
- **Nome de Iniciativa Inexistente ou Ambíguo**: Se o usuário consultar uma iniciativa que não existe ou cujo nome é vago, a Mika lista as iniciativas ativas encontradas no quadro para que o usuário escolha.
- **Pergunta sobre Data Meta Sem Alvo Definido**: Se o usuário perguntar *"Qual o risco do prazo?"* mas a iniciativa/sprint não tiver data de término cadastrada, a Mika fornece os percentis P50/P85/P95 e convida o usuário a estipular uma data alvo para cálculo exato de probabilidade.
- **Queda de Rede ou Falha da API LLM**: Em caso de falha de conexão ou erro no provedor externo (Gemini), o sistema executa fallback transparente e imediato para o motor heurístico local determinístico (Princípio X).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE enriquecer o construtor de telemetria da Mika ([`buildBoardTelemetryContext`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaContextBuilder.ts)) com um resumo estocástico de Monte Carlo (`monteCarloTelemetry`), incluindo:
  - Vazão diária histórica e validação amostral NIST ($N \ge 10$ dias de entregas).
  - Lista de Iniciativas ativas com contagem de itens pendentes/concluídos, data meta e percentis P50/P85/P95 pré-computados.
  - Sprint ativa com contagem de itens pendentes e probabilidade de término no prazo da sprint.
  - Backlog geral aberto com previsão global P85.
- **FR-002**: O sistema DEVE estender o motor determinístico offline ([`mikaChatHeuristicEngine.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaChatHeuristicEngine.ts)) para reconhecer intenções semânticas de previsão estocástica:
  - *Previsão de Término / Quando Entregamos* (`forecast_when`, `forecast_initiative`).
  - *Panorama Geral de Portfólio* (`forecast_initiatives_summary`): consolidação de todas as iniciativas ativas com contagem de pendências, P85 e selos de risco.
  - *Avaliação de Risco de Data Meta / Prazo* (`forecast_target_date`, `forecast_risk`).
  - *Capacidade / Quantos Itens Cabem* (`forecast_capacity`, `forecast_how_many`), assumindo 14 dias como padrão caso não especificado e suportando extração de dias numéricos da query (ex: *"7 dias"*, *"21 dias"*).
- **FR-003**: As respostas do motor heurístico local DEVEM ser executadas em menos de 10ms, sem chamadas externas, operando 100% offline em conformidade com os Princípios VIII e X da Constituição.
- **FR-004**: Quando o provedor Gemini estiver habilitado e online, o prompt de sistema gerado em [`mikaContextBuilder.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaContextBuilder.ts) DEVE incluir a telemetria estocástica estruturada, instruindo a IA a responder em linguagem natural embasada nos dados de Monte Carlo.
- **FR-005**: As respostas sobre previsões DEVEM incluir explicitamente a ressalva estatística NIST quando a amostra histórica for inferior a 10 dias com entregas ($N < 10$).
- **FR-006**: Menções a tarefas nas respostas da Mika DEVEM continuar sendo renderizadas como chips interativos consultivos (`#ID`), permitindo ao usuário abrir o modal de detalhes sem mutar o quadro (Princípio X).
- **FR-007**: O componente de chat ([`MikaChatInterface.tsx`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Mika/MikaChatInterface.tsx)) DEVE exibir pílulas de sugestões rápidas (*Quick Prompts*) voltadas para previsão estocástica quando o quadro possuir histórico de entregas.
- **FR-008**: O assistente DEVE disponibilizar uma ação consultiva (*CTA*) na resposta que permita ao usuário navegar diretamente para a aba de Previsão de Backlog (`MonteCarloSimulationView`) fechando o drawer lateral e aplicando o escopo contextual pré-selecionado (`initialScopeType`, `initialScopeId`).
- **FR-009**: Todas as respostas, mensagens e telemetria DEVEM manter estrita conformidade com o Princípio VII (independência de marca, vocabulário próprio do Metrik e zero vazamento de concorrentes).
- **FR-010**: Todos os arquivos criados ou modificados DEVEM respeitar o limite máximo estrito de 400 linhas de código (Princípio II), validado pelo `moduleLineCountGuard.test.ts`.

---

### Key Entities *(include if feature involves data)*

- **`MikaMonteCarloTelemetry`**: Estrutura contendo o snapshot de dados estocásticos do quadro:
  - `sampleValidation`: Validação NIST da vazão histórica (amostra suficiente, dias com entrega, total entregue).
  - `initiativesForecast`: Array com previsões por iniciativa (id, título, itens pendentes, p50, p85, p95, targetDate, targetProbability, riskLevel).
  - `activeSprintForecast`: Previsão da sprint ativa (id, título, itens pendentes, targetDate, targetProbability, riskLevel).
  - `generalBacklogForecast`: Previsão do backlog geral não finalizado.
- **`MikaForecastIntentCategory`**: Extensão das categorias de consulta rápida (`'forecast_initiative' | 'forecast_sprint' | 'forecast_capacity' | 'forecast_general'`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O motor heurístico determinístico local responde consultas de Monte Carlo em tempo de execução inferior a 10ms no navegador, 100% offline.
- **SC-002**: Em consultas com data meta cadastrada, a probabilidade calculada e comunicada pela Mika bate exatamente com os valores de [`calculateTargetDateProbability`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/monteCarloForecast.ts) ($\pm 0.1\%$).
- **SC-003**: 100% de conformidade com os Princípios VII (zero menções a marcas de terceiros) e X (zero mutação autônoma de dados, caráter estritamente consultivo).
- **SC-004**: Cobertura de testes unitários para os novos fluxos mantendo a suíte de testes com zero falhas e cobertura global de funções acima do limiar de 70%.

---

## Assumptions

- **A001**: As funções puras de previsão estocástica implementadas na Feature 056 ([`src/utils/monteCarloForecast.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/monteCarloForecast.ts)) serão reutilizadas diretamente pelo construtor de telemetria da Mika, garantindo coerência matemática total entre a UI gráfica e as respostas textuais.
- **A002**: A duração padrão da sprint para cálculos de capacidade é de 14 dias corridos, declarada na resposta, permitindo re-perguntas customizadas (ex: 7 dias, 21 dias).
- **A003**: A integração da Mika é estritamente consultiva (Read-Only) em cumprimento à Constituição X, não realizando alterações automáticas em datas, escopos ou colunas.
