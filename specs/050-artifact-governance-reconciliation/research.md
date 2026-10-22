# Technical Research & Architectural Decisions: Reconciliação Documental de Artefatos (Fase 2 do Roadmap)

**Feature**: `050-artifact-governance-reconciliation`  
**Date**: 2026-10-21  
**Author**: Antigravity / DeepMind Team  
**Status**: Completed  

---

## 1. Visão Geral e Contexto Técnico

A Fase 2 do Roadmap estratégico do Metrik (`specs/043-system-health-and-roadmap/vision.md`) tem como meta precípua restaurar a confiabilidade da precedência documental do repositório:
$$\text{constitution.md} > \text{project-context.md} > \text{lessons-learned.md} > \text{spec.md} > \text{plan.md} > \text{tasks.md} > \text{código}$$

As investigações do diagnóstico de saúde do sistema identificaram 5 oportunidades centrais de governança:
- **OPP-010**: 32 especificações de funcionalidades já entregues com status declarado divergente da entrega real (19 como rascunho `Draft`, 11 sem declaração de status e 2 em pré-implementação).
- **OPP-011**: 3 marcadores `[NEEDS CLARIFICATION]` abertos na especificação `specs/023-team-access-control/spec.md`, cujas decisões arquiteturais já estão consolidadas no Artigo VIII da Constituição do Metrik.
- **OPP-012**: 5 arquivos de tarefas legados (`specs/005` a `specs/009`, `tasks.md`) com 55 tarefas nunca marcadas (`- [ ]`), gerando falsos positivos em ferramentas de varredura.
- **OPP-013**: 14 ramificações locais e 3 remotas no repositório que já foram integralmente incorporadas à linha principal `main` (`git branch --merged main`).
- **OPP-017**: Mais de 170 itens de checklist em aberto em 10 especificações preexistentes sem classificação explícita entre verificado, não aplicável ou bloqueio formal de ambiente.

---

## 2. Decisões Arquiteturais e Fundamentações (D1 - D6)

### Decisão 1: Critério Canônico e Algoritmo de Reconciliação de Status (OPP-010)

- **Decisão**: Adotar estritamente a definição constitucional de funcionalidade entregue estabelecida em **FR-024** da especificação 043:
  > *Uma funcionalidade é considerada entregue se, e somente se: (a) o código que implementa suas capacidades está presente na linha principal `main`; e (b) a funcionalidade está referenciada no registro de mudanças `CHANGELOG.md`.*
- **Padrão Textual Canônico**: Conforme clarificado na sessão de `/speckit-clarify` de 2026-10-21, o cabeçalho de todas as especificações entregues deve ser padronizado exatamente como:
  ```markdown
  **Status**: Implemented & Verified (2026-10-21)
  ```
- **Escopo de Aplicação**:
  - `specs/001-core-kanban-board` até `specs/042-sprint-burnup`: Todas atendem cumulativamente a FR-024(a) e FR-024(b).
  - `specs/044-pipeline-reliability` até `specs/047-static-quality-governance`: Já implementadas e integradas.
  - `specs/048-mika-ai-flow-copilot`, `specs/049-modular-decomposition`, `specs/050-artifact-governance-reconciliation`: Permanecem em `Draft` ou status ativo do ciclo em andamento.
- **Tratamento de Arquivos sem `Status` (`specs/005` a `specs/015`)**:
  - Inserir a linha padronizada imediatamente após `**Created**: ...` ou `**Feature Branch**: ...`.
- **Alternativas Consideradas**:
  - *Alternativa descartada*: Manter formatos mistos (`Completed`, `Implemented & Converged`, `Draft`). Rejeitada porque impede asserções determinísticas de regex em testes de governança automatizada.

---

### Decisão 2: Resolução Constitucional dos Marcadores da Spec 023 (OPP-011)

- **Decisão**: Substituir os três marcadores `[NEEDS CLARIFICATION]` de `specs/023-team-access-control/spec.md` pelas diretrizes já soberanas na Constituição v1.7.0:
  1. **FR-003 (`auth-mode`)**:
     - *Texto Original*: `[NEEDS CLARIFICATION: auth-mode - Como o Metrik opera como SPA client-side sem backend obrigatório, a autenticação e troca de perfil devem operar via sessão local-first com simulação multi-usuário ou requer integração externa com backend OAuth2/Firebase?]`
     - *Texto Resolvido*: `O sistema opera sob modelo de Soberania Local-First (Constituição Artigo VIII.1 e VIII.5), gerenciando perfis multi-usuário e chaveamento de sessão localmente no localStorage do navegador, sem dependência mandatória de servidores externos de autenticação, dispondo de sincronização bidirecional em nuvem opcional e não-bloqueante.`
  2. **FR-008 (`guest-permissions`)**:
     - *Texto Original*: `[NEEDS CLARIFICATION: guest-permissions - Usuários com papel 'Convidado' (Guest) devem possuir acesso estritamente somente-leitura aos boards da squad ou podem também criar e mover cartões nas colunas?]`
     - *Texto Resolvido*: `Usuários atribuídos ao papel de Convidado (guest) possuem acesso estritamente somente-leitura aos quadros e métricas da squad (Constituição Artigo VIII.4), sendo estruturalmente bloqueadas quaisquer operações de mutação, criação, edição, deleção de cartões ou reordenação de colunas.`
  3. **FR-011 (`board-creation-scope`)**:
     - *Texto Original*: `[NEEDS CLARIFICATION: board-creation-scope - Todo novo quadro deve obrigatoriamente pertencer a um time, ou devem ser suportados quadros pessoais individuais não vinculados a squads?]`
     - *Texto Resolvido*: `Todo quadro Kanban pertence obrigatoriamente a uma squad específica (Constituição Artigo VIII.2), não sendo admitidos quadros órfãos ou desvinculados; a criação de novos quadros associa-os de forma automática à squad e workspace ativos na sessão (CHANGELOG v0.2.0).`
- **Alternativas Consideradas**:
  - *Alternativa descartada*: Manter as dúvidas documentadas como histórico. Rejeitada porque marcadores `[NEEDS CLARIFICATION]` em código em produção sinalizam especificação incompleta e geram advertências nas auditorias de governança.

---

### Decisão 3: Reconciliação Histórica dos Arquivos de Tarefas Legados (OPP-012)

- **Decisão**: Em `specs/005/tasks.md` a `specs/009/tasks.md`:
  - Marcar todos os 55 itens de tarefas anteriormente desmarcados como concluídos: `- [x]`.
  - Atualizar o aviso de cabeçalho declarando explicitamente a entrega histórica consolidada:
    ```markdown
    > ⚠️ **Entrega Histórica**: Capacidades integralmente implementadas, testadas e verificadas na versão v0.1.0 (2026-09-29). Este artefato é um registro histórico reconciliado em 2026-10-21; todas as tarefas foram formalmente concluídas.
    ```
- **Justificativa**: Scanners automatizados e scripts de pré-requisitos (`check-prerequisites.ps1`) interpretam `- [ ]` como pendência em aberto. Marcar `- [x]` elimina o ruído analítico sem falsear a história, pois o software já se encontra entregue e verde.
- **Alternativas Consideradas**:
  - *Alternativa descartada*: Deletar os arquivos `tasks.md`. Rejeitada porque viola a integridade do ciclo SDD e a trilha de auditoria do SpecKit.
  - *Alternativa descartada*: Deixar desmarcado e ignorar na contagem. Rejeitada por fragilidade e violação da clareza declarativa (Constituição IV).

---

### Decisão 4: Higienização Segura das Ramificações Mescladas (OPP-013)

- **Decisão**:
  - **Ramificações Locais (14)**: Executar `git branch -d <branch>` para cada ramificação confirmada em `git branch --merged main`:
    - `019-monte-carlo-simulation`, `020-wip-aging-chart`, `021-throughput-histogram-timeline`, `022-theme-configuration`, `023-team-access-control`, `024-task-types-and-linking`, `025-blocked-task-movement-lock`, `026-cross-browser-column-layout`, `027-card-subtasks-and-comments`, `028-admin-menu-header-layout`, `029-workspace-hub-and-settings`, `031-premium-board-management`, `032-task-comment-autosave`, `035-clickup-task-activity-redesign`.
    - O flag `-d` do Git é seguro por padrão: ele aborta caso qualquer commit não esteja mesclado na branch ativa.
  - **Ramificações Remotas (3)**: Executar tentativa automatizada via `git push origin --delete 024-task-types-and-linking 029-workspace-hub-and-settings 031-premium-board-management` seguida de `git fetch --prune`. Se houver bloqueio de rede ou permissão de push, emitir relatório de fechamento com os comandos exatos para execução pelo mantenedor.
- **Alternativas Consideradas**:
  - *Alternativa descartada*: Usar `git branch -D` (deleção forçada). Rejeitada para evitar qualquer risco de perda de código não mesclado.

---

### Decisão 5: Auditoria e Resolução de Checklists em Aberto (OPP-017)

- **Decisão**: Auditar os 11 arquivos de checklist listados no levantamento e aplicar resolução explícita para cada item:
  1. **Itens Verificados por Testes Automatizados ou Código**: Marcar como `- [x]`. Exemplos: regras de controle de acesso da squad (`access-control.md`), autosave de comentários e atalhos (`task-comment-autosave.md`), layout e acessibilidade de cabeçalhos (`header-layout-and-accessibility.md`), linha do tempo e auditoria (`ux-and-audit.md`), e redesign de detalhes de tarefa (`ux.md`).
  2. **Itens com Dependência Externa ou Bloqueio de Ambiente**: Em `specs/026-cross-browser-column-layout/checklists/browser-parity.md` (44 itens de medição em Safari/WebKit no Windows), registrar a cláusula formal de **Bloqueio de Ambiente (Constituição III e IV)**:
     ```markdown
     > **Bloqueio de Ambiente Registrado (2026-10-21)**: A medição física nos motores WebKit/Safari requer ambiente macOS/iOS não disponível no host de desenvolvimento. A paridade geométrica permanece assegurada em tempo de compilação por invariantes de CSS e pelo harness de paridade automatizado em Chromium.
     ```
  3. **Checklist de Prontidão da Spec 043 (`planning-readiness.md`)**: Ratificar a aprovação formal do revisor sobre as 36 verificações de diagnóstico, marcando-as como auditadas e referenciando o `vision.md`.
- **Alternativas Consideradas**:
  - *Alternativa descartada*: Marcar testes não executados no host como `[x]` sem evidência. Rejeitada terminantemente pelo Princípio III da Constituição ("Manual inspection alone NEVER constitutes verification").

---

### Decisão 6: Automação da Governança e Trava contra Regressão Documental

- **Decisão**: Criar o teste unitário de governança `tests/unit/documentaryGovernance.test.ts`.
- **Responsabilidades da Trava**:
  1. Varre `specs/*/spec.md` para as features `001` a `042` e `044` a `047` comprovando que todas contêm `**Status**: Implemented & Verified`.
  2. Varre `specs/023-team-access-control/spec.md` comprovando que a contagem de `[NEEDS CLARIFICATION` é zero.
  3. Varre `specs/005` a `specs/009` (`tasks.md`) comprovando que a contagem de checkboxes não marcados (`^\s*-\s*\[\s*\]`) é zero.
  4. Executa `git branch --merged main` comprovando que nenhuma das 14 branches antigas permanece no ambiente local.
- **Integração**: Integra-se à suíte do Vitest (`npm test`), tornando a governança documental um gate executável inquebrável (Constituição Artigo III).
