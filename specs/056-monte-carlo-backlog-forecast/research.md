# Research & Technical Decisions: 056 — Simulação de Monte Carlo Preditiva de Backlog & Épicos

**Branch**: `056-monte-carlo-backlog-forecast` | **Date**: 2026-11-04  
**Spec**: [spec.md](./spec.md)

---

## 1. Pesquisa & Decisões Arquiteturais

### Decisão 1: Cálculo de Probabilidade de Data Meta (*Target Date CDF*)

- **Contexto**: A funcionalidade exige calcular a probabilidade percentual exata ($0\%$ a $100\%$) de concluir um escopo de $K$ tarefas até uma data meta futura $D_{target}$.
- **Decisão**: Reutilizar o array de resultados de ensaios já computados por `runMonteCarloWhen(throughputHistory, itemCount, referenceDate, trials)`.
  - Seja $N_{days} = \lfloor \frac{D_{target} - D_{ref}}{86.400.000} \rfloor$.
  - Se $N_{days} \le 0$, a probabilidade é declarada como $0\%$ (data já ultrapassada).
  - Caso contrário, a probabilidade é dada por:
    $$P(T \le N_{days}) = \frac{\sum_{i=1}^{\text{trials}} \mathbb{I}(\text{trialDays}_i \le N_{days})}{\text{trials}} \times 100$$
  - A classificação de risco é mapeada deterministicamente:
    - 🟢 **Baixo Risco**: $P \ge 85\%$
    - 🟡 **Risco Moderado**: $50\% \le P < 85\%$
    - 🔴 **Alto Risco**: $20\% \le P < 50\%$
    - ⚠️ **Risco Crítico / Inviável**: $P < 20\%$
- **Alternativas consideradas**:
  - *Executar uma nova simulação "How Many" invertida*: Exigiria rodar 10.000 novos sorteios estocásticos a cada troca de data meta, duplicando o tempo de CPU no navegador.
  - *Interpolar linearmente sobre os percentis P50, P85, P95*: Produziria aproximação grosseira e imprecisa em distribuições com caudas longas assimétricas.
- **Justificativa**: A contagem direta sobre os 10.000 ensaios pré-computados de `runMonteCarloWhen` tem complexidade $O(\text{trials})$, executando em $< 2\text{ms}$ em JavaScript moderno, sem qualquer overhead perceptível.

---

### Decisão 2: Resolução de Escopo e Agrupadores de Trabalho (*Scope Resolver*)

- **Contexto**: O usuário pode selecionar o escopo por Iniciativa, por Sprint, por Tag ou pelo Backlog Geral de colunas `todo` e `in_progress`.
- **Decisão**: Implementar a função utilitária pura `resolveBacklogScope(tasks, scopeConfig)`:
  - **Iniciativa/Épico**: Filtra cartões vinculados à iniciativa selecionada via `t.links` (com relação pai/filho ou `relates_to` apontando para o ID da iniciativa) ou por campo `initiativeId`.
  - **Sprint**: Filtra cartões onde `t.sprintId === sprintId`.
  - **Tag**: Filtra cartões onde `t.tags?.includes(tag)`.
  - **Backlog Geral**: Filtra cartões em colunas das categorias `todo` e `in_progress`.
  - **Regra de Pendência**: Separa os itens em `completedTasks` (`t.completedAt` preenchido) e `pendingTasks` (`!t.completedAt`). Apenas as tarefas pendentes compõem a base inicial do sorteio.
  - **Seleção Fina (Checkboxes)**: Permite ao usuário desmarcar tarefas pendentes específicas através do conjunto `selectedTaskIds: Set<string>`. O número efetivo de itens simulados é `itemCount = selectedTaskIds.size`.
- **Alternativas consideradas**:
  - *Obrigar o usuário a mover os itens para uma coluna dedicada de forecast*: Viola a Constituição V (YAGNI) e cria fricção desnecessária no fluxo diário de trabalho.
  - *Simulação automática sem permitir exclusão de cartões*: Impede simulações de cenários de contingência (ex.: "e se removermos estes 3 itens menos prioritários?").
- **Justificativa**: O filtro puramente em memória sobre o array de tarefas do quadro respeita a soberania Local-First (Constituição VIII) e permite simulações de "what-if" instantâneas.

---

### Decisão 3: Salvaguarda Amostral NIST e Blindagem contra Skew Temporal

- **Contexto**: A Constituição III e VI exige rigor científico e ausência de apodrecimento temporal nos testes (lição durável da Feature 054).
- **Decisão**:
  1. Injetar o parâmetro opcional `referenceDate?: Date = new Date()` em todas as funções de simulação e hooks (`useBacklogForecast`, `runMonteCarloBacklogForecast`, `calculateTargetDateProbability`).
  2. Aplicar a salvaguarda amostral empírica: exigir no mínimo $N \ge 10$ dias com registro de entregas na janela de Throughput selecionada (30, 60 ou 90 dias).
  3. Quando a amostra for insuficiente, emitir aviso estruturado com estado `insufficient_throughput` no objeto de resultado, desabilitando conclusões estatísticas definitivas e instruindo o usuário sobre a quantidade de dados faltante.
- **Alternativas consideradas**:
  - *Calcular mesmo com 1 ou 2 dias de entrega usando extrapolação paramétrica normal/gaussiana*: Viola a literatura de fluxo Lean (Daniel Vacanti, Troy Magennis), pois tempos de ciclo e vazão seguem distribuições empíricas assimétricas com caudas pesadas.
- **Justificativa**: Garante previsões críveis e reproduzíveis, prevenindo falsas certezas geradas por ruído amostral.

---

### Decisão 4: Decomposição Modular e Teto Constitucional de Linhas (Constituição II)

- **Contexto**: O arquivo atual `src/components/MonteCarloSimulationView.tsx` possui 337 linhas de código. Adicionar o seletor de escopo, listas de tarefas com checkboxes, seletor de data meta e métricas de risco diretamente nele ultrapassaria com folga o limite estrito de $\le 400$ linhas (Constituição II).
- **Decisão**:
  - Decompor a nova funcionalidade em módulos especialistas desacoplados:
    1. `src/utils/monteCarloForecast.ts`: Funções puras de cálculo de probabilidade de data meta, agrupamento de escopo e validação amostral ($\le 200$ linhas).
    2. `src/hooks/useBacklogForecast.ts`: Hook especialista de estado para gerenciar o escopo ativo, itens selecionados e cálculo reativo ($\le 180$ linhas).
    3. `src/components/MonteCarlo/BacklogForecastPanel.tsx`: Componente de apresentação do seletor de escopo, cards de percentis e análise de data meta ($\le 280$ linhas).
    4. `src/components/MonteCarlo/ForecastScopeCardList.tsx`: Subcomponente de listagem dos cartões do escopo com checkboxes e selos de SLE dinâmico ($\le 180$ linhas).
- **Justificativa**: Mantém 100% dos arquivos com folga significativa abaixo de 300 linhas, perfeitamente em conformidade com `tests/unit/moduleLineCountGuard.test.ts`.

---

## 2. Resumo das Decisões de Design

| Tópico | Opção Escolhida | Rationale |
|:---|:---|:---|
| **Cálculo da Data Meta** | CDF direta sobre os 10.000 ensaios do Monte Carlo | Execução em $< 2\text{ms}$ sem rodar novas simulações |
| **Resolução de Escopo** | Função pura em memória com suporte a Iniciativas, Sprints e Tags | Agilidade, sem persistência secundária desnecessária |
| **Controle de Escopo** | Agrupador + Checkboxes individuais de inclusão/exclusão | Permite análises ágeis de "what-if" e descarte de escopo |
| **Integridade Temporal** | Injeção de `referenceDate?: Date` | Eliminação total de quebras de teste por avanço de relógio |
| **Arquitetura de UI** | Sub-componentes em `src/components/MonteCarlo/` + Hook dedicado | Respeito inviolável ao teto de 400 linhas (Constituição II) |

