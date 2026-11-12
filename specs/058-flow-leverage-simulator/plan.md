# Implementation Plan: Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso

**Branch**: `058-flow-leverage-simulator` | **Date**: 2026-11-12 | **Spec**: [`specs/058-flow-leverage-simulator/spec.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/058-flow-leverage-simulator/spec.md)

**Input**: Feature specification from `/specs/058-flow-leverage-simulator/spec.md`

---

## Summary

Esta feature eleva o Metrik ao patamar prescritivo de inteligência de fluxo: combina o motor estocástico de Monte Carlo, a Lei de Little ($WIP = Throughput \times Cycle\ Time$) e o grafo acíclico de dependências e bloqueios. O sistema passa a calcular e ranquear o **Custo do Atraso (Cost of Delay)** de impedimentos em cadeia (quantificando dias extras no P85), oferece um **Simulador "What-If" de Políticas de Fluxo** (simulação de redução de WIP e swarming em modo Sandbox) integrado no Hub de Previsão (`MonteCarloSimulationView`), fecha a lacuna de **pré-seleção automática de escopo** nos atalhos consultivos da Mika e entrega o **Top 3 Alavancas do Dia** tanto no painel quanto no chat determinístico offline em sub-10ms.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / Node.js 20+  
**Primary Dependencies**: React 19, Lucide React (ícones), Vitest 3 (testes), Vite 6 (bundler)  
**Storage**: LocalStorage (`localStorage`) isolado por quadro Kanban; estado do simulador estritamente em memória do componente (Sandbox)  
**Testing**: Vitest (`npm test`), Testing Library (`@testing-library/react`), TypeScript strict type checking (`npx tsc --noEmit`), Prettier (`npm run format:check`)  
**Target Platform**: Navegadores modernos (Desktop e Mobile responsivo), operação 100% Local-First offline  
**Project Type**: Single Page Application (SPA) / Frontend modular com TypeScript  
**Performance Goals**:
- Recálculo de alavancas e impacto de cascata na UI em $< 50\text{ ms}$
- Resposta determinística offline no motor heurístico da Mika em $< 10\text{ ms}$
- Renderização instantânea sem travamentos em quadros com centenas de tarefas e dezenas de vínculos  
**Constraints**:
- Limite estrito de $\le 400$ linhas por arquivo de código e stylesheet (Constituição II).
- Caráter estritamente consultivo (*Read-Only*, zero mutações autônomas no quadro — Constituição X).
- Operação autônoma 100% offline mesmo sem Gemini (Constituição VIII e X).
- Zero menções a marcas de ferramentas concorrentes (Constituição VII).  
**Scale/Scope**: Quadros com centenas de tarefas, múltiplos níveis de dependência cruzada e simulações reativas em tempo real.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Mecanismo de Garantia na Feature 058 |
|:---|:---:|:---|
| **I. Spec-Driven Development** | **PASS** | Ciclo SDD completo: `spec.md` ratificado com 4 clarificações resolvidas, `research.md`, `data-model.md`, contratos TypeScript, `quickstart.md` e `plan.md` concluídos. |
| **II. Teto Modular ($\le 400$ linhas)** | **PASS** | Decomposição modular estrita: criação de `flowLeverageEngine.ts`, `FlowLeverageSimulatorPanel.tsx`, `CascadeImpactGraphView.tsx` e `TopLeveragesCard.tsx`. Protegido por `moduleLineCountGuard.test.ts`. |
| **III. Testes Automatizados** | **PASS** | Suíte de testes unitários dedicada para travessia de grafos, detecção de ciclos, cálculo de alavancas pela Lei de Little e integração na Mika AI com cobertura $\ge 70\%$. |
| **IV. Observabilidade & Logs** | **PASS** | Prefixos padronizados `[Metrik Leverage]` e `[Metrik Mika]` com contexto diagnóstico e logs de travessia. |
| **V. Simplicidade & YAGNI** | **PASS** | Reutilização das funções puras existentes (`monteCarloForecast.ts`, `sleCalculator.ts`, `taskRelations.ts`), sem frameworks de grafos ou dependências externas pesadas. |
| **VI. Modelos de Raciocínio Pré-Tarefas** | **PASS** | Obrigatório em `tasks.md` antes da listagem de tarefas de implementação. |
| **VII. Independência de Marca** | **PASS** | Vocabulário estritamente técnico de engenharia de fluxo (Lei de Little, P85, Cost of Delay, Swarming, WIP). Zero menções a concorrentes. |
| **VIII. Local-First Sovereignty** | **PASS** | Motor de alavancas 100% autônomo offline em $< 10\text{ ms}$ sem exigência de nuvem ou chaves externas. |
| **IX. Integridade de Dados** | **PASS** | Modo Sandbox estrito em memória; aplicação de limites de WIP apenas com confirmação voluntária de usuário autorizado. |
| **X. Mika AI Safety & Caráter Consultivo** | **PASS** | Atuação estritamente consultiva: atalhos e botões apenas navegam para o painel com escopo pré-carregado sem alterar dados. |

---

## Project Structure

### Documentation (this feature)

```text
specs/058-flow-leverage-simulator/
├── spec.md                             # Especificação clarificada (FR-001 a FR-009, SC-001 a SC-004)
├── checklists/
│   └── requirements.md                 # Checklist de qualidade (16/16 aprovados)
├── research.md                         # Decisões de algoritmos de cascata e Lei de Little
├── data-model.md                       # Modelos de dados e entidades principais
├── contracts/
│   └── flow-leverage-contracts.ts      # Interfaces TypeScript formais
├── quickstart.md                       # Cenários executáveis de validação
├── plan.md                             # Este plano de implementação
└── tasks.md                            # Próximo artefato: lista de tarefas executáveis
```

### Source Code Impacted & Created

```text
src/
├── types/
│   ├── analytics.ts                    # Extensão com tipos de simulação e alavancas
│   └── mika.ts                         # Inclusão de topLeverages na telemetria estocástica
├── utils/
│   └── flowLeverageEngine.ts           # [NOVO] Funções puras: calculateCascadeImpact, simulatePolicyScenario, rankTopLeverages (<= 280 linhas)
├── services/
│   └── ai/
│       ├── mikaMonteCarloContext.ts    # Enriquecimento da telemetria com topLeverages
│       ├── mikaMonteCarloHeuristics.ts # Roteamento de intenções: alavancas, gargalos e prioridades do dia
│       └── mikaContextBuilder.ts       # Injeção de alavancas nas instruções do Gemini
├── components/
│   ├── MonteCarloSimulationView.tsx    # Suporte ao modo 'leverage' e repasse de escopo
│   ├── MonteCarlo/
│   │   ├── FlowLeverageSimulatorPanel.tsx # [NOVO] Painel do simulador What-If de políticas (<= 250 linhas)
│   │   ├── CascadeImpactGraphView.tsx     # [NOVO] Visualização de impedimentos em cadeia e Cost of Delay (<= 200 linhas)
│   │   └── TopLeveragesCard.tsx           # [NOVO] Card executivo do Top 3 Alavancas (<= 180 linhas)
│   ├── AnalyticsDashboard.tsx          # Repasse de initialScopeType, initialScopeId e slePredictions (<= 395 linhas)
│   └── Mika/
│       └── mikaQuickPrompts.ts         # Inclusão da pílula rápida "🎯 Alavancas de Hoje"
├── App.tsx                             # Fechamento e navegação de forecast com preservação de escopo

tests/
└── unit/
    ├── flowLeverageEngine.test.ts      # [NOVO] Testes do motor puro de alavancas, ciclos e Lei de Little
    ├── FlowLeverageSimulatorPanel.test.tsx # [NOVO] Testes de UI do simulador e Sandbox
    ├── mikaChat.test.tsx               # Testes de integração da intenção de alavancas no chat
    └── moduleLineCountGuard.test.ts    # Validação do teto modular de 400 linhas
```

---

## Complexity Tracking

*Nenhuma violação ou exceção arquitetural necessária. O design atende 100% dos princípios constitucionais.*
