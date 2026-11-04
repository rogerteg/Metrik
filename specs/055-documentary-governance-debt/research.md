# Research & Technical Decisions: 055 — Governança Documental & Eliminação de Dívida Técnica

**Date**: 2026-11-04  
**Feature**: `055-documentary-governance-debt`  

---

## 1. Mapeamento de Estado das Especificações (`specs/*/spec.md`)

### Contexto & Problema
A auditoria cruzada entre a linha principal (`main`) e os arquivos de especificação revelou que:
- **`specs/001` a `specs/042`**: Ratificadas com `**Status**: Implemented & Verified (2026-10-21)`.
- **`specs/044` a `specs/047`**: Ratificadas com `**Status**: Implemented & Verified (2026-10-21)`.
- **`specs/048-mika-ai-flow-copilot`**: Consta como `Draft`, mas possui implementação física ativa (`src/components/Mika/`, telemetria de fluxo e testes).
- **`specs/049-modular-decomposition`**: Consta como `Draft`, mas a decomposição modular de `App.tsx` e `useTaskCollection` foi totalmente entregue e verificada com `moduleLineCountGuard.test.ts`.
- **`specs/050-artifact-governance-reconciliation`**: Consta como `Draft`, embora todos os contratos e scripts de reconciliação de outubro de 2026 tenham sido entregues.
- **`specs/051-exportable-flow-reports`**: Ratificada com `**Status**: Implemented & Verified (2026-11-02)`.
- **`specs/052-mika-ai-chat`**: Ratificada com `**Status**: Implemented & Verified (2026-11-02)`.
- **`specs/053-flow-automation-policies`**: Consta como `Draft`, embora suas 34 tarefas estejam concluídas e testadas (`flowRulesEngine.ts`, `useFlowRules.ts`, `ColumnPolicyModal.tsx`, 34 testes dedicados).
- **`specs/054-dynamic-sle-predictive-alerts`**: Ratificada com `**Status**: Implemented & Verified (2026-11-03)`.
- **`specs/043-system-health-and-roadmap`**: Consta como `Draft`, com diagnóstico defasado de 08/10/2026.

### Decisão Técnica 1
Reconciliar especificamente as features entregues `048`, `049`, `050` e `053` para o status canônico `**Status**: Implemented & Verified (<data>)`:
- `specs/048/spec.md` → `Implemented & Verified (2026-10-21)`
- `specs/049/spec.md` → `Implemented & Verified (2026-10-21)`
- `specs/050/spec.md` → `Implemented & Verified (2026-10-21)`
- `specs/053/spec.md` → `Implemented & Verified (2026-11-02)`
- `specs/043/spec.md` → `Implemented & Verified (2026-11-04)` após a atualização de `vision.md`.
Apenas a Feature `055` permanecerá com `Status: Draft` até que suas tarefas sejam implementadas e verificadas.

---

## 2. Estratégia de Sincronização de Issues no GitHub para a Feature 053

### Contexto & Problema
Na Feature 053, o ciclo de TDD e implementação foi concluído localmente com sucesso, mas o comando `/speckit-taskstoissues` não foi disparado antes de iniciar a Feature 054. Como resultado:
- A última issue da Feature 052 no GitHub foi a **#453**.
- A primeira issue da Feature 054 no GitHub foi a **#454**.
- As 34 tarefas da Feature 053 não possuem representação pública no repositório `rogerteg/Metrik`.

### Decisão Técnica 2
Executar um script automatizado via GitHub CLI (`gh`) que:
1. Itera sobre as 34 tarefas de `specs/053-flow-automation-policies/tasks.md` (T001 a T034).
2. Cria cada issue com o título canônico: `[Feature 053] T###: <descrição>`.
3. Popula o corpo da issue com links para a especificação, plano, fase e status `Concluída ([x])`.
4. Imediatamente encerra a issue com `gh issue close`, registrando o comentário formal de auditoria.
As novas issues receberão números a partir de `#481`, fechando a lacuna de governança sem reescrever histórico git.

---

## 3. Diagnóstico Atual do Sistema em Novembro de 2026 (`vision.md`)

### Contexto & Comparativo Factual
O diagnóstico anterior de `vision.md` (datado de 08/10/2026) reportava:
- 701 testes no Vitest (com 5 falhas determinísticas por relógio em `wipAgingMetrics.test.ts` e `sprintBurndown.test.ts`).
- 40 avisos no linter.
- Cobertura inerte / não configurada.
- 42 funcionalidades no catálogo.

### Estado Factual Medido em 04/11/2026:
- **Testes Automatizados**: 🟢 **150 arquivos de teste aprovados (150/150)**, **926 testes unitários e de integração verdes (926/926)**, 0 falhas, 0 regressões.
- **Análise Estática (Linter)**: 🟢 **0 erros**, 0 avisos bloqueantes.
- **Build de Produção**: 🟢 Aprovado em 4.21 segundos pelo Vite (sem erros de TypeScript).
- **Formatação de Código**: 🟢 100% aderente ao Prettier (`npm run format:check`).
- **Governança de Tamanho de Código (Constituição II)**: 🟢 Todos os arquivos rigorosamente abaixo de 400 linhas (inclusive `src/App.tsx` com 386 linhas, validado em `moduleLineCountGuard.test.ts`).
- **Funcionalidades Entregues**: 54 funcionalidades formalmente especificadas e ativas.

### Decisão Técnica 3
Atualizar `specs/043-system-health-and-roadmap/vision.md` preservando a narrativa histórica de evolução:
- Marcar as oportunidades anteriores como resolvidas:
  - `[x] OPP-007 (Restaurar o verde da suíte)` — Resolvida na Feature 044 (0 falhas).
  - `[x] OPP-008 (Reescrever a documentação de entrada)` — Resolvida na Feature 045 (README limpo).
  - `[x] OPP-009 / OPP-010 (Vazamento de marcas e reconciliação)` — Resolvida na Feature 050.
  - `[x] OPP-014 (Decomposição modular de App.tsx)` — Resolvida na Feature 049.
- Adicionar os novos horizontes analíticos ao roadmap:
  - Projeção de Throughput com Monte Carlo Preditivo acoplado a SLE.
  - Matriz de Decomposição Touch Time vs. Wait Time (eficiência de fluxo por estágio).

---

## 4. Atualização da Memória Viva (`lessons-learned.md` & `project-context.md`)

### Decisão Técnica 4
Incorporar os seguintes aprendizados fundamentais acumulados nas Features 053 e 054:
1. **Blindagem contra Skew Temporal em Testes de Métricas Dinâmicas**:
   - Funções e hooks que computam aging (`useDynamicSle`, `predictCardSle`, `useFlowRulesTimer`) DEVEM receber um parâmetro opcional `referenceDate?: Date`. Em testes, passar uma data estática alinhada aos dados mockados para garantir determinismo absoluto em qualquer relógio.
2. **Prevenção de Loops e Cascatas em Motores de Regras Reativas**:
   - Mutações geradas por automação devem carregar uma flag interna `isAutomated: true` e respeitar uma trava de profundidade única (`depth = 1`) para impedir recursões infinitas entre regras interdependentes.
3. **Cálculo Estatístico de Percentis Não-Paramétricos (NIST)**:
   - Tempos de ciclo em Lean/Kanban são variáveis de cauda longa não-gaussianas. O cálculo empírico ordenado via NIST (método $R_6$ / interpolação linear) é a única base matematicamente coerente para SLAs e SLEs.
   - Amostras inferiores a 5 tarefas (`sampleSize < 5`) devem declarar estado `insufficient_data` e silenciar alarmes precoces.

---

## 5. Gate Contínuo em `documentaryGovernance.test.ts`

### Decisão Técnica 5
Modificar o teste unitário `tests/unit/documentaryGovernance.test.ts`:
- Remover a antiga lista estática `inProgressFeatures = [48, 49, 50]`.
- Varrer dinamicamente todas as pastas `specs/` de `001` a `054` e verificar que todas contêm `**Status**: Implemented & Verified`.
- Validar que apenas pastas de features ativamente em desenvolvimento (`specs/055`) exibam `Status: Draft`.
- Assegurar que nenhum arquivo de spec contenha marcadores `[NEEDS CLARIFICATION]`.
- Validar conformidade com a Constituição VII (zero marcas de concorrentes nos títulos e cabeçalhos).

