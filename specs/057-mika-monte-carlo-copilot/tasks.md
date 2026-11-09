# Tasks: Mika AI Copilot Preditivo de Monte Carlo

**Feature**: `057-mika-monte-carlo-copilot`  
**Input**: Design documents from `/specs/057-mika-monte-carlo-copilot/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/mika-forecast-contracts.ts`, `quickstart.md`  

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório)

> **Regra Constitucional VI:** Preencha e valide os modelos analíticos ANTES de listar as tarefas de implementação. Nenhuma tarefa pode ser executada sem esta reflexão preliminar documentada.

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades fundamentais e invariantes:**
  - A Mika AI é uma interface consultiva conversacional; ela interpreta intenções em linguagem natural, traduzindo-as em consultas analíticas determinísticas sobre dados do quadro.
  - O motor de Monte Carlo da Feature 056 ([`src/utils/monteCarloForecast.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/utils/monteCarloForecast.ts)) é a única fonte da verdade matemática para percentis (P50, P85, P95), probabilidades de data meta e suficiência amostral NIST ($N \ge 10$).
  - O princípio Local-First (Constituição VIII e X) impõe que o motor heurístico local responda 100% offline em tempo $\le 10\text{ ms}$, sem falhar se o Gemini estiver desconectado.
  - Qualquer transição disparada no chat (ex: botão de ação para abrir o painel) é mediada por intenção explícita do usuário, nunca por mutação autônoma de dados (Constituição X.2).
- **Premissas acidentais descartadas:**
  - Eliminada a ideia de executar simulações estocásticas pesadas de 10.000 iterações em cada render do chat; o resumo é compilado no snapshot de telemetria apenas quando os dados do quadro sofrem alteração ou sob demanda de consulta.
  - Descartada a hipótese de reescrever lógica matemática dentro dos motores de linguagem; o chat apenas consome e sintetiza os resultados de funções puras existentes.

### 2. Análise Pré-Mortem & Inversão (*Premortem & Inversion*)
- **Cenários de falha antecipados:**
  1. *Estouro de Linhas nos Arquivos da Mika*: `mikaChatHeuristicEngine.ts` ou `mikaContextBuilder.ts` ultrapassarem 400 linhas ao incorporar novas intenções, violando a Constituição II.
  2. *Divergência de Cálculos (Split-Brain)*: A Mika relatar no chat um prazo ou probabilidade diferente do painel gráfico por usar parâmetros de janela ou amostragem inconsistentes.
  3. *Bloqueio de UI por Simulação Pesada*: Cálculos estocásticos síncronos travarem a digitação no input do chat.
  4. *Falha de Fallback sem Rede*: Se o Gemini falhar por timeout ou falta de chave, o chat lançar exceção não tratada e travar.
- **Mitigações desenhadas nas tarefas:**
  1. *Decomposição Modular Estruturada*: Criação de `mikaMonteCarloContext.ts` e `mikaMonteCarloHeuristics.ts`, mantendo todos os arquivos abaixo de 250 linhas (T004, T008).
  2. *Reutilização Estrita de Funções Puras*: Importação das mesmas funções de cálculo da Feature 056 (T004, T008).
  3. *Snapshot em Memória*: Telemetria compilada de forma reativa e leve (T004).
  4. *Fallback Heurístico Resiliente*: Cobertura com testes de queda de rede e erro do Gemini (T011).

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Exclusividade Mútua (Zero Duplicação):**
  - Módulos de dados (`mikaMonteCarloContext.ts`) cuidam apenas da agregação de dados.
  - Módulos de heurística (`mikaMonteCarloHeuristics.ts`) cuidam exclusivamente do parsing de strings e síntese de templates.
  - Componentes de UI (`MikaChatInterface.tsx`, `MikaMessageContent.tsx`) cuidam apenas da apresentação e eventos de clique.
- **Exaustão Coletiva (Cobertura 100%):**
  - Todas as 3 Histórias de Usuário (US1: Diagnóstico de Prazos/Iniciativas; US2: Capacidade/Sprint; US3: Quick Prompts & CTA) e todos os 10 Requisitos Funcionais (FR-001 a FR-010) possuem tarefas associadas diretas.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts*)
- **Caminhos de arquitetura/design avaliados:**
  - *Opção A*: Adicionar novas intenções diretamente dentro de `mikaChatHeuristicEngine.ts`.
  - *Opção B*: Criar um sub-motor dedicado `mikaMonteCarloHeuristics.ts` e despachar do motor principal.
- **Critério de poda e trade-offs:**
  - A Opção A foi podada porque `mikaChatHeuristicEngine.ts` já possui ~196 linhas e cresceria para além de 350 linhas, violando a política de proteção contra o teto modular de 400 linhas.
  - A Opção B foi escolhida: modularidade estrita, isolamento de escopo e facilidade de testes unitários isolados.

### 5. Critério de Falsificabilidade & TDD (*Red-Bar First*)
- **Falha demonstrável (Red Bar):**
  - Cada fase de implementação inclui tarefas iniciais de teste unitário (`mikaMonteCarloContext.test.ts`, `mikaMonteCarloHeuristics.test.ts`, `MikaChatInterface.test.tsx`) que falham antes da implementação correspondente.
- **Critério determinístico de aceite (Green Bar):**
  - Execução bem-sucedida de toda a suíte de testes (155+ arquivos, 967+ testes), verificação do limite de linhas (`moduleLineCountGuard.test.ts`) e cobertura de funções acima do limiar global de 70%.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution:**
  - *Princípio II*: Arquivos modulares $\le 400$ linhas.
  - *Princípio VII*: Vocabulário limpo e zero menções a marcas externas.
  - *Princípio VIII & X*: Autonomia local-first offline em $< 10\text{ ms}$, caráter consultivo, chips `#ID` interativos e histórico FIFO limitado a 30 mensagens.

---

## Phase 1: Setup & Contratos (Shared Infrastructure)

**Purpose**: Estruturar contratos TypeScript e modelos de dados para telemetria estocástica e ações consultivas.

- [ ] T001 Validar contratos TypeScript e modelos de dados em `specs/057-mika-monte-carlo-copilot/contracts/mika-forecast-contracts.ts`
- [ ] T002 [P] Atualizar tipagens globais da Mika em `src/types/mika.ts` incluindo `MikaMonteCarloTelemetry`, `MikaForecastActionPayload` e extensões de `MikaChatMessage`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construir o compilador de telemetria estocástica do quadro que servirá de base para todos os motores conversacionais.

- [ ] T003 Escrever testes unitários para o compilador de telemetria estocástica em `tests/unit/mikaMonteCarloContext.test.ts` (Red Bar)
- [ ] T004 Implementar o compilador modular `mikaMonteCarloContext.ts` em `src/services/ai/mikaMonteCarloContext.ts` (extração de vazão, validação NIST, agregação de iniciativas e sprint ativa)
- [ ] T005 Integrar `mikaMonteCarloContext.ts` no gerador de snapshot `buildBoardTelemetryContext` em `src/services/ai/mikaContextBuilder.ts`
- [ ] T006 Atualizar testes unitários de telemetria em `tests/unit/mikaContextBuilder.test.ts` (Green Bar)

**Checkpoint**: Telemetria estocástica compilada e validada de forma puramente funcional e testável.

---

## Phase 3: User Story 1 - Diagnóstico Conversacional de Prazos e Previsão Estocástica (Priority: P1)

**Goal**: Permitir ao usuário consultar no chat o término de iniciativas específicas ou o panorama geral de portfólio, recebendo percentis P50/P85/P95, probabilidade de data meta, selo de risco e resguardo amostral NIST em sub-10ms offline.

**Independent Test**: Perguntar *"Mika, quando entregamos a Iniciativa X?"* ou *"Como estão os prazos das iniciativas?"* e validar que a Mika retorna percentis probabilísticos, datas estimadas e alerta NIST se $N < 10$.

- [ ] T007 Escrever testes unitários para intenções de previsão de prazos e resumo de portfólio em `tests/unit/mikaMonteCarloHeuristics.test.ts` (Red Bar)
- [ ] T008 Implementar o sub-motor heurístico de previsão estocástica em `src/services/ai/mikaMonteCarloHeuristics.ts` com templates de iniciativas, portfólio consolidado e resguardo NIST
- [ ] T009 Conectar o roteamento de intenções de previsão no motor determinístico principal `src/services/ai/mikaChatHeuristicEngine.ts`
- [ ] T010 Injetar a telemetria estocástica nas instruções de sistema do Gemini (`generateMikaSystemPrompt`) em `src/services/ai/mikaContextBuilder.ts`
- [ ] T011 Adicionar testes de integração cobrindo consulta de iniciativas, fallback gracioso e chips `#ID` em `tests/unit/mikaChat.test.tsx`

**Checkpoint**: Histórias de previsão de iniciativas e portfólio 100% operacionais offline e com LLM.

---

## Phase 4: User Story 2 - Consulta de Capacidade e Dimensionamento Estocástico de Sprint (Priority: P2)

**Goal**: Permitir consultar no chat quantos itens cabem na sprint com 85% de certeza e avaliar o risco de atraso da sprint ativa.

**Independent Test**: Perguntar *"Quantos itens cabem na próxima sprint?"* e *"A sprint atual vai atrasar?"* e validar resposta com estimativa estocástica e premissa de 14 dias declarada.

- [ ] T012 Escrever testes unitários para intenções de capacidade How-Many e risco de sprint em `tests/unit/mikaMonteCarloHeuristics.test.ts`
- [ ] T013 Implementar a simulação de capacidade How-Many para janela padrão de 14 dias e suporte a durações customizadas da query (ex: *"7 dias"*, *"21 dias"*) em `src/services/ai/mikaMonteCarloHeuristics.ts`
- [ ] T014 Implementar avaliação de término e risco da sprint ativa com recomendações de escopo em `src/services/ai/mikaMonteCarloHeuristics.ts`
- [ ] T015 Atualizar testes de integração do chat cobrindo capacidade e sprint em `tests/unit/mikaChat.test.tsx`

**Checkpoint**: Capacidade estocástica de sprint operando e testada de forma independente.

---

## Phase 5: User Story 3 - Pílulas de Sugestões Rápidas e Ações Consultivas (Priority: P3)

**Goal**: Exibir pílulas de sugestões rápidas preditivas no chat e renderizar botões de CTA consultivos que navegam para a aba de Previsão de Backlog no Analytics fechando o drawer.

**Independent Test**: Clicar na pílula rápida de previsão e, na resposta, clicar em *"📊 Ver Simulação Completa no Painel"*, verificando que o drawer fecha e o painel de Previsão de Backlog abre com a iniciativa selecionada.

- [ ] T016 Escrever testes unitários para Quick Prompts preditivos e botão de ação consultiva em `tests/unit/MikaChatInterface.test.tsx`
- [ ] T017 Adicionar pílulas de sugestões rápidas preditivas no drawer em `src/components/Mika/MikaChatInterface.tsx`
- [ ] T018 Implementar a renderização do botão de ação consultiva (*CTA*) em `src/components/Mika/MikaMessageContent.tsx`
- [ ] T019 Propagar o callback `onNavigateToForecast` em `src/components/Mika/MikaDrawer.tsx` e `MikaChatInterface.tsx`
- [ ] T020 Implementar o handler `handleNavigateToForecast` em `src/App.tsx` para fechar o drawer e navegar para a aba `'forecasting'` com o escopo pré-selecionado

**Checkpoint**: Todas as 3 Histórias de Usuário integradas com interface visual polida e navegação funcional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Garantir integridade modular, tipagem estrita, conformidade constitucional e validação end-to-end.

- [ ] T021 [P] Validar o teto modular de $\le 400$ linhas por arquivo através de `tests/unit/moduleLineCountGuard.test.ts`
- [ ] T022 Checagem estática de tipos TypeScript com `npx tsc --noEmit` e linting com `npm run lint`
- [ ] T023 Validação de conformidade de formatação com `npm run format:check`
- [ ] T024 Executar suíte completa de testes com cobertura (`npm run test:coverage`), garantindo $\ge 70\%$ de cobertura de funções e zero falhas
- [ ] T025 Executar validação dos cenários manuais de uso conforme descrito em `specs/057-mika-monte-carlo-copilot/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Sem dependências — inicia imediatamente.
- **Phase 2 (Foundational)**: Depende da Fase 1 — bloqueia as histórias de usuário.
- **Phase 3 (User Story 1 - P1)**: Depende da Fase 2 — núcleo do copilot preditivo (MVP).
- **Phase 4 (User Story 2 - P2)**: Depende da Fase 2 e integra com as heurísticas da Fase 3.
- **Phase 5 (User Story 3 - P3)**: Depende da Fase 3/4 para acionamento visual de ações e pílulas.
- **Phase 6 (Polish)**: Depende da conclusão de todas as histórias.
