# Feature Specification: 055 — Governança Documental & Eliminação de Dívida Técnica

**Feature Branch**: `055-documentary-governance-debt`  
**Created**: 2026-11-03  
**Status**: Implemented & Verified (2026-11-04)  
**Input**: User description: "🧹 Governança Documental & Dívida Técnica Pendente"

---

## Contexto & Propósito

O Metrik atingiu um alto nível de maturidade técnica e analítica, com 54 funcionalidades especificadas e 926 testes automatizados verdes. No entanto, após ciclos intensos de entrega de código, surgem divergências documentais e dívida técnica secundária que violam princípios da Constituição do projeto:

1. **Constituição I (Especificação Viva & SDD)**: Algumas especificações com código 100% implementado, testado e em produção na branch `main` ainda constam com cabeçalho `Status: Draft` (notadamente a Feature 053 — Políticas de Fluxo & Automações, além das Features 048, 049 e 050).
2. **Constituição I & III (Rastreabilidade & Verdade Documental)**: As 34 tarefas da Feature 053 ainda não foram sincronizadas no rastreador de issues do GitHub, deixando uma lacuna histórica de rastreabilidade entre a Issue #453 (Feature 052) e a Issue #454 (Feature 054).
3. **Constituição IV (Transparência & Visão Factual)**: O documento de visão e rumo do produto (`specs/043-system-health-and-roadmap/vision.md`) ainda documenta o estado de 08/10/2026 (701 testes, 5 testes falhando por dependência temporal, cobertura inerte), quando o sistema já eliminou todas as falhas e alcançou 926 testes verdes sem qualquer regressão.
4. **Constituição X (Governança & Aprendizados Duráveis)**: Os aprendizados críticos obtidos com a entrega das Features 053 (automações reativas sem código e políticas explícitas de coluna) e 054 (percentis dinâmicos de SLE, interpolação linear NIST e salvaguardas de envelhecimento) precisam ser formalizados no arquivo de memória viva `lessons-learned.md`.

Esta funcionalidade tem como objetivo **restaurar a integridade factual plena de 100% dos artefatos vivos de governança do repositório**, eliminando inconsistências e assegurando que nenhum desenvolvedor ou agente seja induzido ao erro por documentação defasada.

---

## Clarifications

### Session 2026-11-04

- Q: Qual deve ser a abrangência exata da reconciliação de status em `specs/*/spec.md`? → A: Auditar e reconciliar todas as especificações com código na `main` que ainda constam como `Draft` (especificamente `specs/053`, `specs/050`, `specs/049` e `specs/048`), deixando intactas as que já foram ratificadas anteriormente.
- Q: Como o teste automatizado de governança (`documentaryGovernance.test.ts`) deve validar o status das especificações no pipeline? → A: Gate bloqueante no Vitest/CI que falha dinamicamente se qualquer especificação de funcionalidade entregue na `main` estiver como `Draft` ou fora do padrão canônico `**Status**: Implemented & Verified (<data>)`.
- Q: Como o documento de visão (`specs/043-system-health-and-roadmap/vision.md`) deve tratar as oportunidades históricas resolvidas e os novos horizontes do roadmap? → A: Preservar o histórico evolutivo completo, marcando formalmente as oportunidades anteriores como superadas (`[x] Resolvida na Feature NNN`), consolidando as novas métricas de saúde (926 testes, 54 features) e adicionando os novos horizontes analíticos do roadmap.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconciliação do Status Canônico das Especificações Entregues (Priority: P1) 🎯 MVP

Como mantenedor ou colaborador do projeto,  
quero que todas as especificações funcionais correspondentes a capacidades implementadas e ativas na branch `main` declarem expressamente o status `Implemented & Verified (<data-ratificação>)`,  
para que o estado do produto real seja imediatamente evidente sem necessidade de inspeção manual cruzada entre código e Git.

**Why this priority**: É a violação direta do Artigo I da Constituição e do contrato do SpecKit. Ter código em produção com especificação em `Draft` induz agentes a reimplementar ou alterar comportamentos consolidados.

**Independent Test**: Inspecionar todos os arquivos `specs/*/spec.md` no repositório. Nenhuma funcionalidade com código ativo em `main` deve exibir `Status: Draft`. As especificações 048, 049, 050 e 053 devem exibir o cabeçalho ratificado.

**Acceptance Scenarios**:

1. **Given** a especificação `specs/053-flow-automation-policies/spec.md` cujo código e 34 testes já foram integrados na `main`,  
   **When** realizada a auditoria de governança,  
   **Then** o cabeçalho deve ser atualizado para `**Status**: Implemented & Verified (2026-11-02)`.

2. **Given** as especificações `specs/048-mika-ai-flow-copilot/spec.md`, `specs/049-modular-decomposition/spec.md` e `specs/050-artifact-governance-reconciliation/spec.md`,  
   **When** auditadas contra o histórico de commits e testes unitários existentes,  
   **Then** seus respectivos cabeçalhos devem ser reconciliados para `**Status**: Implemented & Verified (<data>)`.

3. **Given** a suíte de testes de integridade documental `tests/unit/documentaryGovernance.test.ts`,  
   **When** executada via `npm test`,  
   **Then** todas as asserções de cabeçalho padronizado devem passar com 100% de sucesso.

---

### User Story 2 - Atualização da Visão do Sistema e Métricas Reais de Saúde (Priority: P2)

Como líder técnico ou stakeholder do produto,  
quero consultar o documento `specs/043-system-health-and-roadmap/vision.md` e encontrar os números e diagnósticos exatos do estado presente do Metrik,  
para tomar decisões estratégicas de evolução e arquitetura com base na realidade factual e não em métricas defasadas de meses anteriores.

**Why this priority**: A visão é o mapa de rumo do Metrik. Manter um diagnóstico que declara "5 testes falhando" e "701 testes" quando o sistema possui 926 testes verdes mina a confiança na documentação viva.

**Independent Test**: Abrir `specs/043-system-health-and-roadmap/vision.md` e validar que as tabelas de resumo executivo, arquitetura, contagem de testes (926 testes em 150 arquivos) e lista de capacidades refletem a totalidade das 54 features concluídas.

**Acceptance Scenarios**:

1. **Given** o documento de visão em `specs/043-system-health-and-roadmap/vision.md`,  
   **When** atualizado nesta reconciliação,  
   **Then** a tabela do Sumário Executivo deve registrar:  
   - Testes automatizados: 🟢 926 passando de 926 (150 arquivos, 0 falhas).  
   - Build de produção: 🟢 Aprovado em menos de 5 segundos.  
   - Análise estática: 🟢 0 erros de linter.  
   - Formatação: 🟢 100% aderente ao Prettier.  
   - Capacidades especificadas: 54 funcionalidades entregues (specs 001 a 054).

2. **Given** a seção de Próximos Passos e Rumo do produto no `vision.md`,  
   **When** revisada,  
   **Then** deve marcar como superadas as oportunidades OPP-007 (falha de testes temporais), OPP-008, OPP-009 e apontar os novos horizontes analíticos (Monte Carlo com Throughput, Matriz de Eficiência de Fluxo).

---

### User Story 3 - Sincronização de Tarefas da Feature 053 no GitHub Issues (Priority: P3)

Como membro do time acompanhando o backlog e o histórico de entregas,  
quero que as 34 tarefas da Feature 053 (Automações de Fluxo & Políticas de Cartão) estejam registradas como issues no GitHub com seus respectivos fechamentos,  
para que o histórico de issues do repositório `rogerteg/Metrik` não apresente saltos de rastreabilidade entre a Issue #453 e a Issue #454.

**Why this priority**: Mantém a paridade entre o SpecKit local (`tasks.md`) e a governança pública no GitHub, permitindo rastrear no histórico quem fez o que e quando.

**Independent Test**: Consultar as issues do repositório `rogerteg/Metrik` via GitHub CLI e verificar a existência e encerramento das issues de T001 a T034 da Feature 053 com a etiqueta/título padronizado `[Feature 053] T###: ...`.

**Acceptance Scenarios**:

1. **Given** as 34 tarefas concluídas em `specs/053-flow-automation-policies/tasks.md`,  
   **When** executado o processo de sincronização de tarefas para issues,  
   **Then** são criadas 34 issues no repositório GitHub `rogerteg/Metrik` contendo o título padronizado `[Feature 053] T###: <descrição>`, o corpo com links para a spec/plan e o status `Concluída ([x])`.

2. **Given** as issues criadas para tarefas já entregues,  
   **When** concluída a criação,  
   **Then** todas as 34 issues devem ser fechadas (`closed`) com comentário de auditoria referenciando a entrega da Feature 053.

---

### User Story 4 - Consolidação dos Aprendizados e Contexto do Projeto (Priority: P4)

Como agente de IA ou desenvolvedor iniciando uma nova sessão no Metrik,  
quero ler o arquivo `.specify/memory/lessons-learned.md` e `.specify/memory/project-context.md` e encontrar os padrões arquiteturais validados nas Features 053 e 054,  
para não repetir armadilhas técnicas conhecidas (como temporal divergence em testes, overflow de linhas de código ou acoplamento de timers).

**Why this priority**: A Constituição X exige que todo aprendizado operacional ou de design que previna erros futuros seja formalmente registrado na memória viva.

**Independent Test**: Inspecionar `.specify/memory/lessons-learned.md` e verificar a presença explícita das lições aprendidas sobre (1) desacoplamento de tempo com `referenceDate` em hooks de aging/SLE, (2) guarda de profundidade única para evitar loops em automações reativas e (3) respeito ao teto constitucional de 400 linhas por arquivo.

**Acceptance Scenarios**:

1. **Given** as lições aprendidas durante o ciclo de desenvolvimento das Features 053 e 054,  
   **When** auditado o arquivo `.specify/memory/lessons-learned.md`,  
   **Then** deve conter novas seções documentando:  
   - **Previsibilidade Dinâmica (SLE)**: Uso obrigatório de parâmetro de data de referência (`referenceDate?: Date`) em testes para blindagem contra relógio do sistema (*temporal skew*).  
   - **Automações de Fluxo Sem Código**: Regra de Profundidade Única (Depth = 1) com flag `isAutomated: true` para evitar recursão em cascata.  
   - **Guarda de Modularidade**: Manutenção de arquivos complexos (`App.tsx`, `useTaskCollection.ts`) abaixo de 400 linhas através de extração de sub-hooks especialistas e componentes puros de apresentação.

2. **Given** o arquivo `.specify/memory/project-context.md`,  
   **When** atualizado,  
   **Then** o total de funcionalidades entregues deve ser ajustado para 54 e as novas entidades (`FlowRule`, `ColumnPolicy`, `SleConfig`, `CardSlePrediction`) devem constar na tabela de modelos principais.

---

## Edge Cases

- **O que acontece se uma especificação antiga não possuir a seção de status?**  
  A ferramenta de auditoria deve inserir o cabeçalho padronizado logo após o título principal sem destruir o conteúdo da introdução.
- **O que acontece se o token do GitHub CLI não tiver permissão para criar issues?**  
  O script deve reportar o erro claramente com instrução para reautenticação (`gh auth login`), mantendo o restante da governança local funcional e sem corrupção de arquivos.
- **O que acontece se um arquivo de teste falhar durante a reconciliação?**  
  Nenhum artefato deve ser ratificado como entregue até que a suíte completa de testes (`npm test -- --run`) passe com 100% de sucesso.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE auditar e reconciliar o cabeçalho de todas as especificações funcionais em `specs/*/spec.md` relativas a funcionalidades entregues na `main` que ainda constam como `Draft` (`specs/053`, `specs/050`, `specs/049` e `specs/048`), atualizando o campo `Status:` para `**Status**: Implemented & Verified (<data-ratificação>)`.
- **FR-002**: O sistema DEVE atualizar especificamente a especificação `specs/053-flow-automation-policies/spec.md` para o status `Implemented & Verified (2026-11-02)`, refletindo suas 34 tarefas e testes unitários concluídos.
- **FR-003**: O sistema DEVE atualizar a especificação e o documento de visão em `specs/043-system-health-and-roadmap/vision.md` preservando o histórico evolutivo (marcando oportunidades anteriores como `[x] Resolvida`), declarando formalmente a fotografia presente (54 funcionalidades entregues, 926 testes automatizados verdes e 0 falhas em 150 arquivos) e incorporando as novas frentes analíticas do roadmap.
- **FR-004**: O sistema DEVE sincronizar as 34 tarefas da Feature 053 criando e encerrando as respectivas issues no GitHub `rogerteg/Metrik` no padrão `[Feature 053] T###: <descrição>`.
- **FR-005**: O sistema DEVE registrar na memória viva `.specify/memory/lessons-learned.md` as diretrizes consolidadas nas Features 053 e 054 (anti-loops de automação, isolamento de relógio em testes de aging e governança de limite de linhas).
- **FR-006**: O sistema DEVE atualizar `.specify/memory/project-context.md` atualizando a versão do catálogo de features para 54 e incorporando as entidades de regras de fluxo e predição de SLE.
- **FR-007**: O sistema DEVE atualizar o teste de governança documental `tests/unit/documentaryGovernance.test.ts` para atuar como um gate bloqueante no Vitest/CI, asserindo dinamicamente que nenhuma especificação de funcionalidade entregue na `main` (`specs/001` a `specs/054`) permaneça com `Status: Draft` ou formato divergente do padrão canônico `**Status**: Implemented & Verified (<data>)`.
- **FR-008**: O sistema DEVE garantir que todas as modificações respeitam rigorosamente a Constituição II (máximo de 400 linhas por arquivo) e a Constituição VII (zero menções a marcas ou ferramentas comerciais concorrentes).

---

## Success Criteria *(mandatory)*

- **SC-001**: **100% de Conformidade Documental**: Zero especificações correspondentes a código em `main` constando com status `Draft`.
- **SC-002**: **Rastreabilidade GitHub Completa**: Todas as 34 tarefas da Feature 053 registradas e fechadas no repositório oficial do GitHub, sem buracos na linha histórica de issues.
- **SC-003**: **Suíte de Testes Verde e Expandida**: Suíte completa de testes (`npm test -- --run`) executada com sucesso total (pelo menos 926 testes passando e zero falhas/regressões).
- **SC-004**: **Qualidade de Código e Formatação Impecáveis**: Execuções de `npm run lint`, `npm run build` e `npm run format:check` finalizadas com zero erros e zero avisos bloqueantes.

---

## Assumptions

- As 34 tarefas da Feature 053 já possuem implementação física completa e testes dedicados no código-fonte (`flowRulesEngine.ts`, `useFlowRules.ts`, `ColumnPolicyModal.tsx`, etc.).
- O acesso ao GitHub CLI (`gh`) possui escopo e token válidos para criação de issues no repositório `rogerteg/Metrik`.
- Nenhuma modificação desta feature altera o comportamento visual ou funcional em runtime do quadro Kanban, focando estritamente em verdade factual, governança de repositório e eliminação de dívida técnica documental.

