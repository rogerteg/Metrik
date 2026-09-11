# Implementation Plan: Simulações de Monte Carlo no Gerenciamento de Projetos

**Branch**: `019-monte-carlo-simulation` | **Date**: 2026-09-11 | **Spec**: [specs/019-monte-carlo-simulation/spec.md](spec.md)

---

## 1. Resumo & Arquitetura da Solução

Implementar o módulo completo de **Simulações Probabilísticas de Monte Carlo para Gerenciamento de Projetos** no Metrik:
1. **Motor de Simulação de Monte Carlo (`monteCarlo.ts`)**:
   - Amostragem uniforme com reposição (*Bootstrap Sampling*) de Throughput diário histórico registrado no board.
   - **Simulação "How Many" (Quantos Itens?)**: Para uma janela de $N$ dias até uma data limite, simula 10.000 trajetórias e calcula os percentis 50%, 85% e 95% de itens entregues.
   - **Simulação "When" (Quando Concluiremos?)**: Para um backlog de $X$ itens, simula 10.000 trajetórias de acúmulo de throughput até atingir a meta, projetando a duração em dias e as datas de calendário correspondentes para 50%, 85% e 95% de confiança.
   - Suporte a gerador pseudoaleatório determinístico com semente opcional para testes unitários 100% reprodutíveis.
2. **Componente Visual de Simulação (`MonteCarloSimulationView.tsx`)**:
   - Painel superior com seletor de modo:
     - **Modo "How Many"**: Seleção de data final (com cálculo automático de dias úteis/corridos) ou digitação de dias.
     - **Modo "When"**: Seleção do número de itens a entregar com botão de atalho ("Usar itens abertos no board: N itens").
     - **Configurações Avançadas**: Seleção da janela de histórico amostral (últimos 30, 60, 90 dias ou todo o histórico) e quantidade de iterações (padrão 10.000).
   - Cards de Destaque com Percentis de Confiança:
     - **50% (Otimista / Mediana)**
     - **85% (Compromisso Recomendado / SLE)**
     - **95% (Alta Certeza / Cauda)**
3. **Gráficos em SVG Nativo (`MonteCarloHistogramChart.tsx`)**:
   - Histograma de frequência das ocorrências simuladas com barras estilizadas.
   - Curva em "S" de probabilidade acumulada (CDF).
   - Linhas verticais destacando visualmente P50, P85 e P95 com anotações e tooltips interativos.
4. **Navegação Integrada (`AnalyticsNavHeader.tsx` & `AnalyticsDashboard.tsx`)**:
   - Nova aba dedicada `forecasting` (`🎲 Monte Carlo`) na barra de navegação analítica.
   - Estado vazio e instrutivo (*Empty/Guidance State*) caso o board possua menos de 5 dias registrados de histórico.

---

## 2. Contexto Técnico & Requisitos Constitucionais (v1.2.0)

- **Tecnologias**: React 19, TypeScript 5.7+ (Strict Mode), SVG Nativo.
- **Zero Dependências Externas (Princípio V - Simplicidade & YAGNI)**: Todo o gerador estocástico e renderização de histograma implementados diretamente em TypeScript puro e SVG, sem Chart.js ou bibliotecas estatísticas terceiras.
- **Independência Estrita de Marca (Princípio VII)**: Nomenclatura 100% científica e neutra (Simulação de Monte Carlo, Daniel Vacanti, Frank Vega, Padrão NIST). Zero menção a marcas concorrentes.
- **Performance (NFR-001)**: Execução de 10.000 ensaios em tempo $\le 100\text{ ms}$.

---

## 3. Estrutura de Arquivos e Módulos

```
src/
├── utils/
│   ├── monteCarlo.ts                 [NEW] Motor de simulação estocástica e amostragem
│   └── statistics.ts                 [REUSED] Utilitários existentes de cálculo de percentis
├── hooks/
│   └── useMonteCarloData.ts          [NEW] Extração do histórico diário de Throughput do board
├── components/
│   ├── charts/
│   │   └── MonteCarloHistogramChart.tsx [NEW] Histograma e CDF em SVG nativo responsivo
│   ├── MonteCarloSimulationView.tsx  [NEW] Painel completo com formulário e cards de percentil
│   ├── AnalyticsNavHeader.tsx        [MODIFY] Adicionar aba 'forecasting'
│   ├── AnalyticsDashboard.tsx        [MODIFY] Renderizar MonteCarloSimulationView na aba
│   └── Analytics.css                 [MODIFY] Estilos dos cards, inputs e histograma
tests/
└── unit/
    ├── monteCarlo.test.ts            [NEW] Testes unitários do motor numérico com semente
    └── MonteCarloSimulationView.test.tsx [NEW] Testes de renderização e interação da UI
```

---

## 4. Detalhamento dos Componentes

### 4.1. Math & Simulation Engine (`src/utils/monteCarlo.ts`)
- `extractDailyThroughput(tasks: TaskModel[], historyDays?: number, customRange?: { start: string; end: string }): number[]`:
  - Varre o período calendário dia a dia.
  - Para cada dia, conta quantas tarefas possuem `completedAt` naquela data.
  - Dias sem conclusão recebem valor `0` (essencial para capturar fins de semana/dias ociosos sem viés).
- `runMonteCarloHowMany(throughputHistory: number[], targetDays: number, trials = 10000, rng = Math.random): MonteCarloHowManyResult`:
  - Para cada ensaio $t \in [1..trials]$:
    - Acumula $\sum_{i=1}^{targetDays} \text{amostraComReposição}(throughputHistory)$.
  - Ordena os totais e calcula os percentis 50%, 85% e 95% (onde $P_{xx}$ indica que em $xx\%$ das simulações a entrega foi $\ge$ àquele valor).
  - Agrupa os resultados em frequências para geração do histograma.
- `runMonteCarloWhen(throughputHistory: number[], backlogItemCount: number, startDate = new Date(), trials = 10000, rng = Math.random): MonteCarloWhenResult`:
  - Para cada ensaio $t \in [1..trials]$:
    - Sorteia amostras sucessivas do histórico até que a soma acumulada $\ge backlogItemCount$.
    - Registra a contagem de dias necessários.
  - Ordena as durações e calcula percentis 50%, 85% e 95% de dias e projeta as datas de calendário.
  - Agrupa as durações em frequências para o histograma.

### 4.2. Visual Component & SVG Chart (`MonteCarloHistogramChart.tsx`)
- Renderização SVG responsiva (`viewBox="0 0 800 320"`).
- Barras verticais para cada balde (*bin*) de resultado com gradiente e hover interativo.
- Linhas verticais coloridas:
  - **P50**: Verde Ciano (#06b6d4 / #10b981)
  - **P85**: Âmbar / Laranja (#f59e0b)
  - **P95**: Púrpura / Vermelho (#ec4899 / #ef4444)
- Curva de densidade acumulada sobreposta opcional (linha suave CDF).

### 4.3. UI & Controles (`MonteCarloSimulationView.tsx`)
- Alternador de abas de simulação: `Quantos Itens? (How Many)` vs. `Quando Entregaremos? (When)`.
- Controles reativos com execução imediata ou botão `Rodar Simulação`.
- Indicador visual didático explicando o que significa cada percentil (ex: "85% de probabilidade: Compromisso balanceado recomendado para acordos de nível de serviço").
- Empty state elegante caso o board não tenha histórico suficiente.

---

## 5. Plano de Verificação

### Testes Automatizados (Vitest)
1. **`tests/unit/monteCarlo.test.ts`**:
   - Validação da extração de Throughput diário garantindo que dias vazios recebam valor 0.
   - Validação do motor `runMonteCarloHowMany` com gerador determinístico (LCG/PRNG) conferindo P50, P85 e P95 exatos.
   - Validação do motor `runMonteCarloWhen` com gerador determinístico conferindo a distribuição de dias e datas.
   - Verificação de casos de borda: histórico vazio, zero tarefas, backlog de 0 itens, dias alvo = 0.
2. **`tests/unit/MonteCarloSimulationView.test.tsx`**:
   - Renderização dos modos "How Many" e "When".
   - Interação de alteração de parâmetros e recalculo.
   - Exibição de empty state quando o histórico for insuficiente.
3. **Regressão Global**:
   - Executar a suíte completa garantindo que todos os 219 testes continuem verdes.
