# Tasks: Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso

**Feature**: `058-flow-leverage-simulator`  
**Input**: Design documents from `/specs/058-flow-leverage-simulator/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/flow-leverage-contracts.ts`, `quickstart.md`  

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades fundamentais e invariantes:**
  - O fluxo em sistemas Kanban é governado pela relação matemática estrita da Lei de Little ($WIP = Throughput \times Cycle\ Time$): em estado estacionário, diminuir o trabalho em progresso ou desbloquear itens acumulados reduz diretamente o tempo médio de ciclo da fila.
  - O grafo de dependências entre tarefas (`blocks`, `is_blocked_by`, `parent`, `child`) pode conter ciclos acidentais em dados inseridos por usuários. O algoritmo de travessia precisa ser estritamente acíclico com pilha de recursão para detecção e corte imediato de laços, operando de forma 100% determinística.
  - A operação deve ser 100% Local-First e offline (Constituição VIII e X): todos os cálculos de impacto em cascata, alavancas e simulação "What-If" devem rodar localmente no navegador em $< 50\text{ ms}$ (UI) e $< 10\text{ ms}$ (Mika AI), sem dependência de chaves de API ou conexão à internet.
  - O modo de simulação de políticas é estritamente consultivo e isolado em memória (Sandbox — Constituição X). Qualquer alteração no quadro exige confirmação explícita de usuário autorizado, nunca mutações autônomas silenciosas.
- **Premissas acidentais descartadas:**
  - Eliminada a necessidade de simulação de Monte Carlo completa de 10.000 iterações para cada nó de bloqueio isolado; isso geraria sobrecarga inaceitável em quadros com dezenas de impedimentos. O impacto no P85 é derivado da combinação calibrada do tempo de bloqueio, profundidade de dependência e SLE histórico da equipe.
  - Descartada a criação de uma nova categoria superior no menu do Analytics que estouraria o limite de 400 linhas de `AnalyticsDashboard.tsx`. O simulador será uma aba/modo especializada dentro do Hub de Previsão (`MonteCarloSimulationView.tsx`).

### 2. Análise Pré-Mortem & Inversão (*Premortem & Inversion*)
- **Cenários de falha antecipados:**
  1. *Travamento do Navegador por Dependências Circulares*: Se um usuário vincular a Tarefa A bloqueando B e B bloqueando A, uma busca em profundidade recursiva sem guarda entraria em loop infinito (*Maximum call stack size exceeded*).
  2. *Estouro do Teto Modular de 400 Linhas*: `AnalyticsDashboard.tsx` (já em 388 linhas) ou `MonteCarloSimulationView.tsx` (369 linhas) romperem o limite constitucional da Constituição II ao incorporar novas telas de simulação.
  3. *Mutação Acidental de Políticas do Quadro Real*: Testes no simulador de WIP alterarem acidentalmente o estado permanente das colunas sem que o usuário perceba.
  4. *Ruptura de Limiar de Cobertura Global (70%)*: Adição de centenas de linhas de código de simulação sem cobertura proporcional de testes derrubar a suíte abaixo do limiar constitucional de 70.0%.
- **Mitigações desenhadas nas tarefas:**
  1. *Guarda de Ciclo DFS com Rastreamento de Pilha*: O motor `flowLeverageEngine.ts` implementa conjunto de visitados e pilha de recursão com marcação de `hasCycle: true` (T003, T004).
  2. *Decomposição Modular Cirúrgica*: Criação de subcomponentes específicos (`FlowLeverageSimulatorPanel.tsx`, `CascadeImpactGraphView.tsx`, `TopLeveragesCard.tsx`) todos abaixo de 250 linhas (T008, T011, T015).
  3. *Sandbox Estritamente em Memória*: Estado simulado via `useState` local isolado; botão de aplicação exige clique voluntário com confirmação modal e checagem de permissão (`!isGuest`) (T011).
  4. *TDD Red-Bar First*: Testes unitários para todas as funções puras antes da implementação, garantindo cobertura de funções $\ge 70\%$ mantida e comprovada (T003, T007, T010, T014, T017, T025).

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua (Zero Duplicação):**
  - `flowLeverageEngine.ts`: Dedicado puramente aos cálculos matemáticos da Lei de Little, travessia de grafos e ranqueamento de alavancas (zero JSX/DOM).
  - `FlowLeverageSimulatorPanel.tsx`: Cuida exclusivamente da interface de controle dos parâmetros de WIP simulado e alternância de Swarming.
  - `CascadeImpactGraphView.tsx`: Apresenta unicamente a árvore visual de tarefas retidas por impedimentos e profundidade.
  - `TopLeveragesCard.tsx`: Renderiza exclusivamente o card sintético das 3 principais alavancas para exibição no dashboard geral.
- **Exaustão Coletiva (Cobertura 100%):**
  - Cobre 100% dos requisitos funcionais (FR-001 a FR-009) e histórias de usuário (US1: Cascata de Bloqueios e Custo do Atraso; US2: Simulador What-If de Políticas; US3: Top 3 Alavancas na Mika AI e Continuidade de Navegação).

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts*)
- **Caminhos de arquitetura avaliados:**
  - *Opção A*: Adicionar nova categoria superior `'leverage'` no menu do Analytics.
  - *Opção B*: Integrar como uma aba/modo especializado (`'leverage'`) no Hub de Previsão (`MonteCarloSimulationView.tsx`).
- **Critério de poda e trade-offs:**
  - A Opção A foi podada porque `AnalyticsDashboard.tsx` já possui 388 linhas; adicionar novos seletores de categoria empurraria o arquivo para ~430 linhas, violando o Artigo II da Constituição. Além disso, dispersaria a inteligência preditiva para fora do hub de Monte Carlo.
  - A Opção B foi escolhida: mantém `AnalyticsDashboard.tsx` estável (apenas repassando props de escopo), aproveita os seletores de escopo existentes e centraliza o raciocínio preditivo e prescritivo em um único local.

### 5. Critério de Falsificabilidade & TDD (*Red-Bar First*)
- **Falha demonstrável (Red Bar):**
  - Cada componente e motor possui teste que falha deterministicamente antes do código ser escrito: `flowLeverageEngine.test.ts` (T003), `CascadeImpactGraphView.test.tsx` (T007), `FlowLeverageSimulatorPanel.test.tsx` (T010), `TopLeveragesCard.test.tsx` (T014).
- **Critério determinístico de aceite (Green Bar):**
  - Execução bem-sucedida de toda a suíte (160+ arquivos, 1000+ testes), zero violações no `moduleLineCountGuard.test.ts`, cobertura global de funções $\ge 70.0\%$ e `npm run build` passando limpo.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - *Princípio II*: Arquivos modulares $\le 400$ linhas estritamente observados e testados.
  - *Princípio VII*: Vocabulário lean/estocástico rigoroso, zero menções a marcas concorrentes.
  - *Princípio VIII & X*: Operação 100% offline em sub-10ms, caráter estritamente consultivo, sem mutações autônomas, histórico FIFO preservado.

---

## Phase 1: Setup & Contratos (Shared Infrastructure)

**Purpose**: Estabelecer contratos TypeScript, tipagens globais e modelos de dados para alavancas e simulação.

- [X] T001 Validar contratos TypeScript em `specs/058-flow-leverage-simulator/contracts/flow-leverage-contracts.ts` e modelos de dados em `specs/058-flow-leverage-simulator/data-model.md`
- [X] T002 [P] Atualizar tipagens globais em `src/types/analytics.ts` e `src/types/mika.ts` incluindo `FlowLeverageItem`, `CascadeImpactResult`, `SimulatedPolicyScenario` e `TopLeveragesSummary`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construir o motor puro de cálculo de alavancas de fluxo, impacto em cascata e Lei de Little, servindo de base para todos os componentes visuais e conversacionais.

- [X] T003 Escrever testes unitários (Red Bar) em `tests/unit/flowLeverageEngine.test.ts` para travessia de cascata, detecção de dependências circulares (`hasCycle`), cálculo da Lei de Little e ranqueamento de alavancas
- [X] T004 Implementar o motor funcional `src/utils/flowLeverageEngine.ts` contendo `calculateCascadeImpact`, `simulatePolicyScenario` e `rankTopLeverages` respeitando o limite $\le 280$ linhas (Green Bar para T003)
- [X] T005 Integrar o snapshot de `topLeverages` na compilação reativa de telemetria estocástica do quadro em `src/services/ai/mikaMonteCarloContext.ts`
- [X] T006 Atualizar testes unitários de telemetria em `tests/unit/mikaMonteCarloContext.test.ts` garantindo que o snapshot de alavancas é compilado corretamente

**Checkpoint**: Motor de cálculo puro validado e coberto com testes com zero dependências de interface gráfica.

---

## Phase 3: User Story 1 - Diagnóstico de Impacto em Cascata e Custo do Atraso de Bloqueios (Priority: P1)

**Goal**: Permitir ao usuário visualizar exatamente quanto cada item bloqueado e suas dependências a jusante atrasam a previsão P85 de entrega, identificando impedimentos prioritários e árvores de impacto.

**Independent Test**: Criar uma tarefa bloqueada com dependências vinculadas e validar que o diagnóstico exibe a árvore de tarefas retidas, a profundidade máxima e o custo do atraso em dias P85.

- [X] T007 [P] [US1] Escrever testes de componente unitários (Red Bar) em `tests/unit/CascadeImpactGraphView.test.tsx` testando renderização de itens retidos, profundidade, alerta de ciclo e chips `#ID`
- [X] T008 [US1] Implementar componente visual `CascadeImpactGraphView.tsx` em `src/components/MonteCarlo/CascadeImpactGraphView.tsx` (exibição de árvore de dependências, badge de Cost of Delay em dias P85 e alerta de ciclos)
- [X] T009 [US1] Escrever testes de integração em `tests/unit/monteCarloForecast.test.ts` verificando a correlação estatística entre impedimentos em cascata e o recálculo de probabilidade de data meta

**Checkpoint**: Diagnóstico de impedimentos em cadeia e Custo do Atraso 100% funcional e testado de forma isolada.

---

## Phase 4: User Story 2 - Simulador "What-If" de Políticas de Fluxo (WIP & Swarming) (Priority: P2)

**Goal**: Permitir simular no modo Sandbox o impacto de reduzir limites de WIP e ativar Swarming em itens envelhecidos, exibindo o delta comparativo no P85 e permitindo aplicação sob confirmação explícita.

**Independent Test**: Ajustar no simulador o limite de WIP de uma coluna ou ativar Swarming e verificar que a projeção comparativa (Atual vs. Simulado) exibe a variação de dias no P85 sem alterar os dados do quadro real.

- [X] T010 [P] [US2] Escrever testes de componente unitários (Red Bar) em `tests/unit/FlowLeverageSimulatorPanel.test.tsx` testando ajuste de sliders de WIP, alternância de Swarming, cálculo comparativo e botão Sandbox
- [X] T011 [US2] Implementar componente visual `FlowLeverageSimulatorPanel.tsx` em `src/components/MonteCarlo/FlowLeverageSimulatorPanel.tsx` com controles de WIP por coluna, comparativo Atual vs. Simulado e botão condicional *"Aplicar limite na coluna"* para usuários autorizados
- [X] T012 [US2] Estender `MonteCarloSimulationView.tsx` em `src/components/MonteCarloSimulationView.tsx` adicionando o modo `'leverage'` na barra de abas e renderizando `FlowLeverageSimulatorPanel` e `CascadeImpactGraphView`
- [X] T013 [US2] Atualizar testes de integração do painel em `tests/unit/MonteCarloSimulationView.test.tsx` validando navegação para a aba de alavancas e alternância entre modos

**Checkpoint**: Simulador What-If operando de forma 100% segura no modo Sandbox e integrado ao Hub de Previsão.

---

## Phase 5: User Story 3 - Plano de Ação Diário Ranqueado pela Mika ("Top 3 Alavancas") & Continuidade Contextual (Priority: P3)

**Goal**: Apresentar o card de Top 3 Alavancas no Analytics e disponibilizar a consulta offline em sub-10ms no chat da Mika com pílula rápida e navegação contínua com escopo pré-carregado.

**Independent Test**: Consultar *"Quais as alavancas de hoje?"* na assistente Mika (inclusive offline) e verificar o retorno do Top 3 com dias ganhos, chips `#ID` e botão CTA que fecha a gaveta e abre o painel já pré-selecionado no escopo.

- [X] T014 [P] [US3] Escrever testes de componente unitários (Red Bar) em `tests/unit/TopLeveragesCard.test.tsx` testando renderização das 3 alavancas, chips `#ID` e atalho de navegação
- [X] T015 [US3] Implementar componente `TopLeveragesCard.tsx` em `src/components/MonteCarlo/TopLeveragesCard.tsx` com ranking de alavancas, indicação de dias economizados e ação para abrir o simulador
- [X] T016 [US3] Integrar `TopLeveragesCard` em `src/components/AnalyticsDashboard.tsx` e fechar o repasse de `initialScopeType`, `initialScopeId` e `slePredictions` para `MonteCarloSimulationView` mantendo o arquivo com $\le 395$ linhas
- [X] T017 [US3] Escrever testes unitários em `tests/unit/mikaMonteCarloHeuristics.test.ts` para reconhecimento da intenção de alavancas do dia e síntese do template markdown
- [X] T018 [US3] Implementar reconhecimento semântico determinístico de alavancas e templates em `src/services/ai/mikaMonteCarloHeuristics.ts` respondendo em sub-10ms offline com chips `#ID` e CTA
- [X] T019 [US3] Adicionar pílula de sugestão rápida *"🎯 Alavancas de Hoje"* em `src/components/Mika/mikaQuickPrompts.ts`
- [X] T020 [US3] Atualizar testes de integração do chat da Mika em `tests/unit/mikaChat.test.tsx` cobrindo alavancas de fluxo, resguardo NIST e botão de CTA
- [X] T021 [US3] Ajustar handler `handleNavigateToForecast` em `src/App.tsx` para aceitar parâmetros de escopo contextual e propagar fechamento da gaveta com abertura da aba correspondente

**Checkpoint**: Todas as 3 Histórias de Usuário integradas com fluxo visual, painel executivo e copiloto conversacional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Garantir integridade modular, tipagem estrita, formatação, cobertura global de testes e conformidade constitucional.

- [X] T022 [P] Validar o teto modular de $\le 400$ linhas por arquivo através de `tests/unit/moduleLineCountGuard.test.ts`
- [X] T023 Checagem estática de tipos TypeScript com `npx tsc --noEmit` e linting com `npm run lint`
- [X] T024 Validação de conformidade de formatação com `npm run format:check`
- [X] T025 Executar suíte completa de testes com cobertura (`npm run test:coverage`), garantindo $\ge 70\%$ de cobertura de funções e zero falhas
- [X] T026 Executar validação manual dos cenários descritos em `specs/058-flow-leverage-simulator/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Sem dependências — inicia imediatamente.
- **Phase 2 (Foundational)**: Depende da Fase 1 — bloqueia todas as histórias de usuário.
- **Phase 3 (User Story 1 - P1)**: Depende da Fase 2 — núcleo de diagnóstico em cascata e Cost of Delay (MVP).
- **Phase 4 (User Story 2 - P2)**: Depende da Fase 2 e pode se integrar aos componentes da US1.
- **Phase 5 (User Story 3 - P3)**: Depende das Fases 2, 3 e 4 — síntese executiva no dashboard e assistente Mika.
- **Phase 6 (Polish)**: Depende da conclusão de todas as histórias de usuário.

---

## Implementation Strategy (MVP First)

1. **MVP (Fases 1, 2 e 3)**:
   - Motor puro `flowLeverageEngine.ts` com cálculo de cascata e Cost of Delay em dias P85.
   - Componente visual `CascadeImpactGraphView.tsx` para inspecionar impedimentos em cadeia.
   - **Validação independente**: Testar detecção de ciclos e ranking de bloqueadores.
2. **Incremento 2 (Fase 4)**:
   - Adicionar o Simulador "What-If" de políticas (Lei de Little) e modo Sandbox no Hub de Previsão.
   - **Validação independente**: Ajustar limites de WIP e avaliar variação de P85 sem mutação do quadro.
3. **Incremento 3 (Fase 5)**:
   - Disponibilizar o Top 3 Alavancas no Dashboard e no chat offline da Mika com navegação contínua contextual.
   - **Validação independente**: Consulta em sub-10ms e clique no CTA abrindo o painel pré-selecionado.
4. **Fechamento de Qualidade (Fase 6)**:
   - Validação de $\le 400$ linhas, testes 100% verdes, cobertura $\ge 70\%$ e quickstart aprovado.

