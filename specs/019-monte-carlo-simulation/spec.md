# Feature Specification: Simulações de Monte Carlo no Gerenciamento de Projetos

**Feature Branch**: `019-monte-carlo-simulation`  
**Created**: 2026-09-11  
**Status**: Draft  
**Input**: Requisito do usuário: "Simulações de Monte Carlo no Gerenciamento de Projetos"
- Previsões probabilísticas de entrega baseadas em dados empíricos de Throughput histórico diário do Metrik (Daniel Vacanti / Lei dos Grandes Números / Padrão NIST).
- Resolução das duas perguntas fundamentais da gestão ágil e lean:
  1. **"How Many" (Quantos itens?)**: Dado um prazo fixo (ex: até o fim do trimestre / $N$ dias), quantos itens conseguimos entregar com 50%, 85% e 95% de probabilidade?
  2. **"When" (Quando?)**: Dado um escopo fixo de backlog ($X$ itens), em que data ou em quantos dias concluiremos essas entregas com 50%, 85% e 95% de probabilidade?
- Visualização gráfica da distribuição de frequências simuladas (Histograma) e curva acumulada de probabilidade (CDF / Percentis de Confiança).
- Nova aba dedicada `Simulação Monte Carlo` na barra de navegação analítica (`AnalyticsNavHeader.tsx`).
- Total conformidade com a Constituição do Metrik v1.2.0 (em especial Princípio V - Simplicidade & YAGNI, e Princípio VII - Independência Estrita de Marca).

---

## 1. Visão Geral & Contexto

O gerenciamento de projetos tradicional frequentemente incorre no erro de utilizar médias aritméticas determinísticas ("se entregamos 2 itens por dia, 20 itens levarão 10 dias"), o que desconsidera a variabilidade inerente aos fluxos de trabalho do conhecimento.

A **Simulação de Monte Carlo** no Metrik resolve esse desafio amostrando iterativamente com reposição (*sampling with replacement*) o histórico real de Throughput diário registrado no board. Ao executar milhares de ensaios probabilísticos (ex: 10.000 iterações), o Metrik gera distribuições de probabilidade calibradas e objetivas para embasar tomadas de decisão, negociações de escopo e compromissos com stakeholders:
1. **Previsão "How Many" (Capacidade para Prazo Fixo)**:
   - O usuário informa a data limite de entrega (ou quantidade de dias corridos/úteis até a meta).
   - O motor de simulação projeta o throughput acumulado em cada um dos 10.000 ensaios.
   - O sistema reporta os percentis de entrega: P50 (otimista/mediana), P85 (compromisso com risco equilibrado / SLE padrão de mercado) e P95 (alta previsibilidade / quase certeza).
2. **Previsão "When" (Previsão de Data para Escopo Fixo)**:
   - O usuário informa o número de itens a serem entregues (ou seleciona itens restantes no backlog atual).
   - Para cada ensaio, o algoritmo acumula o throughput diário aleatório até que o total de itens seja atingido, registrando o número de dias necessários.
   - O sistema calcula e projeta a data de conclusão esperada para os níveis de confiança de 50%, 85% e 95%.
3. **Distribuição Visual (Histograma & Curva Cumulativa S)**:
   - Gráfico em SVG nativo renderizando a frequência de ocorrências simuladas e as linhas verticais correspondentes aos percentis de 50%, 85% e 95%.
   - Marcadores explicativos claros e interativos indicando a interpretação estatística de cada percentil.
4. **Configuração de Amostra Histórica**:
   - O usuário pode escolher a janela histórica de Throughput a ser utilizada na amostragem (ex: últimos 30 dias, últimos 60 dias, ou intervalo completo disponível no board).

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Simulação de Prazo Fixo ("How Many?") (Priority: P1)

Como gerente de projeto ou product owner, quero informar uma data futura de término para simular quantos itens o time conseguirá entregar com 50%, 85% e 95% de certeza, para que possamos planejar metas de release realistas sem recorrer a estimativas subjetivas em horas ou pontos.

**Why this priority**: É a pergunta mais frequente em planejamento de releases e sprints com data fixa (ex: compromissos contratuais e fechamento de quarter).

**Independent Test**:
- Navegar para a aba `Simulação Monte Carlo`.
- Selecionar o modo de simulação `Quantos Itens (How Many)`.
- Definir uma data de término a 30 dias do dia atual.
- O sistema executa os 10.000 ensaios de Monte Carlo com base no Throughput diário histórico do board.
- O resultado exibe os números de itens para 50%, 85% e 95% de probabilidade (onde $Q_{95} \le Q_{85} \le Q_{50}$ itens entregues garantidos).

---

### User Story 2 - Simulação de Escopo Fixo ("When?") (Priority: P1)

Como líder técnico ou Scrum Master, quero informar uma quantidade de itens restantes no backlog para descobrir em que data ou em quantos dias eles estarão concluídos com 50%, 85% e 95% de probabilidade, para fornecer uma previsão de entrega confiável com base estatística empírica.

**Why this priority**: Complemento indispensável da primeira simulação; resolve a pergunta fundamental "Quando isso vai ficar pronto?".

**Independent Test**:
- Na tela de Simulação de Monte Carlo, selecionar o modo `Quando Entregaremos (When)`.
- Informar a quantidade de itens do backlog (ex: 25 itens) ou clicar no atalho "Usar itens abertos no board".
- O motor simula 10.000 trajetórias de acúmulo de throughput diário.
- O sistema apresenta as datas estimadas de término para cada percentil (ex: P50 em 18 dias / [Data], P85 em 26 dias / [Data], P95 em 34 dias / [Data]).

---

### User Story 3 - Visualização Gráfica do Histograma e Curva Cumulativa (Priority: P2)

Como usuário analítico, quero visualizar o histograma de frequências dos ensaios com as linhas verticais destacadas dos percentis P50, P85 e P95 e a curva de probabilidade acumulada (CDF), para entender a dispersão e o grau de risco e incerteza do projeto.

**Why this priority**: Transparência visual é o cerne do Metrik; gráficos intuitivos em SVG facilitam a comunicação com clientes e tomadores de decisão não-estatísticos.

**Independent Test**:
- Ao rodar a simulação (seja *How Many* ou *When*), o gráfico exibe as barras de frequência de cada desfecho simulado.
- Linhas tracejadas coloridas verticais demarcam claramente P50 (Verde/Ciano), P85 (Âmbar/Laranja) e P95 (Vermelho/Púrpura).
- Ao passar o mouse sobre as barras, um tooltip exibe a probabilidade de ocorrência exata e a probabilidade acumulada até aquele ponto.

---

### User Story 4 - Seleção de Janela Histórica e Parâmetros de Simulação (Priority: P2)

Como analista de processos, quero selecionar qual período histórico do board deve alimentar as amostras de Throughput diário (ex: últimos 30, 60, 90 dias ou período personalizado), bem como a quantidade de iterações da simulação (padrão 10.000 ensaios), para garantir que mudanças recentes no ritmo ou na equipe sejam representadas com precisão.

**Why this priority**: Evita que dados desatualizados ou anomalias antigas do board distorçam as previsões para o contexto atual do time.

**Independent Test**:
- No painel de configuração da simulação, alterar a janela histórica de 30 para 60 dias.
- Clicar em `Simular`.
- O cálculo é recalculado instantaneamente (< 250ms) usando apenas o subconjunto de Throughput histórico configurado.

---

## 3. Requisitos Funcionais (FR)

- **FR-001**: O sistema deve extrair o histórico diário de Throughput (número de cartões concluídos por dia calendário) a partir das tarefas do board ativo. Dias sem conclusão de itens devem constar no histórico como valor `0` (essencial para capturar dias vazios e fins de semana sem viés de superestimação).
- **FR-002**: O motor de simulação (`monteCarlo.ts`) deve implementar amostragem aleatória uniforme com reposição (*Bootstrap Sampling*) sobre o vetor de Throughput diário histórico.
- **FR-003**: A simulação "How Many" deve computar o total acumulado de itens entregues em $N$ dias para 10.000 iterações, ordenando os resultados para derivar os percentis 50%, 85% e 95% (onde $P_{xx}$ representa que em $xx\%$ dos ensaios a entrega foi igual ou superior a esse quantitativo).
- **FR-004**: A simulação "When" deve calcular o número de dias necessários para atingir o backlog $B$ em 10.000 iterações, convertendo a contagem de dias em datas de calendário projetadas a partir da data de início da simulação.
- **FR-005**: A interface deve disponibilizar a aba `Simulação Monte Carlo` (ou `Previsões`) no cabeçalho `AnalyticsNavHeader.tsx` e renderizar o componente `MonteCarloView.tsx`.
- **FR-006**: Caso o histórico do board possua menos de 5 dias registrados de Throughput ou zero tarefas concluídas, o sistema deve exibir um *Empty/Guidance State* didático informando a necessidade de histórico para calibrar a simulação probabilística.
- **FR-007**: Todo o cálculo numérico deve ser não-bloqueante na UI, executando os 10.000 ensaios em menos de 100ms via JavaScript/TypeScript otimizado.
- **FR-008**: Os gráficos de histograma e curva acumulada devem ser renderizados estritamente em SVG nativo responsivo, com suporte a modo claro e escuro, sem nenhuma dependência de biblioteca terceira de gráficos.
- **FR-009**: O motor deve permitir injeção de uma função geradora pseudoaleatória ou semente (*seed*) opcional para assegurar testes unitários 100% determinísticos e reprodutíveis.

---

## 4. Requisitos Não Funcionais (NFR)

- **NFR-001 (Performance)**: Execução de 10.000 ensaios em tempo $\le 100\text{ ms}$ em hardware padrão de usuário.
- **NFR-002 (Acessibilidade)**: Contraste de cores WCAG AA nas barras do histograma e nas linhas de percentil; suporte a navegação por teclado nos seletores e formulários de parâmetros.
- **NFR-003 (Conformidade Constitucional v1.2.0)**:
  - **Princípio V (Simplicidade & YAGNI)**: Implementação pura em TypeScript e SVG nativo, sem bibliotecas pesadas de gráficos ou estatística externa.
  - **Princípio VII (Independência de Marca)**: Proibição estrita de menções nominais a ferramentas de terceiros no código, rótulos de tela, CSS ou documentação. Nomenclatura 100% científica e lean.

---

## 5. Critérios de Sucesso Mensuráveis

1. **Acurácia Algorítmica**: 100% de conformidade com os cálculos padrão da literatura (Daniel Vacanti / Padrão NIST) validados por testes unitários exaustivos com semente determinística fixa.
2. **Cobertura de Testes**: Mínimo de 10 novos testes unitários cobrindo o motor de amostragem, cálculo de percentis de Monte Carlo, projeção de datas de calendário e renderização da UI.
3. **Desempenho de Renderização**: Tempo entre o clique em `Simular` e a atualização gráfica inferior a 150ms.
4. **Preservação da Suite Global**: Os 219 testes pré-existentes do Metrik continuam passando com zero quebras.
