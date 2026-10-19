# Tasks: Higiene Documental do README e Conformidade de Marcas (Ciclo 2)

**Feature**: `045-readme-brand-hygiene`  
**Input**: [spec.md](./spec.md) | [plan.md](./plan.md) | [research.md](./research.md) | [data-model.md](./data-model.md) | [quickstart.md](./quickstart.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório per Constitution VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades Fundamentais Irredutíveis:**
  1. A documentação primária de um repositório (`README.md`) é um contrato de comunicação: se descreve outra stack e outra finalidade, quebra a premissa de *living documentation* exigida pelo Princípio II da Constituição.
  2. Nenhuma menção a marcas concorrentes ou referências externas deve persistir na árvore de diretórios públicos ou artefatos de entrega (Princípio VII.1 - "Zero Third-Party Brand Leaks").
  3. A renomeação de um diretório de especificação histórica (`specs/016`) não pode quebrar links relativos nem introduzir referências órfãs.
  4. O README deve orientar tanto a execução imediata do produto quanto a contribuição via Spec-Driven Development (SDD).

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Cenários Hipotéticos de Falha:**
  - *Falha 1 (Links Quebrados em Documentos):* Renomear a pasta da feature 016 sem atualizar referências nos arquivos internos causa quebra de navegação na documentação.
    - *Mitigação:* Mapeamento prévio exato com ripgrep (`T001`) e atualização síncrona de todos os arquivos internos (`T007`).
  - *Falha 2 (Divergência entre Scripts do README e package.json):* Documentar comandos que não existem no `package.json` ou com parâmetros incorretos.
    - *Mitigação:* Confronto estrito com os scripts reais de `package.json` (`dev`, `build`, `test`, `test:coverage`, `lint`, `format:check`).
  - *Falha 3 (Vazamento Residual de Marcas):* Manter menções a nomes proprietários em comentários ou textos secundários.
    - *Mitigação:* Validação automatizada pós-implementação garantindo zero ocorrências de termos externos.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas (ME):**
  - Fase 2 e 4 tratam exclusivamente da renomeação física da pasta 016 e da atualização de suas referências internas.
  - Fase 3 e 5 tratam exclusivamente da redação estruturada das seções do `README.md`.
  - Fase 6 trata da validação de estilo, links e formatação.
- **Coletivamente Exaustivas (CE):**
  - A união de todas as tarefas cobre 100% dos requisitos funcionais (FR-001 a FR-006) e dos critérios de sucesso (SC-001 a SC-004) de `spec.md`.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Ramo A (Manter pasta 016 com redirect ou symlink):**
  - *Poda:* Descartado porque a Constituição VII exige a eliminação total do nome proprietário em caminhos de arquivos.
- **Ramo B (README Misto / Legado + Novo):**
  - *Poda:* Descartado porque a solução Python original não existe mais no produto ativo; manter menção geraria confusão.
- **Ramo C Escolhido (Substituição Integral e Limpa):**
  - *Critério de Escolha:* Restaura transparência absoluta sobre a aplicação real (React 19/TS/Vite/Supabase).

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Falha Demonstrável (Red Bar):**
  - `grep -i "python" README.md` encontra referências à linguagem antiga.
  - `Test-Path specs/016-clean-board-layout-businessmap` retorna `True` (violação do Princípio VII).
- **Critério Determinístico de Aceite (Green Bar):**
  - `grep -i "python" README.md` retorna zero ocorrências de dependência da stack.
  - `Test-Path specs/016-clean-board-layout-minimalist` retorna `True`.
  - `Test-Path specs/016-clean-board-layout-businessmap` retorna `False`.
  - `npm run format:check` conclui com sucesso (código 0).

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - *Princípio II (Living Documentation):* O README documenta o sistema factual.
  - *Princípio VII (Brand Independence):* Elimina o vazamento de marca na feature 016.
  - *Princípio V (Simplicity):* Redação limpa, objetiva e orientada a valor.

---

## Phase 1: Setup & Levantamento de Referências

**Purpose**: Mapear ocorrências e preparar o ambiente de edição documental

- [x] T001 Mapear todas as ocorrências de 016-clean-board-layout-businessmap no repositório antes da renomeação

---

## Phase 2: Foundational (Renomeio do Diretório de Especificação)

**Purpose**: Sanar o vazamento de marca proprietária de terceiro conforme o Princípio VII

- [x] T002 Renomear o diretório specs/016-clean-board-layout-businessmap para specs/016-clean-board-layout-minimalist

---

## Phase 3: User Story 1 - Documentação de Entrada Fiel ao Produto Real (Priority: P1) 🎯 MVP

**Goal**: Reinscrever o README.md com a visão geral, capacidades científicas de fluxo, arquitetura Local-First e comandos reais.

**Independent Test**: Inspecionar o README.md e validar que descreve a aplicação React 19/TS/Vite/Supabase com 100% de paridade com `package.json`.

- [x] T003 [US1] Redigir cabeçalho com badges atualizados e visão geral do produto em README.md
- [x] T004 [US1] Documentar o catálogo completo de métricas de fluxo (CFD, Dispersão, Monte Carlo, WIP Aging, Throughput, Sprints) em README.md
- [x] T005 [US1] Documentar a arquitetura Local-First, sincronização híbrida Supabase e modelo TBAC em README.md
- [x] T006 [US1] Incluir guia de instalação e comandos reais de desenvolvimento (dev, test, coverage, build, lint) em README.md

**Checkpoint**: README.md reflete integralmente o produto real.

---

## Phase 4: User Story 2 - Conformidade Estrita de Identidade e Marcas (Priority: P1)

**Goal**: Atualizar as referências internas da feature 016 para o novo nome agnóstico `minimalist`.

**Independent Test**: Validar que nenhum arquivo sob `specs/016-clean-board-layout-minimalist/` contém o termo proprietário no caminho ou títulos.

- [x] T007 [P] [US2] Atualizar referências internas em specs/016-clean-board-layout-minimalist/spec.md, plan.md, research.md, quickstart.md e checklists/requirements.md
- [x] T008 [US2] Atualizar referências da feature 016 em specs/045-readme-brand-hygiene/spec.md e plan.md

**Checkpoint**: Zero vazamentos de marcas proprietárias no repositório.

---

## Phase 5: User Story 3 - Guia de Governança e Contribuição SDD (Priority: P2)

**Goal**: Incluir seção explicativa sobre a metodologia Spec-Driven Development e a Constituição do projeto no README.md.

**Independent Test**: Verificar a presença da seção de governança e comandos do SpecKit no README.md.

- [x] T009 [US3] Adicionar seção de Governança SDD, SpecKit e Princípios da Constituição em README.md

---

## Phase 6: Polish & Validação Integrada

**Purpose**: Verificações finais de links e formatação

- [x] T010 [P] Executar npm run format para assegurar conformidade Prettier em README.md e nas specs
- [x] T011 Executar o cenário de validação rápida documentado em specs/045-readme-brand-hygiene/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Inicia imediatamente.
- **Phase 2 (Foundational)**: Executa após Phase 1 e desbloqueia Phase 4.
- **Phase 3 (User Story 1 - MVP)**: Pode executar em paralelo com Phase 2.
- **Phase 4 (User Story 2)**: Depende do renomeio em Phase 2.
- **Phase 5 (User Story 3)**: Complementa o README.md de Phase 3.
- **Phase 6 (Polish)**: Depende de todas as alterações textuais.

### Parallel Opportunities
- T003-T006 (README) podem ser desenvolvidos em paralelo com T007 (Specs 016).
- T010 e T011 validam o resultado final.

---

## Implementation Strategy: MVP First
1. Renomear a pasta e atualizar referências da Feature 016 (`T001`, `T002`, `T007`).
2. Redigir o novo `README.md` completo (`T003` a `T006`, `T009`).
3. Formatar e validar com Prettier e quickstart (`T010`, `T011`).
