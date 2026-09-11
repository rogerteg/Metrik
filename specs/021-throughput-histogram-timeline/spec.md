# Feature Specification: Gráfico de Vazão Avançado com Histograma e Linha do Tempo (Throughput Analytics)

**Feature Branch**: `021-throughput-histogram-timeline`  
**Created**: 2026-09-11  
**Status**: Implemented & Verified (Converged)  
**Input**: Imagem fornecida pelo usuário inspirada no **Throughput Histogram & Daily Run Chart**:
- **Visão Superior Principal: Histograma de Frequência de Vazão (`Throughput Histogram`)**:
  - Eixo X: Quantidade de itens de trabalho concluídos em um único dia (`Throughput (# of Work Items Completed on a Day)`): valores discretos `0, 1, 2, 3, 4, 5, 6, 7, 8...`.
  - Eixo Y: Frequência de ocorrência em número de dias (`Frequency (# of Days)`): ex: em 75 dias foram entregues 0 itens, em 35 dias foram entregues 1 item, em 30 dias foram entregues 2 itens, etc.
  - Barras azuis agrupadas por quantidade de itens concluídos.
  - Linhas verticais pontilhadas de percentis de vazão no topo:
    - **50% (Mediana)**
    - **70%**
    - **85% (SLE de Vazão / Capacidade Recomendada)**
    - **95% (Alta Confiabilidade / Conservador)**
- **Visão Inferior Sincronizada: Linha do Tempo Diária de Vazão (`Daily Throughput Run Chart / Timeline`)**:
  - Eixo X: Linha do tempo contínua no calendário (ex: de 2026-02 até 2026-09).
  - Eixo Y: Vazão diária (`Daily Throughput`) de 0 a 8+ itens.
  - Gráfico de linha com marcadores pontuais (dots) conectando a vazão de cada dia, permitindo visualizar tendências temporais, variações cíclicas, dias zerados e picos de entrega.
  - Mini-scrubber / seletor de janela temporal para zoom e navegação em intervalos longos.
- **Painel e Controles**:
  - Seletor de período histórico (últimos 14 dias, 30 dias, 60 dias, 90 dias, todo o histórico ou intervalo personalizado).
  - Resumo de métricas estatísticas: Throughput Total, Média Diária, Percentis P50/P70/P85/P95, Moda (valor mais frequente) e desvio padrão.
  - Alternador de visualização na aba `Throughput` (Histograma + Run Chart diário sincronizado ou Gráfico de barras simples).
- **Conformidade Constitucional Metrik (v1.2.0)**:
  - **Princípio V (Simplicidade & YAGNI)**: Renderização 100% SVG nativo, sem bibliotecas pesadas de terceiros (Chart.js / D3).
  - **Princípio VII (Independência Estrita de Marca)**: Nomenclatura 100% científica e neutra (Daniel Vacanti, Frank Vega, Throughput Histogram, Run Chart, Padrão NIST).

---

## 0. Esclarecimentos & Decisões Confirmadas (/speckit-clarify)

1. **Tratamento de Dias Sem Entrega**: Considerar todos os dias de calendário preenchendo finais de semana e feriados sem entregas com `count: 0` (como na imagem de referência e preconizado na literatura de fluxo de Daniel Vacanti).
2. **Percentis de Referência**: Exibir exatamente as linhas verticais pontilhadas de **50% (Mediana)**, **70%**, **85% (SLE de Vazão / Capacidade Recomendada)** e **95% (Alta Certeza)** no topo do Histograma.
3. **Disposição Visual**: Visão conjunta vertical empilhada: **Throughput Histogram** no topo e **Daily Throughput Run Chart** logo abaixo, mantendo fidelidade estrita à referência visual.

---

## 1. Visão Geral & Contexto Lean

A **Vazão (Throughput)** é o número de itens de trabalho entregues por unidade de tempo (geralmente por dia ou por semana). No gerenciamento moderno de projetos e fluxo ágil:
1. **O Gráfico Tradicional de Barras Temporais Não Basta**:
   - Um gráfico de barras que apenas lista os últimos 14 dias não responde à pergunta crucial de previsibilidade: *"Qual é a probabilidade da equipe entregar X itens em um dia qualquer?"*.
2. **O Histograma de Vazão (*Throughput Histogram*)**:
   - Agrupa o histórico pela contagem diária de conclusões (ex: dias com 0 entregas, dias com 1 entrega, dias com 2 entregas...), revelando a distribuição estatística de capacidade do time.
   - Projeta as linhas de percentil (50%, 70%, 85%, 95%), servindo de base empírica imediata para simulações e compromissos.
3. **O Gráfico Sequencial Diário (*Daily Throughput Run Chart*)**:
   - Exibe a série temporal sequencial com pontos conectados por linha ao longo dos meses.
   - Permite diagnosticar a estabilidade do processo: se as oscilações estão estáveis ao redor de uma média ou se há sazonalidade, lotes volumosos (*batching*) ou quedas abruptas de ritmo.

---

## 2. User Scenarios & Casos de Teste

### User Story 1 - Histograma de Frequência de Vazão com Percentis (Priority: P1)

Como gerente de projeto ou Scrum Master, quero visualizar um histograma mostrando quantos dias registraram 0, 1, 2, 3... itens concluídos com linhas verticais para os percentis 50%, 70%, 85% e 95%, para entender a distribuição estatística e a variabilidade de entrega da equipe.

**Why this priority**: É o gráfico principal da imagem de referência; resolve a necessidade de entender a capacidade diária provável da equipe de forma visual e intuitiva.

**Independent Test**:
- Acessar a aba `Throughput` no Analytics.
- O gráfico superior exibe o histograma em SVG com as barras azuis correspondentes às frequências de cada valor de vazão diária (incluindo explicitamente dias com 0 entregas).
- Linhas verticais pontilhadas demarcam no topo os percentis P50, P70, P85 e P95.
- Ao passar o mouse sobre cada barra, um tooltip exibe a quantidade exata de dias em que aquele valor ocorreu e a porcentagem do total de dias analisados.

---

### User Story 2 - Gráfico Sequencial de Vazão Diária (Run Chart / Linha do Tempo) (Priority: P1)

Como líder técnico, quero visualizar abaixo do histograma a linha temporal contínua da vazão diária conectando cada dia com pontos no calendário, para identificar tendências, semanas de alta/baixa produtividade e a estabilidade do fluxo ao longo do tempo.

**Why this priority**: Complementa o histograma com a dimensão cronológica; mostra se a variação é uniforme ou concentrada em certos períodos.

**Independent Test**:
- Abaixo do histograma, o gráfico de linha contínua exibe a data no eixo X e a vazão diária no eixo Y.
- Cada dia possui um ponto plotado (`dot`) conectado por linhas cinza/escuras.
- Ao passar o mouse em qualquer ponto, o tooltip exibe a data exata e o número de itens entregues.

---

### User Story 3 - Seletor de Período e Resumo Estatístico de Vazão (Priority: P2)

Como analista de processos, quero selecionar a janela temporal de análise (últimos 14, 30, 60, 90 dias ou todo o histórico) e visualizar um cartão de resumo com o Throughput Total, Média Diária, P85 e Moda, para embasar relatórios executivos rápidos.

**Why this priority**: Permite calibrar a análise para refletir o momento atual da equipe sem ruído de dados antigos.

**Independent Test**:
- Alterar o seletor de janela de 14 para 60 dias.
- Tanto o histograma quanto o run chart diário recalculam instantaneamente (< 50ms).
- O resumo estatístico exibe o total entregue, a média diária e os percentis atualizados.

---

## 3. Requisitos Funcionais (FR)

- **FR-001**: O sistema deve processar a série histórica diária de vazão a partir das tarefas concluídas do board (`completedAt`), preenchendo obrigatoriamente dias sem entrega com `count: 0`.
- **FR-002**: O sistema deve construir o **Histograma de Vazão**:
  - Eixo X: Quantidade de itens entregues por dia ($0, 1, 2, \dots, \max$).
  - Eixo Y: Contagem de dias em que aquele volume foi registrado.
- **FR-003**: O sistema deve calcular os percentis de vazão (50%, 70%, 85%, 95%) utilizando a interpolação linear padrão (NIST) e projetá-los como linhas verticais pontilhadas no histograma.
- **FR-004**: O sistema deve renderizar o **Daily Throughput Run Chart** na parte inferior:
  - Eixo X: Linha do tempo com datas formatadas em ordem cronológica contínua.
  - Eixo Y: Quantidade de itens entregues no dia correspondente.
  - Linha contínua conectando os pontos de cada dia com círculos nos vértices.
- **FR-005**: Os dois gráficos (Histograma e Run Chart) devem ser renderizados estritamente em **SVG vetorial nativo responsivo**, com suporte aos temas claro e escuro do Metrik.
- **FR-006**: Tooltips interativos devem estar presentes em ambas as visualizações (frequência de dias no histograma e data/quantidade no run chart).
- **FR-007**: A aba `throughput` existente no `AnalyticsNavHeader.tsx` deve carregar o novo componente consolidado `ThroughputAnalyticsView.tsx`, mantendo compatibilidade com o card compacto do Dashboard consolidado.
- **FR-008**: O sistema deve prover um estado de orientação educativa (*Empty/Guidance State*) quando o board não possuir tarefas concluídas.

---

## 4. Requisitos Não Funcionais (NFR)

- **NFR-001 (Performance)**: Renderização e atualização dos gráficos em tempo inferior a 40ms.
- **NFR-002 (Conformidade Constitucional - Princípio V e VII)**:
  - **Zero Dependências Externas**: Implementação 100% SVG nativo puro sem bibliotecas pesadas de plotagem.
  - **Independência Estrita de Marca**: Nomenclatura 100% científica e lean (Throughput Histogram, Daily Run Chart, Daniel Vacanti, Padrão NIST).

---

## 5. Critérios de Sucesso Mensuráveis

1. **Acurácia Estatística**: Contagem exata de dias por faixa de vazão e linhas de percentil correspondentes ao Padrão NIST validadas por testes unitários.
2. **Cobertura de Testes**: Mínimo de 8 novos testes unitários cobrindo o agrupamento de histograma, cálculo da série do run chart e renderização dos componentes.
3. **Preservação Global**: Os 246 testes existentes continuam passando com 100% de sucesso.
