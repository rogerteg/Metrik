# Tasks: Mika — AI Flow Copilot (Ciclo 5)

**Feature**: `048-mika-ai-flow-copilot`  
**Input Documents**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [checklists/requirements.md](./checklists/requirements.md)  
**Constitution Authority**: [constitution.md](../../.specify/memory/constitution.md)

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades Fundamentais de Fluxo & Métricas:** Métricas como Cycle Time, Lead Time e Throughput são distribuições empíricas assimétricas (Right-skewed / Cauda Longa), onde médias aritméticas geram falhas de previsão. A verdade irredutível da Mika é: diagnósticos confiáveis exigem percentis não-paramétricos (P50, P85, P95) e simulações de Monte Carlo.
- **Invariante de Soberania Local-First:** O Metrik é uma aplicação sem backend obrigatório. A menor unidade de inteligência deve ser executável localmente no navegador via motor analítico puro (`MikaHeuristicEngine`), garantindo que 100% da inteligência de diagnóstico funcione mesmo sem internet ou sem chave de API.
- **Invariante de Integridade de Estado:** A decomposição de tarefas pela IA nunca deve mutar o quadro diretamente sem confirmação do usuário; as subtarefas pertencem ao checklist interno do cartão (`task.checklist`), preservando a densidade do Kanban.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Modo de Falha 1 (Vazamento acidental de chave ou dados sensíveis):** Enviar chave de API em logs de console ou transitar dados de tarefas para endpoints externos quando o usuário configurou o modo offline.
  - *Mitigação:* `MikaGeminiClient` só é instanciado e disparado quando `provider === 'gemini'` e a chave estiver presente; o tráfego de dados é barrado em modo heurístico com testes de espionagem (`vi.spyOn(global, 'fetch')`) garantindo zero chamadas de rede.
- **Modo de Falha 2 (Alucinação ou discrepância de percentis):** A IA inventar datas ou percentis divergentes dos gráficos analíticos do Metrik.
  - *Mitigação:* Os prompts e o payload contextual da Mika injetam diretamente os números calculados pelas funções matemáticas determinísticas do repositório (`statistics.ts` e `monteCarlo.ts`), e o motor heurístico local formata os textos usando interpolação estrita.
- **Modo de Falha 3 (Degradação de performance por recálculos repetidos):** O usuário alternar entre as abas do dashboard e disparar dezenas de requisições de IA.
  - *Mitigação:* `MikaCacheManager` armazena os insights vinculados ao hash do estado do quadro (`boardId + tasksChecksum`), com tempo de resposta < 5ms a partir da segunda renderização.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas:** 
  - Fase 1 e 2 focam estritamente em contratos, infraestrutura de cache e motores de inteligência isolados (`types/mika.ts`, `services/ai/`).
  - Fase 3 implementa exclusivamente a User Story 1 (diagnósticos e cards nos dashboards analíticos).
  - Fase 4 implementa exclusivamente a User Story 2 (decomposição no modal e integração ao checklist).
  - Fase 5 implementa exclusivamente a User Story 3 (preferências, BYOK e gaveta retrátil global).
  - Nenhuma tarefa concorre pelo mesmo arquivo sem ordem de dependência estrita.
- **Coletivamente Exaustivas:** A totalidade dos 10 requisitos funcionais (`FR-001` a `FR-010`) e 5 critérios de sucesso (`SC-001` a `SC-005`) é coberta por tarefas atômicas explícitas.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa A (Descartada):** Instalar o SDK `@google/generative-ai` do npm.
  - *Poda:* Rejeitada pela Constituição V (YAGNI); adicionaria mais de 180 kB ao bundle. A invocação direta da API REST via `fetch` nativo com tipagem TypeScript pura resolve 100% dos casos com menos de 80 linhas de código.
- **Alternativa B (Descartada):** Criar tarefas filhas separadas no quadro Kanban para cada subtarefa da Mika.
  - *Poda:* Rejeitada na clarificação Q2; geraria poluição visual massiva e inflaria os limites de WIP do quadro. Inserir no `task.checklist` é enxuto e preserva o foco.
- **Alternativa C (Descartada):** Armazenar a chave de API em texto plano no `localStorage`.
  - *Poda:* Rejeitada na clarificação Q5; ofuscação com máscara visual na interface confere proteção básica indispensável contra inspeção casual.

### 5. Critério de Falsificabilidade & TDD (Red-Bar First)
- **Red-Bar Inicial:**
  - Testes unitários para `mikaHeuristicEngine.test.ts` e `mikaGeminiClient.test.ts` criados primeiro falhando (ausência de implementação).
  - Testes para o hook `useMika.test.ts` e os componentes `MikaInsightCard` e `MikaDrawer`.
- **Green-Bar Final:**
  - 100% dos novos testes passam verde.
  - A suíte completa do Metrik evolui de 701 para 720+ testes sem nenhuma quebra de regressão.
  - Build de produção completa em tempo < 5s com ESLint estrito (zero erros e zero warnings).

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Constituição I (Model Integrity & Soberania):** Zero tráfego de dados não consentido; suporte total a modo offline autônomo.
- **Constituição II (Clean Architecture):** Separação estrita: camada de domínio (`mika.ts`), serviços de IA (`services/ai/`), hook de aplicação (`useMika`) e apresentação pura (`components/Mika/`).
- **Constituição III (Automated Quality Gates):** Travas de qualidade e cobertura mantidas rigorosamente acima dos novos limiares (Functions ≥ 60%, Statements ≥ 85%, Lines ≥ 85%, Branches ≥ 78%).
- **Constituição V (Simplicidade & YAGNI):** Zero novas bibliotecas em `package.json`.

---

## Phase 1: Setup (Tipagem & Contratos Compartilhados)

**Purpose**: Definição das interfaces centrais TypeScript da Mika e configuração do ambiente

- [x] T001 [P] Criar definições de tipos para Mika (MikaInsight, MikaDecomposition, MikaPreferences, MikaCacheEntry) em `src/types/mika.ts`
- [x] T002 [P] Implementar utilitário de ofuscação e mascaramento de credenciais locais em `src/utils/mikaSecurity.ts`
- [x] T003 Implementar gerenciador de cache reativo com checksum de tarefas em `src/services/ai/mikaCacheManager.ts`

---

## Phase 2: Foundational (Motores de Inteligência & Fallback)

**Purpose**: Implementar os motores analítico heurístico e o conector nativo do Google Gemini com cobertura TDD

- [x] T004 [P] Criar testes unitários para o motor heurístico de diagnósticos em `tests/unit/mikaHeuristicEngine.test.ts`
- [x] T005 Implementar o motor heurístico local determinístico (Cycle Time P85, WIP bottleneck, Monte Carlo) em `src/services/ai/mikaHeuristicEngine.ts`
- [x] T006 [P] Criar testes unitários para o cliente Gemini com simulação de respostas estruturadas e erros de rede em `tests/unit/mikaGeminiClient.test.ts`
- [x] T007 Implementar o cliente HTTP nativo do Google Gemini API (`generativelanguage.googleapis.com`) em `src/services/ai/mikaGeminiClient.ts`
- [x] T008 Implementar o serviço unificado `MikaService` com fallback transparente para o motor heurístico em `src/services/ai/mikaService.ts`
- [x] T009 Criar testes unitários de integração do `MikaService` garantindo fallback offline seguro em `tests/unit/mikaService.test.ts`

**Checkpoint**: Núcleo de inteligência, cache e conectividade testado e 100% funcional. Início da implementação das User Stories.

---

## Phase 3: User Story 1 - Diagnóstico Narrativo de Métricas e Alertas Preditivos (Priority: P1) 🎯 MVP

**Goal**: Exibir cards executivos inteligentes da Mika sintetizando a saúde do fluxo, percentil 85 de Cycle Time, alertas de gargalos e simulação de Monte Carlo.

**Independent Test**: Navegar para o dashboard de Analytics com tarefas carregadas e verificar o card `MikaInsightCard` renderizando diagnósticos textuais claros em < 300ms.

- [x] T010 [P] [US1] Criar teste unitário para o componente `MikaInsightCard` em `tests/unit/MikaInsightCard.test.tsx`
- [x] T011 [US1] Implementar o componente `MikaInsightCard.tsx` com badges de severidade (info/warning/critical) e botão de recálculo manual em `src/components/Mika/MikaInsightCard.tsx`
- [x] T012 [US1] Criar estilos Vanilla CSS para cards de insight no Design System em `src/styles/13-mika.css`
- [x] T013 [US1] Integrar o `MikaInsightCard` no topo do `AnalyticsDashboard.tsx` alimentado com a telemetria do quadro ativo
- [x] T014 [US1] Validar que o `MikaInsightCard` respeita o cache reativo e não reexecuta diagnósticos desnecessários ao alternar abas analíticas

**Checkpoint**: User Story 1 (MVP) concluída — diagnósticos narrativos da Mika operacionais e visíveis nos dashboards analíticos.

---

## Phase 4: User Story 2 - Decomposição Inteligente e Critérios de Aceite na Tarefa (Priority: P2)

**Goal**: Permitir que desenvolvedores e gestores refinem tarefas complexas no modal com auxílio da Mika, inserindo subtarefas diretamente no checklist.

**Independent Test**: Abrir o `TaskDetailsModal` de uma tarefa com descrição, clicar em "Sugerir Subtarefas com Mika", selecionar as sugestões desejadas e confirmar a inserção no checklist interno do cartão.

- [x] T015 [P] [US2] Criar teste unitário para a funcionalidade de decomposição de tarefas em `tests/unit/MikaTaskAssistant.test.tsx`
- [x] T016 [US2] Implementar método de decomposição de requisitos e geração de critérios de aceite no `MikaService` e `MikaHeuristicEngine`
- [x] T017 [US2] Criar o componente de assistência contextual `MikaTaskAssistant.tsx` com lista de seleção de subtarefas em `src/components/Mika/MikaTaskAssistant.tsx`
- [x] T018 [US2] Integrar o botão de refinamento e o painel `MikaTaskAssistant` dentro de `src/components/TaskDetailsModal.tsx`
- [x] T019 [US2] Conectar a aprovação de subtarefas ao estado da tarefa injetando itens em `task.checklist` sem mutações externas

**Checkpoint**: User Story 2 concluída — refinamento assistido de tarefas no modal com aprovação human-in-the-loop operacional.

---

## Phase 5: User Story 3 - Painel de Preferências da Mika, BYOK e Gaveta Retrátil Global (Priority: P3)

**Goal**: Disponibilizar acesso global à Mika via gaveta lateral retrátil (`MikaDrawer`) e aba de preferências em Configurações para chave Google Gemini e modo offline.

**Independent Test**: Clicar no botão da Mika no cabeçalho para abrir o `MikaDrawer`; acessar Configurações > Mika AI, inserir/salvar chave de API com máscara e alternar para modo offline.

- [x] T020 [P] [US3] Implementar o hook central `useMika` conectando quadro ativo, cache, preferências e chamadas de serviço em `src/hooks/useMika.ts`
- [x] T021 [P] [US3] Criar testes unitários para a aba de configurações da Mika em `tests/unit/MikaSettingsTab.test.tsx`
- [x] T022 [US3] Implementar o componente `MikaSettingsTab.tsx` com formulário de chave BYOK, máscara visual e seletor de modo em `src/components/Mika/MikaSettingsTab.tsx`
- [x] T023 [US3] Integrar a aba `MikaSettingsTab` no painel de configurações central `src/components/Settings/SettingsView.tsx`
- [x] T024 [P] [US3] Implementar o botão de disparo global `MikaTriggerButton.tsx` no cabeçalho da aplicação
- [x] T025 [US3] Implementar a gaveta lateral retrátil `MikaDrawer.tsx` com animações suaves e histórico de insights em `src/components/Mika/MikaDrawer.tsx`
- [x] T026 [US3] Conectar o `MikaTriggerButton` e `MikaDrawer` no layout raiz em `src/App.tsx`
- [x] T027 [US3] Adicionar `@import './styles/13-mika.css';` ao manifesto `src/App.css` e atualizar `tests/unit/appCssStructure.test.ts` para 13 módulos

**Checkpoint**: User Story 3 concluída — governança completa de preferências, BYOK, gaveta lateral e Design System integrado.

---

## Phase 6: Polish & Validação Integrada

**Purpose**: Verificações finais de formatação, lint, suíte completa de testes e performance de build

- [x] T028 [P] Executar `npm run format` para garantir conformidade Prettier em todos os novos arquivos
- [x] T029 Executar `npm run lint` assegurando 0 erros e 0 warnings com a regra estrita de `no-explicit-any`
- [x] T030 Executar suíte de testes unitários com `npm test` garantindo que todos os testes passem (720+ testes verdes)
- [x] T031 Executar `npm run test:coverage` validando que todos os 4 limiares (Functions ≥ 60%, Statements ≥ 85%, Lines ≥ 85%, Branches ≥ 78%) permanecem verdes
- [x] T032 Executar compilação de produção com `npm run build` atestando tempo < 5s e zero erros TypeScript/Vite
- [x] T033 Executar os cenários de validação documentados no `specs/048-mika-ai-flow-copilot/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Inicia imediatamente.
- **Phase 2 (Foundational)**: Bloqueia todas as User Stories (motores analítico e de IA).
- **Phase 3 (User Story 1 - MVP)**: Inicia após a Fase 2 (Diagnósticos em Analytics).
- **Phase 4 (User Story 2)**: Inicia após a Fase 2 (pode rodar em paralelo ou após US1).
- **Phase 5 (User Story 3)**: Inicia após a Fase 2 (conecta a gaveta e configurações).
- **Phase 6 (Polish)**: Execução pós-conclusão de todas as histórias.

### Parallel Opportunities
- `T001` e `T002` podem ser criados em paralelo na Fase 1.
- `T004` (testes do motor heurístico) e `T006` (testes do cliente Gemini) podem ser escritos em paralelo na Fase 2.
- `T010` (testes do card) e `T012` (estilos CSS) podem ser desenvolvidos em paralelo na Fase 3.
- `T015` (testes da decomposição) pode rodar em paralelo com tarefas da Fase 3.
- `T020` e `T021` podem ser desenvolvidos em paralelo na Fase 5.

---

## Implementation Strategy: MVP First
1. **Fase 1 + 2**: Tipagem, motor heurístico local e serviço unificado de IA.
2. **Fase 3 (MVP)**: Renderização do `MikaInsightCard` nos dashboards de Analytics com previsibilidade de Monte Carlo e Cycle Time P85 -> **Mika Operacional para Demonstração**.
3. **Fase 4**: Refinamento e decomposição de tarefas no modal.
4. **Fase 5**: Gaveta lateral global e suporte a chaves BYOK no menu de configurações.
5. **Fase 6**: Validação integrada e certificação de qualidade.
