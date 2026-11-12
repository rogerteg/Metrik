# Feature Specification: Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso

**Feature Branch**: `058-flow-leverage-simulator`  
**Created**: 2026-11-12  
**Status**: Implemented & Verified  
**Input**: User description: "O Próximo Passo que Tornará o Metrik Único no Mercado"

---

## Clarifications

### Session 2026-11-12

- Q: Como o Custo do Atraso (*Cost of Delay*) de um impedimento deve ser expresso na simulação? → A: **Dias extras no prazo P85 (Opção A)**: Expressar o impacto em dias extras projetados no horizonte P85 com base no tempo histórico de bloqueio e no número de itens dependentes retidos em cadeia, utilizando exclusivamente os dados atuais do quadro sem cadastros manuais extras.
- Q: Como mudanças testadas no simulador de políticas (WIP & Swarming) devem interagir com o quadro real? → A: **Modo Sandbox com botão de confirmação explícita (Opção A)**: Manter a simulação 100% isolada e read-only por padrão (Constituição X), exibindo um botão explícito de confirmação (*"Aplicar este limite na coluna"*) apenas para usuários autorizados (não-convidados).
- Q: Onde o ranking "Top 3 Alavancas do Dia" deve ficar acessível ao usuário? → A: **Painel de Analytics + Chat da Mika (Opção A)**: Exibir tanto como cartão de destaque no Painel de Analytics quanto via pílula rápida e comando conversacional offline no chat da Mika (*"🎯 Alavancas de Hoje"*).
- Q: Onde o Simulador de Alavancas de Fluxo e Diagnóstico de Cascata deve ser posicionado na interface do usuário? → A: **Aba integrada no Hub de Previsão (`MonteCarloSimulationView`) (Opção A)**: O simulador convive como uma aba/modo especializada dentro de `MonteCarloSimulationView`, unificando a inteligência preditiva e prescritiva no mesmo hub e reaproveitando a seleção de escopo (Iniciativas, Sprints, Backlog).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Diagnóstico de Impacto em Cascata e Custo do Atraso de Bloqueios (Priority: P1)

Como gestor de fluxo, líder técnico ou membro da equipe, desejo visualizar exatamente quanto cada item bloqueado, estagnado ou com dependências cruzadas está atrasando a previsão de entrega de uma Iniciativa, Sprint ou do quadro inteiro, para priorizar o desbloqueio que gera maior redução imediata de risco no prazo final.

**Why this priority**: Ferramentas comuns mostram apenas que um cartão está bloqueado, sem quantificar o estrago estatístico no prazo do projeto. Converter bloqueios e dependências em dias reais economizados na previsão de confiança (P85) transforma a gestão diária de reativa em cirúrgica.

**Independent Test**: Pode ser testado em um quadro com ao menos uma iniciativa ou sprint contendo tarefas bloqueadas e vínculos de dependência, verificando que o sistema calcula e ranqueia quais impedimentos causam maior impacto em dias no prazo projetado e mostra a simulação do ganho ao resolvê-los.

**Acceptance Scenarios**:

1. **Given** uma Iniciativa ou Sprint ativa com tarefas pendentes onde existe pelo menos um item bloqueado ou bloqueando outros cartões via vínculo de dependência, **When** o usuário acessa a análise de alavancas de fluxo, **Then** o sistema exibe um ranking dos impedimentos ordenado pelo ganho estimado em dias no prazo P85 caso sejam desbloqueados.
2. **Given** um item bloqueado `#ID` que trava múltiplas tarefas filhas ou dependentes em cascata, **When** o usuário inspeciona o impacto desse item, **Then** o sistema quantifica quantas tarefas dependentes estão retidas em cadeia e expressa o impacto em dias extras projetados no horizonte P85 com base no tempo histórico de bloqueio e nos itens dependentes, sem exigir cadastros manuais extras.
3. **Given** um quadro sem tarefas bloqueadas nem dependências em espera, **When** o usuário abre o diagnóstico de cascata, **Then** o sistema informa claramente que não há gargalos por bloqueio no momento e direciona o foco para otimização de políticas de fluxo (WIP/Aging).

---

### User Story 2 - Simulador "What-If" de Políticas de Fluxo (WIP & Swarming) (Priority: P2)

Como líder de engenharia ou agilista, desejo simular em tempo real o efeito de alterar políticas operacionais do meu quadro — como reduzir o limite de trabalho em progresso (WIP) de uma coluna gargalo ou concentrar a equipe (*swarming*) nos itens mais envelhecidos — para observar antes de agir quanto o tempo médio de ciclo e a previsibilidade de entrega (P85) irão melhorar com base nos dados históricos reais do time.

**Why this priority**: Previsões estáticas respondem *"quando vamos entregar se nada mudar"*. A simulação prescritiva responde *"o que precisamos mudar hoje no nosso sistema de trabalho para entregar mais rápido com segurança estatística"*, ancorada na Lei de Little e no histórico de vazão real.

**Independent Test**: Pode ser testado abrindo o simulador de políticas, ajustando o limite de WIP simulado de uma coluna em progresso ou ativando o cenário de *swarming* sobre itens de alto envelhecimento, e validando que a projeção comparativa (Cenário Atual vs. Cenário Simulado) recalcula instantaneamente o tempo de ciclo esperado e a data P85 estimada.

**Acceptance Scenarios**:

1. **Given** um quadro com histórico de vazão e colunas em progresso com trabalho acumulado, **When** o usuário ajusta no simulador um novo limite de WIP menor para uma coluna gargalo, **Then** o sistema exibe lado a lado o Cenário Atual versus o Cenário Simulado, mostrando a redução estimada no tempo médio de ciclo (pela Lei de Little), o novo prazo projetado (P50/P85) e a variação de risco na entrega.
2. **Given** cartões em andamento que já ultrapassaram o percentil P85 de expectativa de nível de serviço (SLE), **When** o usuário ativa a simulação de foco coletivo (*Swarming*) nos itens críticos, **Then** o simulador estima o ganho de fluxo ao concluir os itens mais antigos antes de puxar novas demandas da fila de entrada.
3. **Given** que o usuário simulou uma redução de limite de WIP no simulador e decidiu adotá-la para o time, **When** conclui a análise do cenário simulado, **Then** o simulador permanece em modo Sandbox read-only por padrão e oferece apenas para usuários autorizados (não-convidados) um botão explícito de confirmação (*"Aplicar este limite na coluna"*) para efetivar a alteração no quadro, sem jamais aplicar mudanças automaticamente ao fechar o simulador.

---

### User Story 3 - Plano de Ação Diário Ranqueado pela Mika ("Top 3 Alavancas do Dia") & Continuidade Contextual (Priority: P3)

Como membro da equipe ou gestor iniciando o dia no Metrik, desejo consultar diretamente as 3 ações de maior alavancagem matemática para destravar o fluxo hoje — além de navegar das respostas da assistente diretamente para o painel analítico já focado no escopo da conversa — para transformar métricas complexas em decisões práticas em menos de 30 segundos, mesmo offline.

**Why this priority**: Consolida toda a inteligência prescritiva no ponto de contato mais ágil do produto (Mika AI) e fecha a continuidade contextual entre o diálogo no chat e a exploração visual detalhada.

**Independent Test**: Pode ser testado solicitando *"Quais as alavancas de hoje?"* no chat da assistente (inclusive offline), verificando a exibição das 3 ações ordenadas por impacto em dias P85 com chips consultivos `#ID`, e clicando no atalho para abrir o painel de previsão já pré-selecionado exatamente na iniciativa ou sprint discutida.

**Acceptance Scenarios**:

1. **Given** um quadro com histórico de entregas, bloqueios ativos ou itens com risco elevado de SLE, **When** o usuário aciona a consulta de alavancas do dia, **Then** a assistente apresenta em menos de 10 milissegundos (modo local offline) um Top 3 ranqueado de alavancas concretas indicando o cartão `#ID`, o motivo estatístico (ex.: bloqueio em cascata, estouro P85 ou excesso de WIP) e o ganho estimado em dias se resolvido hoje.
2. **Given** a decisão de visibilidade das alavancas no produto, **When** o usuário abre o painel analítico ou o chat da assistente, **Then** o ranking *"Top 3 Alavancas do Dia"* é exibido tanto em um cartão de destaque no painel de Analytics quanto via pílula de sugestão rápida e comando conversacional no chat da Mika (mantendo caráter estritamente consultivo).
3. **Given** uma resposta da assistente sobre uma Iniciativa ou Sprint específica contendo o botão de ação para abrir a simulação completa, **When** o usuário clica no atalho consultivo, **Then** a gaveta do chat fecha, o painel analítico abre na aba de previsão de backlog e **já vem automaticamente pré-selecionado** na Iniciativa ou Sprint correspondente com os alertas de SLE visíveis na listagem de itens.

---

### Edge Cases

- **Quadro Sem Histórico Suficiente ($N < 10$ dias de entregas)**: O simulador de políticas e o calculador de alavancas exibem explicitamente a ressalva estatística de amostra reduzida (NIST), mantendo o ranking estrutural de bloqueios e dependências sem prometer precisão probabilística artificial.
- **Dependências Circulares entre Tarefas**: Se houver ciclos acidentais em vínculos de bloqueio entre cartões (ex.: A bloqueia B e B bloqueia A), a análise em cascata interrompe a travessia com detecção de ciclo sem travar o navegador e sinaliza o conflito para correção humana.
- **Múltiplos Ganhos Concorrentes**: Se duas alavancas resolverem o mesmo gargalo em cadeia, a soma apresentada evita dupla contagem enganosa e deixa claro o ganho individual de cada ação.
- **Perfil Somente-Leitura (Convidado)**: Usuários com perfil convidado podem visualizar e explorar todas as simulações no modo Sandbox, mas qualquer ação opcional de aplicar mudanças no quadro fica estritamente bloqueada/desabilitada.
- **Ambiente Totalmente Offline**: Tanto o ranking de alavancas na assistente quanto o simulador *What-If* operam 100% no dispositivo do usuário sem exigir conexão externa ou serviços de nuvem.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE calcular o impacto em cascata de bloqueios e dependências (`blocks` / `is_blocked_by` / `parent` / `child`), determinando quantos itens a jusante dependem de cada tarefa bloqueadora e quantificando o Custo do Atraso estimado em dias no horizonte P85.
- **FR-002**: O sistema DEVE oferecer um Simulador "What-If" de Políticas de Fluxo integrado como uma aba/modo dedicada dentro do Hub de Previsão (`MonteCarloSimulationView`), permitindo simular ajustes hipotéticos de limite de WIP por coluna e cenários de foco coletivo (*Swarming*) sobre itens com maior envelhecimento (*Aging*) reaproveitando o escopo ativo (Iniciativas, Sprints, Backlog).
- **FR-003**: O Simulador de Políticas DEVE calcular comparativamente o estado **Atual vs. Simulado** utilizando exclusivamente os dados históricos reais do quadro e a Lei de Little, exibindo variação esperada de tempo médio de ciclo, vazão efetiva e nova previsão P50/P85.
- **FR-004**: O sistema DEVE ranquear automaticamente as **Top 3 Alavancas de Fluxo do Dia**, ordenando ações concretas pelo maior impacto potencial de redução de atraso (dias economizados no P85 ou redução de risco SLE) e identificando cada item com identificador consultivo clicável (`#ID`).
- **FR-005**: A assistente conversacional (Mika AI) DEVE reconhecer intenções sobre alavancas, gargalos prioritários e impacto de bloqueios (ex.: *"Quais as alavancas de hoje?"*, *"O que destravar primeiro?"*, *"Qual o impacto desse bloqueio?"*) respondendo de forma determinística e 100% offline em menos de 10 milissegundos.
- **FR-006**: Quando o usuário acionar o atalho consultivo da Mika para ver uma simulação no painel completo, o sistema DEVE abrir o painel de previsão já focado no modo de backlog com o tipo de escopo (Iniciativa, Sprint ou Backlog Geral) e o item correspondente automaticamente pré-selecionados, exibindo também os selos de risco de SLE nos cartões listados.
- **FR-007**: O simulador e a assistente DEVEM operar de forma estritamente consultiva (*Read-Only* por padrão), nunca aplicando alterações em limites de WIP, tarefas ou prazos sem ação e confirmação explícita do usuário autorizado.
- **FR-008**: Quando a amostra histórica de vazão possuir menos de 10 dias com entregas ($N < 10$), todas as projeções comparativas DEVEM apresentar aviso claro de confiança amostral reduzida.
- **FR-009**: Toda a experiência, rótulos, mensagens e documentação DEVEM utilizar vocabulário próprio de engenharia de fluxo lean/ágeis, mantendo zero referências a nomes comerciais de terceiros.

---

### Key Entities *(include if feature involves data)*

- **Alavanca de Fluxo (*Flow Leverage Item*)**: Ação priorizada calculada a partir do estado do quadro, contendo: identificador da tarefa alvo (`#ID`), categoria da alavanca (Desbloqueio em Cascata, Redução de Aging Crítico, Ajuste de WIP em Gargalo), quantidade de itens impactados em cadeia, estimativa de dias economizados no P85 e justificativa estatística legível.
- **Cenário de Política Simulada (*Simulated Flow Policy*)**: Configuração temporária em memória contendo os limites de WIP simulados por coluna, opção de priorização por *Swarming*, e as métricas comparativas resultantes (Ciclo Médio Atual vs. Simulado, P50/P85 Atual vs. Simulado, Delta de Dias).
- **Grafo de Impacto em Cascata (*Dependency Cascade Impact*)**: Mapeamento acíclico das tarefas retidas por um impedimento ou dependência pai/bloqueadora, contabilizando profundidade da cadeia e risco acumulado.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário consegue identificar qual bloqueio ou ajuste de política gera maior redução de atraso em seu projeto em menos de 30 segundos após abrir o simulador ou consultar a assistente.
- **SC-002**: O cálculo de ranqueamento das Top 3 Alavancas e o recálculo comparativo de políticas no simulador respondem em menos de 50 milissegundos na interface do usuário, e em menos de 10 milissegundos no motor conversacional offline, sem travamentos visíveis mesmo em quadros com centenas de tarefas.
- **SC-003**: 100% das navegações disparadas por atalhos consultivos da assistente para uma Iniciativa ou Sprint específica abrem o painel já com o escopo correto pré-selecionado, eliminando a necessidade de reseleção manual pelo usuário.
- **SC-004**: Zero alterações não autorizadas no quadro ocorrem durante qualquer simulação exploratória, preservando integralmente a integridade dos dados em modo Sandbox.

---

## Assumptions

- **A001**: A feature reutiliza integralmente os dados locais de tarefas, vínculos, colunas, histórico de bloqueios, vazão histórica e previsões de SLE/Monte Carlo já existentes no navegador do usuário, sem exigir novos cadastros manuais obrigatórios.
- **A002**: O modelo prescritivo baseia-se na relação matemática da Lei de Little ($WIP = Throughput \times Cycle\ Time$) e na simulação estocástica já validada no produto, assumindo que reduções simuladas de WIP liberam capacidade proporcional para redução do tempo de fila quando o gargalo está saturado.
- **A003**: O envio de telemetria estocástica para provedores de IA externos permanece opcional e subordinado à soberania local: sem internet ou sem chave externa, todas as capacidades prescritivas continuam operando localmente.

