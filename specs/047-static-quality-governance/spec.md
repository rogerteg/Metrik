# Feature Specification: Governança de Qualidade Estática & Arquitetura (Ciclo 4 - P2)

**Feature Branch**: `047-static-quality-governance`

**Created**: 2026-10-16

**Status**: Implemented

**Input**: User description: "User Story 3 (P2 - Governança de Qualidade Estática)"

---

## Contexto e Escopo

Esta especificação formaliza a **Governança de Qualidade Estática & Arquitetura (Ciclo 4 / P2)**, desdobrada diretamente da **User Story 3** do [Documento de Visão e Rumo do Metrik (043-system-health-and-roadmap)](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/043-system-health-and-roadmap/vision.md) e alinhada às cláusulas pétreas da [Constituição do Metrik](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/.specify/memory/constitution.md):
- **Princípio I (Model Integrity)**: Coerência semântica e rastreabilidade total entre especificações e código.
- **Princípio II (Clean Architecture)**: Isolamento estrito de domínio, coesão modular e redução do acoplamento acidental.
- **Princípio III (Automated Quality Gates)**: Prevenção de regressão por travas determinísticas (*ratchets*) e limiares de qualidade no pipeline.
- **Princípio V (Simplicity & YAGNI)**: Soluções nativas e eficientes sem inchaço de dependências.

Com as fundações do pipeline restabelecidas (Ciclo 1 - Feature 044), a identidade e documentação saneadas (Ciclo 2 - Feature 045) e os warnings do linter erradicados com a regra estrita de `any` (Ciclo 3 - Feature 046), o foco desta feature é **reduzir a dívida técnica estrutural de cascata visual, concentração de responsabilidade em módulos e sustentação de métricas de cobertura**.

---

## Clarifications

### Session 2026-10-16

- Q: Como deve ser tratada a redistribuição das regras de estilo do arquivo `src/styles/13-recovered.css` em relação ao manifesto de estilos `src/App.css` e à trava `appCssStructure.test.ts`? → A: Option A — Redistribuir 100% das regras para os módulos de domínio adequados e descontinuar `13-recovered.css`, ajustando o manifesto `App.css` e o teste `appCssStructure.test.ts`.
- Q: Qual deve ser o novo patamar de limiares mínimos (coverage thresholds) configurado em `vite.config.ts` para blindar a cobertura factual alcançada (Statements 86.3%, Branches 79.7%, Functions 62.0%)? → A: Option A — Ajustar para `functions: 60`, `statements: 85`, `lines: 85`, `branches: 78`.
- Q: Qual deve ser o critério de consolidação dos 12 seletores CSS duplicados e a meta para o `DUPLICATE_BASELINE` em `tests/unit/cssDuplicationGuard.test.ts`? → A: Option A — Erradicar 100% dos 12 seletores duplicados, consolidando-os em seus módulos canônicos e reduzindo `DUPLICATE_BASELINE` para zero (`new Set([])`).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deduplicação de Seletores CSS e Integridade da Cascata Visual (Priority: P1) 🎯 MVP

Como desenvolvedor e designer do produto Metrik, quero que os 12 seletores de estilo redundantes/duplicados declarados entre os módulos de estilo em `src/styles/*.css` sejam reconciliados e unificados, para que a cascata de estilos seja previsível, livre de sobrescritas conflitantes e com a trava de regressão zerada.

**Why this priority**: Conforme registrado em `OPP-001`, seletores duplicados aumentam a fragilidade visual em alterações de tema (Dark, Light, High Contrast) e dificultam a manutenção. Reduzir a lista-base da trava `tests/unit/cssDuplicationGuard.test.ts` de 12 para 0 fecha a dívida herdada do arquivo monolítico original.

**Independent Test**: Executar a suíte de testes de integridade CSS (`npx vitest run tests/unit/cssDuplicationGuard.test.ts`) atestando que a contagem de seletores duplicados é reduzida sem regressão no layout ou no comportamento dos três temas visuais.

**Acceptance Scenarios**:

1. **Given** os arquivos de estilo em `src/styles/*.css`, **When** a ferramenta de auditoria de duplicatas é executada, **Then** nenhum dos 12 seletores da lista-base histórica (`.add-column-card`, `.add-column-icon`, `.badge-cycle-time`, `.badge-lead-time`, `.badge-metric-time`, `.btn-add-column`, `.metrik-comment-list`, `.task-blocked-dependency-chip`, `.task-card-header`, `.task-indicator-badge`, `.task-indicators`, `.task-metrics-badges`) possui múltiplas declarações divergentes.
2. **Given** a trava de regressão `DUPLICATE_BASELINE` em `tests/unit/cssDuplicationGuard.test.ts`, **When** a suíte é executada, **Then** o teste é aprovado com zero violações e a baseline de seletores redundantes reflete a redução alcançada.
3. **Given** os temas do Metrik (Light, Dark e High Contrast), **When** os componentes estilizados por esses seletores são inspecionados, **Then** a apresentação visual, espaçamentos, bordas e contraste permanecem idênticos ao design original.

---

### User Story 2 - Decomposição Modular e Redistribuição Coesa de Estilos (Priority: P2)

Como mantenedor da arquitetura, quero redistribuir blocos genéricos de estilização (como `13-recovered.css`) e isolar componentes extensos de interface para que nenhum arquivo exceda os limites de manutenibilidade sem justificativa técnica.

**Why this priority**: Atende às oportunidades `OPP-002` e `OPP-016` da visão. Módulos que agregam regras não relacionadas aumentam a complexidade ciclomática e desaceleram revisões e melhorias incrementais.

**Independent Test**: Inspecionar os módulos de estilo importados no manifesto `src/App.css` e a distribuição de regras de estilo, atestando que cada regra reside no módulo correspondente ao seu domínio sem quebrar a cascata.

**Acceptance Scenarios**:

1. **Given** o manifesto `src/App.css` e os módulos em `src/styles/`, **When** os blocos do arquivo de recuperação (`13-recovered.css`) são analisados, **Then** suas regras são realocadas para os arquivos de domínio corretos (ex: detalhes de tarefas, cartões, modais) com preservação da ordem de especificidade.
2. **Given** o teste de estrutura de estilos `tests/unit/appCssStructure.test.ts`, **When** executado, **Then** passa com sucesso atestando a presença ordenada de todos os módulos importados.
3. **Given** a renderização de cartões, colunas e cabeçalhos, **When** qualquer estado interativo é acionado, **Then** nenhuma propriedade de estilo perde sua declaração.

---

### User Story 3 - Governança de Cobertura de Testes e Limiares Automatizados (Priority: P2)

Como líder técnico e guardião da qualidade, quero que a suíte automatizada de testes produza relatórios de cobertura consistentes e aplique limiares sustentáveis (Statements ≥ 85%, Branches ≥ 78%, Functions ≥ 60%), impedindo que novo código introduza reduções não planejadas na testabilidade da aplicação.

**Why this priority**: Conforme `OPP-006` e `OPP-018`, a governança de cobertura deve ser factual e auditável. Assegurar que `npm run test:coverage` reporte métricas reais e que o pipeline valide esses limites protege o produto contra regressões silenciosas.

**Independent Test**: Executar `npm run test:coverage` e verificar a emissão do resumo e dos arquivos no diretório `coverage/`, assegurando que todos os limiares mínimos declarados são satisfeitos.

**Acceptance Scenarios**:

1. **Given** o ambiente do projeto, **When** o comando `npm run test:coverage` é executado, **Then** ele emite o resumo de cobertura no terminal e grava os relatórios estruturados (LCOV e HTML) no diretório `coverage/`.
2. **Given** os limiares configurados em `vite.config.ts`, **When** a suíte é executada, **Then** todas as métricas verificadas atendem ou superam os patamares mínimos estabelecidos (Statements ≥ 85%, Branches ≥ 78%, Functions ≥ 60%).
3. **Given** a totalidade dos 701 testes unitários existentes, **When** a cobertura é calculada, **Then** 100% dos testes passam sem erros e nenhuma asserção é enfraquecida.

---

## Edge Cases

- **Sobrescrita intencional de especificidade CSS**: Caso algum dos 12 seletores duplicados dependa de cascata para sobrescrever regras anteriores, a unificação deve utilizar seletores com a especificidade exata ou unificar propriedades em uma única regra para evitar quebras em estados `:hover` ou `:focus`.
- **Compatibilidade entre temas no CSS**: Regras unificadas que usam variáveis de tema (`var(--color-...)`) não devem introduzir valores hexadecimais fixos (*hardcoded*) que descaracterizem o modo escuro ou alto contraste.
- **Performance de execução do Coverage**: A instrumentação de cobertura via V8 não deve exceder 45 segundos de execução no ambiente local nem travar processos remotos de CI.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema de estilos MUST unificar e consolidar os 12 seletores duplicados inventariados em `tests/unit/cssDuplicationGuard.test.ts`.
- **FR-002**: A trava de regressão em `tests/unit/cssDuplicationGuard.test.ts` MUST ser atualizada com a nova contagem/lista-base de seletores duplicados, sem permitir acréscimo de novas duplicatas.
- **FR-003**: A ordem dos `@import` no manifesto `src/App.css` MUST manter a ordem de cascata exigida por `tests/unit/appCssStructure.test.ts`.
- **FR-004**: Toda regra de estilo de `src/styles/13-recovered.css` MUST ser redistribuída para os módulos de domínio temáticos correspondentes (`02-task-detail-inline.css`, `08-task-types-links.css`, etc.), descontinuando o arquivo `13-recovered.css` e atualizando o manifesto `src/App.css` e a trava `tests/unit/appCssStructure.test.ts`.
- **FR-005**: O comando `npm run test:coverage` MUST gerar artefatos válidos de relatório em `coverage/` e apresentar resumo completo de Statements, Branches, Functions e Lines.
- **FR-006**: Os limiares de cobertura configurados em `vite.config.ts` MUST refletir o patamar alcançado pelo projeto (Functions ≥ 60%, Statements ≥ 85%, Branches ≥ 78%).
- **FR-007**: Toda refatoração realizada nesta feature MUST preservar a aprovação de 100% dos testes unitários existentes (701 testes) e o build de produção sem erros em menos de 5 segundos.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contagem de seletores CSS duplicados detectados pela trava automática é reduzida de 12 para **0 seletores duplicados** (100% deduplicado).
- **SC-002**: A execução de `npm run test:coverage` produz com sucesso o diretório `coverage/` e atesta cobertura de funções acima de 60% e linhas/declarações acima de 85%.
- **SC-003**: 100% dos testes unitários (701 testes) passam com sucesso em `npm test` sem nenhuma alteração ou enfraquecimento de asserções funcionais.
- **SC-004**: A compilação de produção via `npm run build` completa em menos de 5 segundos com zero avisos ou erros de compilação.
- **SC-005**: O linter `npm run lint` executa limpo com exatamente 0 erros e 0 avisos.

---

## Assumptions

- A unificação dos seletores de CSS não altera as propriedades finais computadas nos nós do DOM.
- As variáveis CSS de temas declaradas em `src/styles/01-design-system-core.css` continuam sendo a fonte canônica para cores, espaçamentos e raios de borda.
- Os testes unitários existentes fornecem proteção ampla contra regressões em renderização e lógica de componentes.
