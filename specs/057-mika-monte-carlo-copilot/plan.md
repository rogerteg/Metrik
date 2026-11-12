# Implementation Plan: Mika AI Copilot Preditivo de Monte Carlo

**Branch**: `057-mika-monte-carlo-copilot` | **Date**: 2026-11-05 | **Spec**: [`specs/057-mika-monte-carlo-copilot/spec.md`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/057-mika-monte-carlo-copilot/spec.md)

**Input**: Feature specification from `/specs/057-mika-monte-carlo-copilot/spec.md`

---

## Summary

Esta feature conecta o assistente conversacional inteligente do Metrik (Mika AI) ao motor preditivo estocástico de Monte Carlo da Feature 056. A Mika passa a responder diagnósticos probabilísticos de prazo para Iniciativas e Sprints, avaliar o risco de cumprimento de datas meta, fornecer resumos consolidados de portfólio, simular capacidade de entrega (quantos itens cabem com 85% de certeza) e oferecer atalhos consultivos de navegação direta para o painel analítico.

---

## Technical Context

**Language/Version**: TypeScript 5.6+ / Node.js 20+  
**Primary Dependencies**: React 18+, Lucide React (ícones), Vitest (testes), Vite 6 (bundler)  
**Storage**: LocalStorage (`metrik_mika_chat_${boardId}`) isolado por quadro Kanban com histórico FIFO de 30 mensagens  
**Testing**: Vitest (`npm test`), Testing Library (`@testing-library/react`), TypeScript strict type checking (`npx tsc --noEmit`)  
**Target Platform**: Navegadores modernos (Desktop e Mobile responsivo), operação 100% Local-First  
**Project Type**: Single Page Application (SPA) / Frontend modular com TypeScript  
**Performance Goals**: Resposta do motor heurístico local offline em $< 10\text{ ms}$; compilação de telemetria estocástica em $< 15\text{ ms}$  
**Constraints**: 
- Limite estrito de $\le 400$ linhas por arquivo de código e stylesheet (Constituição II).
- Caráter estritamente consultivo (*Read-Only*, zero mutação autônoma no quadro — Constituição X).
- Operação autônoma 100% offline com fallback automático caso Gemini falhe (Constituição VIII e X).
- Zero menções a marcas de ferramentas concorrentes (Constituição VII).  
**Scale/Scope**: Quadros com até milhares de tarefas, múltiplas iniciativas ativas e simulação de 10.000 iterações de Monte Carlo.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Status | Mecanismo de Garantia na Feature 057 |
|:---|:---:|:---|
| **I. Spec-Driven Development** | **PASS** | Ciclo SDD completo: `spec.md` ratificado, `plan.md` em estruturação, `tasks.md` precedido pelos 6 Modelos Analíticos. |
| **II. Teto Modular ($\le 400$ linhas)** | **PASS** | Criação de módulos especializados (`mikaMonteCarloContext.ts` e `mikaMonteCarloHeuristics.ts`) para impedir sobrecarga de arquivos existentes. Verificado por `moduleLineCountGuard.test.ts`. |
| **III. Testes Automatizados** | **PASS** | Suíte de testes unitários dedicada cobrindo telemetria, heurísticas, renderização de ações e fallback com zero falhas. |
| **IV. Observabilidade & Logs** | **PASS** | Prefixos padronizados `[Metrik Mika]` e `[Metrik Monte Carlo]` com contexto diagnóstico estruturado. |
| **V. Simplicidade & YAGNI** | **PASS** | Reutilização direta das funções puras de Monte Carlo existentes (`resolveBacklogScope`, `validateThroughputSample`, `calculateTargetDateProbability`). |
| **VI. Modelos de Raciocínio Pré-Tarefas** | **PASS** | Obrigatório antes de qualquer decomposição em `tasks.md`. |
| **VII. Independência de Marca** | **PASS** | Vocabulário estritamente lean/estocástico (Percentis P85/P95, Vazão Histórica, NIST, SLE). Zero menções a terceiros. |
| **VIII. Local-First Sovereignty** | **PASS** | Motor heurístico offline operando em sub-10ms sem dependência de nuvem. |
| **IX. Integridade de Dados** | **PASS** | Histórico de chat preservado com confirmação explícita de limpeza. |
| **X. Mika AI Safety & Caráter Consultivo** | **PASS** | Zero mutação de cartões, colunas ou prazos; botões e chips meramente consultivos. |

---

## Project Structure

### Documentation (this feature)

```text
specs/057-mika-monte-carlo-copilot/
├── spec.md                     # Especificação clarificada (FR-001 a FR-010, SC-001 a SC-004)
├── checklists/
│   └── requirements.md         # Checklist de qualidade (11/11 verificados)
├── research.md                 # Decisões arquiteturais e decomposição modular
├── data-model.md               # Entidades, telemetria e extensão do chat
├── contracts/
│   └── mika-forecast-contracts.ts # Interfaces TypeScript formais
├── quickstart.md               # Cenários de teste e validação
├── plan.md                     # Este plano de implementação
└── tasks.md                    # Próximo artefato: lista de tarefas executáveis
```

### Source Code Impacted & Created

```text
src/
├── types/
│   └── mika.ts                            # Extensão com MikaMonteCarloTelemetry e MikaForecastActionPayload
├── services/
│   └── ai/
│       ├── mikaMonteCarloContext.ts       # [NOVO] Compilador de telemetria estocástica do quadro
│       ├── mikaMonteCarloHeuristics.ts    # [NOVO] Motor heurístico determinístico para intenções de Monte Carlo
│       ├── mikaContextBuilder.ts          # Injeção da telemetria estocástica no contexto geral e prompt Gemini
│       └── mikaChatHeuristicEngine.ts     # Roteamento de intenções estocásticas para o sub-motor
├── components/
│   └── Mika/
│       ├── MikaChatInterface.tsx          # Adição de Quick Prompts preditivos e repasse de onNavigateToForecast
│       ├── MikaMessageContent.tsx         # Renderização do botão de ação consultiva (CTA)
│       └── MikaDrawer.tsx                 # Propagação do handler de navegação consultiva
├── App.tsx                                # Handler onNavigateToForecast: fecha drawer e troca para tab 'forecasting'

tests/
└── unit/
    ├── mikaMonteCarloContext.test.ts      # [NOVO] Testes do compilador de telemetria estocástica
    ├── mikaMonteCarloHeuristics.test.ts   # [NOVO] Testes do motor determinístico offline de Monte Carlo
    ├── mikaContextBuilder.test.ts         # Testes de integração de telemetria no prompt
    └── MikaChatInterface.test.tsx         # Testes de UI para Quick Prompts e botões de ação consultiva
```

---

## Complexity Tracking

*Nenhuma violação ou exceção arquitetural necessária. O design atende 100% dos princípios constitucionais.*
