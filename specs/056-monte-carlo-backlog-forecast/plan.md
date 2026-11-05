# Implementation Plan: 056 — Simulação de Monte Carlo Preditiva de Backlog & Épicos

**Branch**: `056-monte-carlo-backlog-forecast` | **Date**: 2026-11-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/056-monte-carlo-backlog-forecast/spec.md`

---

## Summary

Esta funcionalidade expande o motor de simulação estocástica de Monte Carlo do Metrik para atuar diretamente sobre escopos estruturados de trabalho (Iniciativas/Épicos, Sprints, Tags e colunas do Kanban). O plano compreende:
1. Um resolvedor de escopo em memória (`resolveBacklogScope`) que agrupa cartões pendentes com caixas de seleção (*checkboxes*) para inclusão/exclusão granular.
2. Motor de cálculo de probabilidade de data meta (*Target Date Probability*), avaliando $P(T \le D_{target})$ em 10.000 iterações de Monte Carlo em tempo real (< 2ms).
3. Classificação semântica de risco de entrega (Baixo, Moderado, Alto, Crítico) com resguardo amostral NIST ($N \ge 10$ dias com entregas).
4. Componentização modular (`BacklogForecastPanel`, `useBacklogForecast`, `ForecastScopeCardList`) estritamente abaixo de 400 linhas (Constituição II).
5. Ponto de entrada duplo: aba dedicada no `MonteCarloSimulationView` e botão contextual ("🎲 Previsão de Entrega") no modal de detalhes da Iniciativa.

---

## Technical Context

**Language/Version**: TypeScript 5.7 (ES2022, `strict`, `noUnusedLocals`) + React 19  
**Primary Dependencies**: React 19, Vite 6, Vitest 3, Lucide React (ícones), Testing Library  
**Storage**: Local-First (`localStorage` via estado em memória do quadro ativo), sem persistência externa mandatória  
**Testing**: Vitest (`npm test -- --run`), testes unitários em `tests/unit/monteCarloForecast.test.ts`, `tests/unit/useBacklogForecast.test.ts` e `tests/unit/BacklogForecastPanel.test.tsx`  
**Target Platform**: Navegadores modernos (SPA desktop/mobile responsiva)  
**Project Type**: Módulo analítico de previsão estocástica de fluxo e componentes de interface  
**Performance Goals**: Execução de 10.000 ensaios de Monte Carlo + cálculo de probabilidade de data meta em < 50ms; renderização da lista de escopo com 100+ cartões sem perda de fluidez (60 fps)  
**Constraints**: 
- Limite estrito de $\le 400$ linhas por arquivo de código ou estilo (Constituição II).
- Zero chamadas a APIs de nuvem externas para a simulação; 100% autônomo e offline (Constituição VIII).
- Zero menções a produtos ou marcas comerciais concorrentes (Constituição VII).
- Blindagem temporal obrigatória com suporte a `referenceDate?: Date` (Constituição III).
**Scale/Scope**: Quadros com até 1.000 cartões e séries históricas de até 180 dias de Throughput.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Avaliação de Conformidade | Status |
|---|---|---|
| **I. Especificação Viva (SDD)** | A feature 056 possui especificação formal refinada, clarificações registradas, plano técnico, contratos TypeScript e guia de quickstart. | ✅ APROVADO |
| **II. Modularidade & Linhas de Código** | Todos os novos arquivos (`monteCarloForecast.ts`, `useBacklogForecast.ts`, `BacklogForecastPanel.tsx`, `ForecastScopeCardList.tsx`) foram desenhados com responsabilidade única e terão menos de 280 linhas, respeitando com folga o limite de $\le 400$ linhas da Constituição II. | ✅ APROVADO |
| **III. Verificação Automatizada** | Todas as funções de cálculo e componentes terão testes unitários e de renderização dedicados no Vitest com injeção de `referenceDate` contra skew temporal. A suíte inteira permanecerá 100% verde sem regressões. | ✅ APROVADO |
| **IV. Observabilidade & Sem Falhas Silenciosas** | Cenários de dados insuficientes ou vazão zero emitem diagnósticos estruturados (`[Metrik Forecast]`) e avisos visuais claros ao usuário em vez de falhas silenciosas ou divisão por zero. | ✅ APROVADO |
| **V. Simplicidade & YAGNI** | Reutilização do motor de sorteio estocástico existente de `monteCarlo.ts`, sem adição de novas bibliotecas estatísticas ou frameworks pesados. | ✅ APROVADO |
| **VI. Raciocínio Analítico Pré-Tarefas** | A geração de `tasks.md` via `/speckit-tasks` será antecedida pelos 6 Modelos de Raciocínio Analítico Obrigatórios. | ✅ APROVADO |
| **VII. Independência de Marca** | Toda a terminologia emprega termos científicos padrão (*Monte Carlo*, *Throughput*, *NIST Percentiles*, *Forecast Confidence*). Nenhuma marca comercial concorrente é mencionada. | ✅ APROVADO |
| **VIII. Local-First Sovereignty** | A simulação é executada localmente na thread do navegador utilizando o estado dos cartões do quadro já persistido. Zero dependência de servidores. | ✅ APROVADO |
| **IX. Proteção de Dados do Usuário** | A seleção de escopo para forecast não altera dados, colunas ou posições de cartões; é uma lente analítica puramente de leitura. | ✅ APROVADO |
| **X. Governança de IA (Mika AI)** | A funcionalidade fornece dados analíticos determinísticos que podem ser consumidos pelo copiloto Mika posteriormente de forma não-mutante. | ✅ APROVADO |

---

## Project Structure

### Documentation (this feature)

```text
specs/056-monte-carlo-backlog-forecast/
├── spec.md                  # Especificação funcional com clarificações da sessão 2026-11-04
├── plan.md                  # Este plano técnico de implementação
├── research.md              # Pesquisa e decisões de arquitetura e CDF
├── data-model.md            # Modelos de dados e entidades de previsão de escopo
├── quickstart.md            # Guia rápido de verificação e testes
├── contracts/
│   └── backlog-forecast-contracts.ts # Contratos TypeScript compartilhados
├── checklists/
│   └── requirements.md      # Checklist de qualidade da especificação (16/16 aprovados)
└── tasks.md                 # Decomposição atômica de tarefas (gerado em /speckit-tasks)
```

### Source Code & Test Structure (impacted files)

```text
src/
├── utils/
│   └── monteCarloForecast.ts    # Funções puras: resolveBacklogScope, calculateTargetDateProbability, validateThroughputSample
├── hooks/
│   └── useBacklogForecast.ts    # Hook especialista de estado e execução da previsão de escopo
├── components/
│   ├── MonteCarlo/
│   │   ├── BacklogForecastPanel.tsx     # Painel principal de previsão de backlog e épicos
│   │   ├── ForecastScopeCardList.tsx    # Lista com checkboxes de cartões e selos de SLE dinâmico
│   │   └── TargetDateRiskBadge.tsx      # Badge visual com cor e probabilidade calculada
│   ├── MonteCarloSimulationView.tsx     # Adição da aba "Previsão de Backlog" e integração
│   └── TaskDetails/
│       └── TaskDetailsModal.tsx         # Botão de atalho "🎲 Prever Término" para itens do tipo Iniciativa
└── styles/
    └── 14-monte-carlo-forecast.css      # Estilos visuais encapsulados para o painel de forecast

tests/unit/
├── monteCarloForecast.test.ts           # Testes unitários do motor estocástico e probabilidade
├── useBacklogForecast.test.ts           # Testes unitários do hook reativo
└── BacklogForecastPanel.test.tsx        # Testes de integração e interação da interface
```

---

## Complexity Tracking

> **Zero violações constitucionais identificadas.**  
> A solução adota decomposição modular em 4 arquivos especialistas para manter cada arquivo rigorosamente abaixo de 300 linhas (Constituição II). Reutiliza a infraestrutura de `monteCarlo.ts` sem instalar novas dependências (Constituição V).
