# Quickstart & Verification Guide: 056 — Simulação de Monte Carlo Preditiva de Backlog & Épicos

Este guia detalha como executar e validar os testes e cenários de uso da simulação de Monte Carlo para escopos de Backlog e Épicos.

---

## 1. Executar Testes Automatizados Unitários

Para validar os algoritmos de agrupamento de escopo, probabilidade de data meta e resguardo amostral:

```bash
# Executar testes unitários do motor de previsão de backlog
npx vitest run tests/unit/monteCarloForecast.test.ts

# Executar testes do hook reativo useBacklogForecast
npx vitest run tests/unit/useBacklogForecast.test.ts

# Executar testes de integração de componentes de interface
npx vitest run tests/unit/BacklogForecastPanel.test.tsx
```

**Resultado esperado:**
- Todos os testes passam com 100% de sucesso.
- O cálculo estocástico de probabilidade é validado com precisão e tolerância de margem empírica ($\pm 1.5\%$).
- O resguardo amostral para $N < 10$ dias é verificado ativando mensagens instrutivas de dados insuficientes.

---

## 2. Validação da Guarda Constitucional de Tamanho de Módulos (Constituição II)

Garantir que nenhum novo módulo ultrapassa o teto de 400 linhas:

```bash
npx vitest run tests/unit/moduleLineCountGuard.test.ts
```

**Resultado esperado:**
- Todos os 5 testes passam verde.
- `BacklogForecastPanel.tsx`, `useBacklogForecast.ts` e `monteCarloForecast.ts` respeitam estritamente $\le 400$ linhas.

---

## 3. Validação do Fluxo Manual na Interface

1. **Acessar o Painel Analítico**:
   - Abrir o quadro com tarefas concluídas em diferentes dias.
   - Navegar até o painel analítico de Monte Carlo (`MonteCarloSimulationView`).
   - Clicar na nova aba **"📦 Previsão de Backlog & Épicos"**.
2. **Selecionar uma Iniciativa ou Sprint**:
   - Escolher um Épico no menu suspenso.
   - Observar a lista de cartões pendentes carregada automaticamente.
   - A Data Meta deve ser pré-preenchida com o `dueDate` do Épico.
3. **Avaliar Riscos e Prazos**:
   - Verificar os cartões com as datas P50, P85 e P95.
   - Observar o selo de risco (Verde/Amarelo/Vermelho) e a porcentagem de probabilidade calculada.
4. **Simular Cenário de Contingência (What-If)**:
   - Desmarcar 2 cartões da lista de tarefas pendentes.
   - Constatar que a quantidade de itens é recalculada instantaneamente e as datas de término se tornam mais próximas.

