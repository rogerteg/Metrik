# Research: 054 — Previsibilidade Dinâmica & Alertas de SLE

**Feature**: `054-dynamic-sle-predictive-alerts`  
**Date**: 2026-11-03  
**Status**: Completed  

---

## 1. Contexto & Estado da Arte em Métricas de Fluxo

No framework Kanban e na literatura de análise de fluxo (Daniel Vacanti, *ActionableAgile Analytics for Predictability*), o **Service Level Expectation (SLE)** é a previsão probabilística de tempo de ciclo baseada no histórico de entrega do squad.
Historicamente, o Metrik possui o cálculo de SLE retroativo na aba de Analytics (`calculateSleMetrics` em `src/utils/sleCalculator.ts`), onde analisa itens concluídos.

No entanto, para a equipe no dia a dia do quadro Kanban, **o tempo de ciclo é retroativo, mas o WIP Aging é o tempo presente**. Se um item ultrapassa a mediana histórica (P50), ele já tem menos de 50% de probabilidade de ser entregue tão rápido quanto as tarefas típicas. Se ultrapassa o P85, a expectativa de entrega foi estatisticamente rompida.

Esta feature transforma esse cálculo em **sinalização preditiva em tempo real diretamente nos cartões do quadro**.

---

## 2. Decisões Técnicas & Trade-offs

### Decisão 1: Modelo Matemático dos Percentis de SLE e Limiar de Amostragem

- **Opções Analisadas:**
  - *Opção A: Distribuição Normal (Média + 1 Desvio Padrão).*
    - *Descarte:* Tempos de ciclo em desenvolvimento de software seguem distribuições de cauda longa (Weibull / Lognormal), nunca gaussianas. A média distorce a realidade.
  - *Opção B: Percentis Não-Paramétricos NIST Nearest Rank / Linear Interpolation.*
    - *Escolha:* Já implementado e testado no Metrik via `calculatePercentile` (`src/utils/statistics.ts`).
- **Marcos Percentis Adotados:**
  - **P50 (Mediana):** 50% dos itens foram concluídos neste tempo ou antes.
  - **P85 (SLE Padrão):** 85% dos itens foram concluídos neste tempo ou antes (ponto de corte acordado do squad).
  - **P95 (Cauda Longa / Crítico):** Itens com complexidade atípica ou bloqueios graves.
- **Tamanho Mínimo de Amostra:**
  - Se `completedTasks.length < 5`, a amostra é estatisticamente insuficiente. O motor retorna status `insufficient_data` e o badge permanece discreto ou oculto, sem emitir falsos alertas.

### Decisão 2: Algoritmo de Avaliação do Cartão em Tempo Real

- **Fórmula de WIP Aging:**
  ```typescript
  const elapsedMs = Math.max(0, Date.now() - new Date(task.startedAt || task.createdAt).getTime());
  const agingDays = Number((elapsedMs / (24 * 60 * 60 * 1000)).toFixed(1));
  ```
- **Classificação Determinística de Risco:**
  - `normal`: `agingDays < p50`
  - `warning_p50`: `p50 <= agingDays < p85`
  - `risk_p85`: `p85 <= agingDays < p95`
  - `critical_p95`: `agingDays >= p95`
  - Se houver `customTargetDays` configurado pelo usuário, o `effectiveP85` passa a ser `customTargetDays`, e o `effectiveP50` escala proporcionalmente para preservar a sensibilidade de aviso prévio.

### Decisão 3: Desempenho & Otimização Local-First

- **Complexidade Algorítmica:**
  - Cálculo dos percentis do quadro: $O(N \log N)$ apenas quando o conjunto de tarefas concluídas for alterado (`useMemo`).
  - Avaliação de risco por cartão: $O(1)$ por cartão ativo.
  - Para um quadro típico de 200 cartões (20 em progresso e 180 concluídos), o tempo total de processamento em JavaScript puro é **inferior a 0.5 milissegundos**.
- **Atualização Temporal:**
  - Reavaliação automática disparada pelo temporizador global de fluxo (a cada 60s ou no evento `visibilitychange`).

### Decisão 4: Estrutura Visual & Experiência do Usuário (Design System)

- **Badge no Cartão (`TaskBadges.tsx` / `TaskSleBadge.tsx`):**
  - Discreto, alinhado aos badges de tipo, prioridade e bloqueio existentes.
  - Esquema semântico de cores:
    - 🟡 **P50**: Fundo `rgba(234, 179, 8, 0.15)`, Borda `rgba(234, 179, 8, 0.35)`, Texto `#eab308`. Ícone: `⏳`.
    - 🟠 **P85**: Fundo `rgba(249, 115, 22, 0.15)`, Borda `rgba(249, 115, 22, 0.35)`, Texto `#f97316`. Ícone: `⚠️`.
    - 🔴 **P95**: Fundo `rgba(239, 68, 68, 0.15)`, Borda `rgba(239, 68, 68, 0.35)`, Texto `#ef4444`. Ícone: `🚨`.
- **Popover Analítico Flutuante:**
  - Mini-régua horizontal graduada mostrando o ponto do cartão (Aging atual) em relação a P50, P85 e P95.
  - Exibe claramente: "Aging: 4,2d | SLE P85: 3,5d (+0,7d de estouro)".

### Decisão 5: Persistência e Isolamento por Quadro

- As preferências de sensibilidade do SLE são isoladas por quadro na chave:
  `metrik_sle_config_${boardId}`
- Se corrompida ou ausente, faz fallback transparente e gracioso para os valores padrão sem lançar exceções.

