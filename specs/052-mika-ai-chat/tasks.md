# Tasks: Mika Conversational AI Chat Copilot (Feature 052)

**Input**: Design documents from `specs/052-mika-ai-chat/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Status**: Ready for Implementation  
**Feature Directory**: `specs/052-mika-ai-chat`

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório — Constituição VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades Fundamentais Irredutíveis**:
  1. Um copiloto conversacional analítico precisa de apenas dois componentes essenciais: a **telemetria matemática observável do quadro** (dados reais e imutáveis de colunas, limites, itens e tempos) e um **mecanismo gerador de linguagem natural** (seja o modelo externo Google Gemini BYOK ou o classificador heurístico determinístico local).
  2. A Mika opera em modo estritamente consultivo (*read-only*). Ela não tem permissão para mutar posições de cartões, colunas ou regras sem a ação intencional e manual do usuário. O único elo de mutação permitido é delegar a inspeção ao usuário abrindo o [`TaskDetailsModal`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TaskDetailsModal.tsx) via chip interativo `#ID`.
  3. A persistência Local-First no navegador possui cota finita (`localStorage` limitado a ~5MB). Para que o chat funcione perpetuamente sem degradar a máquina do usuário, a retenção de mensagens precisa de um teto rígido e automático em janela deslizante FIFO (30 mensagens por quadro).
- **Premissas Acidentais Descartadas**:
  - Descartada a necessidade de servidores de banco de dados ou sincronização em nuvem obrigatória para o chat (soberania Local-First, Princípio VIII).
  - Descartado o download de bibliotecas pesadas de inferência de IA ou WebAssembly no cliente (Simplicidade & YAGNI, Princípio V).

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Cenários Hipotéticos de Falha Grave e Mitigações Embutidas**:
  - *Falha 1: "Usuário offline ou sem chave de API clica em perguntar e o sistema lança exceção não tratada ou fica em estado de carregamento infinito."*  
    **Mitigação**: `mikaChatHeuristicEngine.ts` opera de forma síncrona e determinística como fallback automático. Se a chave estiver ausente ou a requisição externa falhar, a heurística responde em <10ms sem expor erros bloqueantes na tela.
  - *Falha 2: "Uso contínuo do chat estoura a quota de armazenamento local com erro `QuotaExceededError`."*  
    **Mitigação**: `mikaChatStorageManager.ts` implementa corte estrito FIFO em 30 mensagens por quadro antes de qualquer escrita no `localStorage`.
  - *Falha 3: "Cliques repetidos rápidos no botão Enviar ou pressionamento contínuo de Enter disparam requisições concorrentes, corrompendo o histórico."*  
    **Mitigação**: O estado `isGenerating` desabilita imediatamente o campo de texto e o botão de envio até o ciclo completo da resposta.
  - *Falha 4: "A Mika alucina um ID de tarefa que não existe no quadro (ex.: #999) e o clique quebra o sistema."*  
    **Mitigação**: `MikaMessageContent.tsx` faz busca no mapa de tarefas do quadro ativo antes de criar o link; se o ID não existir, o texto `#999` é renderizado como texto inerte normal.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas (ME)**: Cada tarefa possui fronteira de responsabilidade estrita e arquivo dedicado:
  - Tipos e modelos: isolados em `src/types/mika.ts`.
  - Lógica heurística: isolada em `src/services/ai/mikaChatHeuristicEngine.ts`.
  - Snapshot de telemetria: isolado em `src/services/ai/mikaContextBuilder.ts`.
  - Persistência e FIFO: isolado em `src/services/ai/mikaChatStorageManager.ts`.
  - Cliente Gemini multi-turn: isolado em `src/services/ai/mikaGeminiClient.ts`.
  - Componentes visuais: isolados em `MikaChatInterface.tsx`, `MikaMessageContent.tsx` e `MikaDrawer.tsx`.
- **Coletivamente Exaustivas (CE)**: A soma das tarefas cobre 100% dos requisitos funcionais (FR-001 a FR-014), critérios de sucesso (SC-001 a SC-006) e decisões tomadas no Clarify:
  - FR-001 (Abas no MikaDrawer) → T010, T011
  - FR-002 (Quick-Prompt Chips) → T013, T014
  - FR-003 (Injeção de Telemetria Dinâmica) → T003
  - FR-004 (Multi-Turn de até 6 mensagens para a API) → T005
  - FR-005 (Persistência FIFO 30 mensagens no localStorage) → T002, T018
  - FR-006 (Limpeza de Histórico com Confirmação) → T017
  - FR-007 (Typing Indicator e Acessibilidade) → T014
  - FR-008 (Motor Heurístico Local Determinístico) → T004, T021
  - FR-009 (Modo Estritamente Consultivo) → T004, T007
  - FR-010 (Independência de Marca) → T003, T023
  - FR-011 (Atalhos de Teclado Enter / Shift+Enter) → T009
  - FR-012 (Badge do Provedor Ativo) → T020
  - FR-013 (Identificadores Clicáveis de Tarefas) → T007, T010
  - FR-014 (Cópia Rápida com Feedback) → T016

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa 1 (Descartada)**: Executar modelo LLM leve quantizado via WebAssembly no cliente (Transformers.js).  
  *Critério de Poda*: Download de 50MB a 500MB no bundle inicial e alto consumo de memória. O motor heurístico determinístico atende as necessidades de métricas com 0KB de dependências extras (Princípio V).
- **Alternativa 2 (Descartada)**: Interface híbrida em acordeão misturando cards analíticos e chat na mesma rolagem.  
  *Critério de Poda*: Compromete a altura visível do chat (<300px). A navegação por abas dedicadas foi a opção canônica aprovada no Clarify.
- **Alternativa 3 (Descartada)**: Mutações autônomas de cartões pela Mika no quadro.  
  *Critério de Poda*: Violação direta do Princípio IX (Integridade de Dados). O copiloto é estritamente de consultoria e suporte analítico.

### 5. Critério de Falsificabilidade & Testabilidade (*TDD / Red-Bar First*)
- **Falha Demonstrável (Red Bar)**: Executar os testes em `tests/unit/mikaChat.test.tsx` antes da implementação deve falhar acusando a ausência dos componentes de chat, do classificador de intenção e do gerenciador de storage.
- **Critério Determinístico de Aceite (Green Bar)**:
  - 100% dos testes unitários em `tests/unit/mikaChat.test.tsx` passando.
  - Suíte global de testes passando sem regressões (`npm run test`).
  - Verificação de tipos estritos TypeScript sem nenhum erro (`npx tsc --noEmit`).
  - Bundle de produção compilado com sucesso (`npm run build`).

### 6. Triangulação Adversarial & Conformidade Constitucional (*Polygraph Verification*)
- **Princípio I (SDD)**: Ciclo spec → clarify → plan → tasks rigorosamente seguido.
- **Princípio II & V (Qualidade & YAGNI)**: Componentes enxutos, modulares e zero abstrações especulativas.
- **Princípio VII (Independência de Marca)**: Prompts e mensagens auditados contra vazamento de nomes de ferramentas concorrentes.
- **Princípio VIII (Soberania Local-First)**: O chat funciona 100% desconectado da internet e armazena os dados sob isolamento estrito por `boardId`.
- **Princípio IX (Integridade de Dados)**: Caráter estritamente consultivo e limpeza de histórico protegida por confirmação.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição dos tipos de domínio e contratos essenciais para o chat da Mika.

- [x] T001 [P] Adicionar tipos e entidades de chat (`MikaChatMessage`, `MikaChatSession`, `MikaQuickPrompt`, `MikaBoardTelemetryContext`, `MikaChatRole`, `MikaChatProvider`) em `src/types/mika.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Serviços centrais de lógica analítica, telemetria, storage e cliente de IA que bloqueiam a construção da UI.

- [x] T002 [P] Implementar gerenciador de persistência local `src/services/ai/mikaChatStorageManager.ts` com isolamento por `boardId`, chave `metrik_mika_chat_${boardId}` e limite deslizante FIFO de 30 mensagens
- [x] T003 [P] Implementar extrator de telemetria e construtor de prompts `src/services/ai/mikaContextBuilder.ts` compilando colunas, limites de WIP, envelhecimento, cartões bloqueados, SLE P85 e regras de independência de marca (Princípio VII)
- [x] T004 [P] Implementar motor heurístico determinístico para chat `src/services/ai/mikaChatHeuristicEngine.ts` com classificador de intenções por regex/palavras-chave e injeção de telemetria em templates dinâmicos
- [x] T005 Implementar suporte a chat multi-turn com histórico das últimas 6 mensagens e injeção de contexto em `src/services/ai/mikaGeminiClient.ts`
- [x] T006 Criar suíte de testes unitários base `tests/unit/mikaChat.test.tsx` cobrindo o classificador de intenções, construtor de telemetria e lógica FIFO do storage

**Checkpoint**: Camada de serviços e infraestrutura de dados testada e pronta para integração com a interface visual.

---

## Phase 3: User Story 1 - Consulta Conversacional e Identificadores Clicáveis (Priority: P1) 🎯 MVP

**Goal**: Permitir que o usuário converse com a Mika sobre gargalos e métricas de fluxo na gaveta lateral, visualizando identificadores `#ID` clicáveis que abrem o modal de detalhes da tarefa.

**Independent Test**: Abrir a gaveta da Mika, digitar uma pergunta sobre gargalos, receber a resposta contextualizada da coluna crítica e clicar no chip de uma tarefa citada para abrir o `TaskDetailsModal`.

- [x] T007 [P] [US1] Implementar formatador de mensagens com detecção de `#ID` e renderização de chips interativos em `src/components/Mika/MikaMessageContent.tsx`
- [x] T008 [P] [US1] Criar estilos do chat e layout da gaveta em `src/components/Mika/MikaChatInterface.css` com design system do Metrik
- [x] T009 [US1] Implementar componente interativo `src/components/Mika/MikaChatInterface.tsx` com lista rolável de mensagens, entrada de texto multilinhas e atalhos `Enter` e `Shift+Enter`
- [x] T010 [US1] Atualizar `src/components/Mika/MikaDrawer.tsx` com navegação por abas ("💬 Chat" e "📊 Diagnósticos") e integração das propriedades de telemetria e callback `onOpenTaskDetails`
- [x] T011 [US1] Integrar a passagem de telemetria do quadro e o callback de abertura de tarefa no `src/App.tsx` para o `MikaDrawer`
- [x] T012 [US1] Adicionar testes unitários para a US1 em `tests/unit/mikaChat.test.tsx` cobrindo envio de pergunta, renderização de resposta e clique em chip `#ID`

**Checkpoint**: MVP do Chat interativo funcional e testável de ponta a ponta na gaveta lateral da Mika.

---

## Phase 4: User Story 2 - Chips de Perguntas Rápidas e Indicador de Digitação (Priority: P2)

**Goal**: Oferecer chips de perguntas analíticas imediatas de 1 clique e feedback visual de digitação (*typing indicator*) com acessibilidade.

**Independent Test**: Abrir a gaveta, clicar em um chip ("Cartões bloqueados"), visualizar o indicador animado de digitação e verificar a chegada da resposta correspondente.

- [x] T013 [P] [US2] Implementar catálogo e renderização de chips de perguntas frequentes contextuais em `src/components/Mika/MikaChatInterface.tsx`
- [x] T014 [US2] Implementar indicador animado de digitação (*typing indicator*) com bloqueio de envios concorrentes e anúncio `aria-live="polite"` em `src/components/Mika/MikaChatInterface.tsx`
- [x] T015 [US2] Adicionar testes unitários para a US2 em `tests/unit/mikaChat.test.tsx` validando envio via chips e estados de carregamento

**Checkpoint**: US1 e US2 operando juntas com ergonomia rápida e acessibilidade visual.

---

## Phase 5: User Story 3 - Multi-Turn, Persistência Local e Ações de Histórico (Priority: P3)

**Goal**: Preservar o histórico do diálogo no `localStorage` por quadro com limite de 30 mensagens, permitir cópia rápida de respostas e limpeza de conversa com confirmação.

**Independent Test**: Realizar perguntas encadeadas, fechar e reabrir a gaveta confirmando a persistência, copiar uma resposta validando o feedback "Copiado!" e acionar a limpeza de histórico com confirmação.

- [x] T016 [P] [US3] Implementar botão de cópia de resposta em 1 clique com feedback temporário "Copiado!" em `src/components/Mika/MikaChatInterface.tsx`
- [x] T017 [US3] Implementar botão de ação e modal/diálogo de confirmação para limpeza de histórico da conversa em `src/components/Mika/MikaChatInterface.tsx`
- [x] T018 [US3] Integrar carregamento e persistência reativa da sessão do quadro ativo em `src/components/Mika/MikaChatInterface.tsx`
- [x] T019 [US3] Adicionar testes unitários para a US3 em `tests/unit/mikaChat.test.tsx` cobrindo cópia, confirmação de limpeza e restauração de sessão

**Checkpoint**: Conversa contínua preservada com segurança Local-First e proteção contra perda acidental de dados.

---

## Phase 6: User Story 4 - Resiliência com Fallback Local-First Heurístico (Priority: P4)

**Goal**: Garantir que o chat responda perguntas analíticas mesmo sem conexão de rede ou sem chave de API, exibindo o status do provedor de inteligência ativo.

**Independent Test**: Desconectar chave de API ou rede, enviar pergunta e constatar resposta determinística do motor local sem travamentos ou erros no console.

- [x] T020 [P] [US4] Implementar indicador visual do provedor ativo no cabeçalho do chat em `src/components/Mika/MikaChatInterface.tsx` ("Google Gemini" vs "Local-First (Offline)")
- [x] T021 [US4] Integrar fallback automático e transparente para `mikaChatHeuristicEngine` em caso de erro de rede ou chave ausente em `src/services/ai/mikaService.ts` e `src/components/Mika/MikaChatInterface.tsx`
- [x] T022 [US4] Adicionar testes unitários para a US4 em `tests/unit/mikaChat.test.tsx` cobrindo fallback offline e integridade de execução

**Checkpoint**: Sistema 100% autônomo e resiliente a falhas de rede externa.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação global de tipos, higiene de marca, execução de suítes de teste e validação de conformidade.

- [x] T023 [P] Realizar varredura de conformidade com o Princípio VII (Zero Brand Leaks em código, textos visuais e prompts)
- [x] T024 [P] Executar verificação de tipos estritos `npx tsc --noEmit` e compilação de produção `npm run build`
- [x] T025 Executar suíte completa de testes no Vitest (`npm run test`) e validar cenários descritos no `specs/052-mika-ai-chat/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Pode iniciar imediatamente (sem dependências).
- **Phase 2 (Foundational)**: Depende da Phase 1 — BLOQUEIA a implementação das histórias de usuário.
- **Phase 3 (User Story 1 - MVP)**: Depende da conclusão da Phase 2.
- **Phase 4 (User Story 2)**: Depende da Phase 3 (estende `MikaChatInterface`).
- **Phase 5 (User Story 3)**: Depende da Phase 4 (adiciona ações e persistência multi-turn).
- **Phase 6 (User Story 4)**: Depende da Phase 5 (finaliza fallback de redundância).
- **Phase 7 (Polish)**: Depende da conclusão de todas as histórias.

### Parallel Opportunities
- **Phase 1**: T001 pode ser implementado diretamente.
- **Phase 2**: T002 (`mikaChatStorageManager`), T003 (`mikaContextBuilder`) e T004 (`mikaChatHeuristicEngine`) podem ser codificados em paralelo por estarem em arquivos completamente independentes.
- **Phase 3**: T007 (`MikaMessageContent`) e T008 (`MikaChatInterface.css`) podem ser criados em paralelo antes de T009.
- **Phase 4 a 6**: As tarefas com o marcador `[P]` operam em subcomponentes ou métodos desacoplados.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Completar Setup (T001) e Foundational (T002 a T006).
2. Construir User Story 1 (T007 a T012).
3. **Validação**: Testar o MVP de forma independente abrindo a gaveta, alternando abas e conversando com a Mika sobre o gargalo do quadro.

### Incremental Delivery
- Incremento 1: Infraestrutura matemática, telemetria e motor heurístico (Foundational).
- Incremento 2: Chat conversacional funcional e chips interativos de tarefas (US1 - MVP).
- Incremento 3: Chips de perguntas rápidas e typing indicator (US2).
- Incremento 4: Persistência local multi-turn, cópia e limpeza (US3).
- Incremento 5: Resiliência offline e badges de provedor (US4).
- Incremento 6: Auditoria constitucional e suites de teste (Polish).
