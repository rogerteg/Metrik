# Research & Technical Decisions: Simulações de Monte Carlo no Gerenciamento de Projetos

**Feature**: `019-monte-carlo-simulation` | **Date**: 2026-09-11

---

## 1. Fundamentos Teóricos e Estado da Arte em Previsões Probabilísticas

O planejamento tradicional de projetos baseia-se frequentemente em estimativas determinísticas determinando médias ou horas estimadas, falhando diante da incerteza natural do trabalho intelectual (Efeito Flaw of Averages / Teorema de Jensen).

A literatura moderna de fluxo (Daniel Vacanti, Frank Vega e Troy Magennis) preconiza o uso de **Simulação de Monte Carlo com Re-amostragem com Reposição** (*Bootstrap Sampling*):
1. **Histórico de Throughput Real**: O sistema extrai a série histórica de cartões concluídos por dia.
2. **Preservação de Dias Nulos ($0$ entregas)**: Finais de semana, feriados ou dias normais sem entregas não devem ser descartados; devem constar como dias de valor `0`. Descartar dias vazios distorceria a taxa de amostragem para cima gerando um viés otimista irreal.
3. **Resolução das Duas Questões Fundamentais**:
   - **"How Many" (Quantos Itens?)**: Fixa-se uma janela temporal de $N$ dias até uma data limite. Para cada ensaio, sorteiam-se $N$ amostras do histórico e soma-se o total entregue. Em 10.000 ensaios, ordenam-se os totais em ordem decrescente para determinar os quantis $P_{50}$, $P_{85}$ e $P_{95}$.
   - **"When" (Quando?)**: Fixa-se uma quantidade de $B$ itens no backlog. Para cada ensaio, sorteiam-se amostras diárias sucessivas até que a soma acumulada seja $\ge B$, registrando a contagem de dias necessários. Em 10.000 ensaios, ordenam-se as durações em ordem crescente para determinar os quantis $P_{50}$, $P_{85}$ e $P_{95}$.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Algoritmo de Amostragem e Reprodutibilidade nos Testes
- **Opções Avaliadas**:
  - *Opção A*: Usar exclusivamente `Math.random()`.
  - *Opção B*: Injeção de gerador pseudoaleatório `(rng?: () => number)` com fallback para `Math.random()`.
- **Decisão**: **Opção B (Injeção de `rng`)**.
- **Justificativa**: Permite implementar nos testes unitários geradores determinísticos lineares congruentes (LCG) com sementes fixas, garantindo que os percentis simulados possam ser asseridos com exatidão matemática no Vitest sem risco de testes flutuantes (*flaky tests*).

### Decisão 2: Desempenho e Volume de Ensaios (10.000 trials)
- **Opções Avaliadas**:
  - *Opção A*: Web Worker em thread separada.
  - *Opção B*: Loop nativo síncrono ultra-otimizado com `Float64Array` ou `Int32Array` em TypeScript.
- **Decisão**: **Opção B (Loop síncrono otimizado em arrays nativos)**.
- **Justificativa**: Em benchmarks JavaScript/V8, sortear 10.000 ensaios para uma janela típica de 30 a 90 dias leva entre 8ms e 25ms. O overhead de mensagens IPC e serialização de um Web Worker não se justifica (Princípio V - Simplicidade & YAGNI). A execução é praticamente imperceptível para o usuário final (< 30ms).

### Decisão 3: Visualização do Histograma e Percentis
- **Opções Avaliadas**:
  - *Opção A*: Dependência de Chart.js ou bibliotecas terceiras de plotagem.
  - *Opção B*: Componente SVG Vetorial Nativo com barras de frequência e linhas verticais coloridas de percentis.
- **Decisão**: **Opção B (SVG Vetorial Nativo)**.
- **Justificativa**: Respeita rigorosamente a Constituição v1.2.0 (Princípio V), garante alinhamento visual perfeito com o design escuro do Metrik, responsividade e zero peso no bundle final.

### Decisão 4: Independência de Marca e Identidade Terminológica
- **Decisão**: **Princípio VII (Brand Independence & Clean Identity)**.
- **Diretriz**: Utilizar unicamente a terminologia estatística e lean consagrada: "Simulação de Monte Carlo", "Previsão Probabilística", "Percentil 50% / 85% / 95%", "SLE (Service Level Expectation)". Não utilizar quaisquer referências ou marcas registradas de softwares comerciais de terceiros.

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **Loop infinito na simulação "When"** | Histórico de Throughput composto unicamente por zeros (nenhuma tarefa concluída). | Validação de guarda inicial: se a soma total de entregas no histórico for 0, interrompe imediatamente e retorna estado de histórico insuficiente. Na simulação, define-se um teto de segurança (ex: 365 dias) por ensaio. |
| **Data final anterior à data atual no "How Many"** | Usuário escolhe data no passado no input de data. | Validação reativa com fallback: mínimo de 1 dia de simulação e mensagem de orientação no card. |
| **Board sem tarefas concluídas suficientes** | Board recém-criado com menos de 5 dias registrados. | Estado visual informativo e amigável (*Empty/Guidance State*) instruindo o usuário a movimentar cartões para colher métricas reais. |
| **Superestimação por exclusão de dias vazios** | Contar apenas dias em que houve entregas. | O algoritmo itera estritamente dia a dia no calendário, garantindo que dias sem entrega recebam valor `0`. |
