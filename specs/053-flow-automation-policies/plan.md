# Implementation Plan: Automações de Fluxo & Políticas de Cartão (Flow Rules)

**Branch**: `053-flow-automation-policies` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/053-flow-automation-policies/spec.md`

---

## Summary

Implementar motor visual e declarativo de regras de fluxo sem código (Gatilho → Condições → Ações) e gerenciador de políticas explícitas de entrada/saída de colunas (Definition of Ready / Done) para o Metrik. A solução é 100% Local-First (`localStorage`), com motor de execução puro e determinístico (`flowRulesEngine.ts`), integração transparente nos hooks de movimentação e mutação de tarefas (`useGuardedTaskMove`, `useTaskCollection`), verificação periódica de envelhecimento (WIP Aging) sem impacto na UI, trava anti-recursão de profundidade única e catálogo de templates prontos.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ (Strict mode, ES2022)  
**Primary Dependencies**: React 19, Lucide React (ícones), Vitest  
**Storage**: `localStorage` sob chaves `metrik_flow_rules_${boardId}` e `metrik_column_policies_${boardId}`  
**Testing**: Vitest 3, React Testing Library, JSDOM  
**Target Platform**: Navegadores modernos desktop (Chrome, Firefox, Safari, Edge) com suporte offline  
**Project Type**: Single-Page Application (SPA) Web / Kanban & Flow Analytics  
**Performance Goals**: Avaliação de regras por evento em < 5ms; zero atraso no drag-and-drop; monitoramento temporal em < 10ms  
**Constraints**: 100% Local-First offline; sem chamadas de rede externas; trava anti-loop (depth = 1); zero vazamento de marcas proprietárias (Constituição VII)  
**Scale/Scope**: 1 a 50 regras ativas por quadro Kanban; suporte a exportação/importação em JSON  

---

## Constitution Check

*GATE: Todos os princípios da Constituição do Metrik foram validados e aprovados.*

- **Princípio I (SDD Formal)**: Especificação formal em `spec.md`, plano em `plan.md` e tarefas em `tasks.md` antes de qualquer linha de código produtivo. ✅
- **Princípio II (Clean Code & Artesanato)**: Código limpo, funções pequenas com responsabilidade única, nomes autoexplicativos, sem comentários redundantes. ✅
- **Princípio III (Clean Architecture)**: Separação estrita entre motor puro de avaliação (`src/utils/flowRulesEngine.ts`), gerenciamento de estado e ciclo de vida (`src/hooks/useFlowRules.ts`, `src/hooks/useColumnPolicies.ts`) e componentes de apresentação (`src/components/FlowRules/`, `src/components/ColumnPolicy/`). ✅
- **Princípio IV (Resiliência & Sem Falhas Silenciosas)**: Tratamento de regras corrompidas ou colunas inexistentes com logging estruturado `[Metrik][FlowRules]` e avisos na UI, sem falha silenciosa. ✅
- **Princípio V (TDD First)**: Testes unitários para todas as combinações de gatilhos, operadores de condição, ações e cenários de borda antes da implementação final. ✅
- **Princípio VI (Modelos de Raciocínio Analítico)**: Aplicação obrigatória dos 6 modelos analíticos pré-criação de tarefas em `tasks.md`. ✅
- **Princípio VII (Identidade Própria & Zero Marcas Externas)**: Terminologia 100% neutra e autoral; sem menção a marcas concorrentes no código, UI ou documentação. ✅
- **Princípio VIII (Soberania Local-First)**: Persistência local imediata, zero dependência de nuvem, exportação/importação transparente. ✅
- **Princípio IX (Proteção de Rascunhos)**: Confirmação antes de descartar edição de regras não salvas. ✅
- **Princípio X (Segurança Consultiva de IA)**: Se Mika for consultada sobre automações, opera em modo somente leitura e explicativo. ✅

---

## Project Structure

### Documentation (this feature)

```text
specs/053-flow-automation-policies/
├── spec.md                  # Especificação funcional refinada
├── plan.md                  # Este arquivo (Plano de implementação técnica)
├── research.md              # Decisões de arquitetura e trade-offs analisados
├── data-model.md            # Esquemas de tipos, entidades e máquina de estados
├── quickstart.md            # Roteiro de validação prática e testes
├── contracts/               # Contratos de tipos e funções TypeScript
│   └── flow-rules-contracts.ts
├── checklists/              # Checklist de qualidade dos requisitos
│   └── requirements.md
└── tasks.md                 # Decomposição em tarefas atômicas (próxima fase)
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── flowRules.ts             # Tipos canônicos de regras, gatilhos, condições e ações
│   └── columnPolicy.ts          # Tipos de políticas explícitas de coluna (DoR / DoD)
├── utils/
│   ├── flowRulesEngine.ts       # Motor puro de avaliação de regras e resolução de ações
│   ├── flowRulesTemplates.ts    # Modelos pré-configurados de boas práticas
│   └── flowRulesStorage.ts      # Helpers de serialização, validação e migração local
├── hooks/
│   ├── useFlowRules.ts          # Hook de estado de regras (CRUD, persistência, ativação)
│   ├── useFlowRulesTimer.ts     # Hook leve para avaliação periódica de aging e prazos
│   └── useColumnPolicies.ts     # Hook de persistência de políticas de coluna
├── components/
│   ├── FlowRules/
│   │   ├── FlowRulesModal.tsx       # Modal principal de gerenciamento de automações
│   │   ├── FlowRuleBuilder.tsx      # Formulário construtor (Gatilho -> Condição -> Ação)
│   │   ├── FlowRuleListItem.tsx     # Linha da regra com toggle, contadores e ações
│   │   ├── FlowRuleTemplates.tsx    # Galeria de modelos pré-configurados
│   │   └── FlowRules.css            # Estilos dedicados ao construtor de regras
│   ├── ColumnPolicy/
│   │   ├── ColumnPolicyButton.tsx   # Botão de indicador no cabeçalho da coluna
│   │   ├── ColumnPolicyPopover.tsx  # Popover para leitura rápida de DoR e DoD
│   │   ├── ColumnPolicyModal.tsx    # Modal de edição de critérios de entrada/saída
│   │   └── ColumnPolicy.css         # Estilos das políticas de coluna
│   └── AppHeader.tsx                # Integração do botão de regras de fluxo
└── styles/
    └── (App.css manifest imports)

tests/
├── unit/
│   ├── flowRulesEngine.test.ts      # Testes exaustivos do motor puro
│   ├── flowRulesTemplates.test.ts   # Testes dos templates pré-definidos
│   ├── useFlowRules.test.ts         # Testes de integração do hook de regras
│   ├── useColumnPolicies.test.ts    # Testes do hook de políticas
│   └── ColumnPolicyPopover.test.ts  # Testes de interface do popover
```

**Structure Decision**: Adoção do padrão arquitetural já consolidado no Metrik: modelos puros em `src/types/`, lógica de negócio determinística em `src/utils/`, estado em `src/hooks/` e componentes visuais co-localizados em `src/components/FlowRules/` e `src/components/ColumnPolicy/`.

---

## Complexity Tracking

*Nenhuma violação identificada. A arquitetura segue rigorosamente YAGNI, Local-First e modularidade simples.*
