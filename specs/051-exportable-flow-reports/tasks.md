# Tasks: Relatórios Exportáveis em PDF/Excel (Métricas de Fluxo e Inventário)

**Feature**: `051-exportable-flow-reports`  
**Plan**: [plan.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/051-exportable-flow-reports/plan.md) | **Spec**: [spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/051-exportable-flow-reports/spec.md)  
**Status**: Ready for Implementation  

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Mandatório - Constituição Artigo VI)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Verdades Fundamentais Irredutíveis**:
  - Um relatório de fluxo é uma projeção imutável de leitura sobre um conjunto de dados já existente no cliente (Local-First).
  - O navegador web moderno possui um motor de renderização vetorial e diagramação de impressão nativo, acionável via CSS `@media print` e `window.print()`, sem necessidade de runtime PDF adicional.
  - Uma planilha compatível com Microsoft Excel pt-BR nada mais é do que texto UTF-8 delimitado por ponto-e-vírgula (`;`), decimais separados por vírgula (`,`) e prefixado com o Byte Order Mark UTF-8 (`\uFEFF`).
  - As métricas de fluxo (Throughput, Lead Time, Cycle Time, SLE P85, Taxa de Bloqueios) devem consumir as funções matemáticas consolidadas da aplicação (`src/utils/`), garantindo verdade única sem divergência em relação ao dashboard.
- **Premissas Acidentais Eliminadas**:
  - Descarte completo de bibliotecas externas pesadas para PDF (`jspdf`, `pdfmake`, `puppeteer`) e Excel (`xlsx`, `exceljs`).
  - Descarte de qualquer dependência ou chamada de API externa em nuvem (preservação estrita de privacidade e funcionamento 100% offline).

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- **Cenários de Falha Mapeados & Mitigações Pré-Construídas**:
  - *Falha 1*: Usuário abre o arquivo CSV no Microsoft Excel pt-BR e encontra todas as informações agrupadas na primeira coluna ou caracteres acentuados corrompidos.
    *Mitigação*: Inclusão do BOM `\uFEFF`, delimitador estrito `;`, números formatados com vírgula decimal e escape RFC 4180 para campos com aspas e quebras de linha.
  - *Falha 2*: Impressão em PDF corta cabeçalhos ou cartões de métricas pela metade na transição de página A4.
    *Mitigação*: Estilização `@media print` com regras `break-inside: avoid;`, `@page { size: A4 portrait; margin: 12mm; }` e supressão explícita de todos os elementos interativos web (`.app-header`, `.analytics-nav-header`, botões, etc.).
  - *Falha 3*: Amostragem temporal em quadro recém-criado ou sem itens concluídos no período resulta em divisões por zero e valores `NaN` / `undefined`.
    *Mitigação*: Funções matemáticas com salvaguardas explícitas (`count > 0 ? sum / count : 0`), projetando traços (`-`) ou zeros formatados.
  - *Falha 4*: Ação de exportação causa mutação acidental no estado do quadro ou colunas.
    *Mitigação*: Assinaturas estritamente `readonly`, cópias defensivas dos dados e isolamento das funções de exportação.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas (ME)**:
  - Phase 1 & 2: Infraestrutura compartilhada (tipos e utilitários puros de cálculo e serialização).
  - Phase 3 (US1): Visualização executiva de impressão em PDF (`ExecutiveReportPrintView.tsx` e `.css`).
  - Phase 4 (US2): Serializador CSV/Excel com projeção de 18 colunas e download via Blob URL.
  - Phase 5 (US3): Interface de usuário de configuração de escopo (`ExportReportModal.tsx` e `.css`) e integração de gatilhos em `AnalyticsNavHeader` e `AppHeader`.
  - Final Phase: Polimento, testes de regressão global e validação de build limpo.
- **Coletivamente Exaustivas (CE)**:
  - 100% dos requisitos funcionais (FR-001 a FR-009) e critérios de sucesso mensuráveis (SC-001 a SC-005) estão cobertos por tarefas atômicas executáveis.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- **Alternativa A (Rejeitada)**: Implementar geração de PDF via biblioteca JavaScript client-side (`jspdf` + `html2canvas`).
  *Critério de Poda*: Adicionaria centenas de kilobytes ao bundle, causaria rasterização borrada de textos e falhas de layout em DPIs altos. Violaria o Princípio V (Simplicidade e YAGNI).
- **Alternativa B (Rejeitada)**: Gerar arquivos binários `.xlsx` via `exceljs` ou `sheetjs`.
  *Critério de Poda*: Aumentaria complexidade e dependências sem necessidade real; o padrão CSV com delimitador `;` e BOM UTF-8 satisfaz plenamente os requisitos do Excel pt-BR de forma nativa e instantânea.
- **Alternativa Escolhida**: Visão de impressão em CSS `@media print` + acionamento nativo `window.print()` para PDF; serialização textual RFC 4180 + Blob URL para Excel.

### 5. Critério de Falsificabilidade & Testabilidade (*TDD / Red-Bar First*)
- **Falha demonstrável (Red Bar)**: Criação prévia do arquivo de testes `tests/unit/flowReports.test.ts` com asserções que falham antes da implementação das funções de agregação, serialização e escape.
- **Critério determinístico de aceite (Green Bar)**:
  - 100% dos testes unitários passando em Vitest com exit code 0.
  - Projeção de 18 colunas com formatação pt-BR verificada por testes de string exata.
  - Typecheck limpo com `npx tsc --noEmit` e build de produção limpo com `npm run build`.

### 6. Triangulação Adversarial & Conformidade Constitucional
- **Validação com a Constitution**:
  - *Princípio I (SDD)*: spec.md → plan.md → tasks.md rigorosamente mantidos.
  - *Princípio V (YAGNI)*: Zero dependências npm adicionais introduzidas.
  - *Princípio VII (Independência de Marca)*: Zero vazamento de termos concorrentes; apenas terminologia Metrik e Lean/Kanban.
  - *Princípio VIII (Soberania Local-First)*: Zero chamadas de rede; processamento 100% em memória do cliente.
  - *Princípio IX (Integridade de Dados)*: Operações de exportação estritamente idempotentes e somente-leitura.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de contratos de tipo e estrutura base de testes para os relatórios de fluxo.

- [x] T001 [P] Criar definições de tipos para relatórios em `src/types/reports.ts` (FlowReportSnapshot, TaskExportRow, ExportOptions, FlowReportMetrics, CycleTimePercentiles, MikaInsightSnippet, BlockerReportSummary)
- [x] T002 [P] Configurar estrutura de testes unitários para relatórios em `tests/unit/flowReports.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitários puros de agregação de métricas de fluxo, projeção tabular e serialização CSV.

- [x] T003 [P] Implementar cálculos de métricas de fluxo e geração de snapshot imutável em `src/utils/flowReportExporter.ts` (Throughput, Lead Time médio, Cycle Time médio, SLE 85%, taxa de bloqueios, percentis P50/P85/P95 e tolerância a quadro vazio sem `NaN`)
- [x] T004 [P] Implementar projeção de tarefas para linhas tabulares e serializador CSV pt-BR em `src/utils/flowReportExporter.ts` (18 colunas normativas, BOM `\uFEFF`, delimitador `;`, vírgula decimal `,`, escape RFC 4180 de aspas e quebras de linha)
- [x] T005 Implementar utilitário de download de arquivos via Blob URL no cliente em `src/utils/flowReportExporter.ts`
- [x] T006 Executar testes unitários com TDD em `tests/unit/flowReports.test.ts` e assegurar barra verde (Green-Bar)

**Checkpoint**: Base de cálculo e serialização concluída e 100% verificada por testes unitários.

---

## Phase 3: User Story 1 - Relatório Executivo de Fluxo em PDF para Diretoria e Stakeholders (Priority: P1) 🎯 MVP

**Goal**: Permitir que gestores gerem e exportem relatórios executivos diagramados em PDF prontos para reuniões de governança, utilizando a capacidade nativa de impressão do navegador sem dependências pesadas.

**Independent Test**: Pode ser verificado visualmente e via testes unitários acionando a visualização de impressão e confirmando a presença do cabeçalho institucional, indicadores de fluxo, percentis, diagnósticos da Mika AI e ausência de elementos interativos web.

### Implementation for User Story 1

- [x] T007 [P] [US1] Criar folha de estilos de impressão e layout A4 em `src/components/ExecutiveReportPrintView.css` (`@media print`, `@page { size: A4 portrait; margin: 12mm; }`, `break-inside: avoid;`, ocultação de classes `.app-header`, `.analytics-nav-header` e controles web)
- [x] T008 [P] [US1] Criar componente visual de visualização executiva em `src/components/ExecutiveReportPrintView.tsx` (cabeçalho institucional Metrik, badges de período/amostragem, cartões de KPIs Throughput/Lead/Cycle/SLE/Bloqueios, percentis de Cycle Time e bloco narrativo de diagnósticos da Mika AI)
- [x] T009 [US1] Implementar acionamento nativo de impressão via `window.print()` e controle de ciclo de vida/fechamento em `src/components/ExecutiveReportPrintView.tsx`
- [x] T010 [US1] Adicionar testes de renderização e estrutura do relatório executivo em `tests/unit/flowReports.test.ts`

**Checkpoint**: Relatório Executivo em PDF totalmente funcional, formatado para impressão A4 e testável de forma independente.

---

## Phase 4: User Story 2 - Exportação Tabular de Inventário e Métricas de Fluxo em Planilha Excel/CSV (Priority: P2)

**Goal**: Permitir que analistas e Scrum Masters exportem todos os dados dos cartões com suas métricas computadas para planilhas eletrônicas compatíveis imediatamente com Microsoft Excel pt-BR sem assistentes manuais.

**Independent Test**: Pode ser testado gerando o arquivo CSV e validando via asserções de teste que a string inicia com `\uFEFF`, utiliza delimitador `;`, vírgula decimal e contém as 18 colunas requeridas.

### Implementation for User Story 2

- [x] T011 [P] [US2] Integrar projeção detalhada das 18 colunas normativas em `src/utils/flowReportExporter.ts` (`ID`, `Título`, `Tipo`, `Coluna`, `Categoria`, `Prioridade`, `Responsável`, `Sprint`, `Story Points`, `Criado Em`, `Iniciado Em`, `Concluído Em`, `Lead Time (dias)`, `Cycle Time (dias)`, `Bloqueado`, `Tempo Bloqueado (horas)`, `Tags` e `Total Subtarefas`)
- [x] T012 [P] [US2] Adicionar testes unitários específicos para compatibilidade com Microsoft Excel pt-BR em `tests/unit/flowReports.test.ts` (verificação do BOM `\uFEFF`, delimitador `;`, separador decimal `,` e tratamento de campos nulos com `-`)
- [x] T013 [US2] Implementar pipeline de exportação de planilha com feedback visual e logging estruturado `[Metrik Report]` em `src/utils/flowReportExporter.ts`

**Checkpoint**: Exportação tabular para Microsoft Excel pt-BR operando com integridade e cobertura automatizada.

---

## Phase 5: User Story 3 - Configuração e Personalização do Escopo de Exportação (Priority: P3)

**Goal**: Fornecer um modal unificado para que o usuário escolha o formato desejado (PDF vs. Planilha), revise a amostragem temporal e personalize a inclusão de diagnósticos da Mika AI e subtarefas.

**Independent Test**: Pode ser testado abrindo o diálogo a partir de `AnalyticsNavHeader` ou `AppHeader`, alterando opções de filtro/seções e confirmando que o documento gerado respeita o escopo selecionado.

### Implementation for User Story 3

- [x] T014 [P] [US3] Criar folha de estilos do modal de configuração de exportação em `src/components/ExportReportModal.css`
- [x] T015 [P] [US3] Implementar componente de diálogo de exportação em `src/components/ExportReportModal.tsx` (seleção de formato PDF vs. Planilha, resumo de escopo/tarefas, alternadores para Mika AI e subtarefas, acessibilidade com tecla `Escape`)
- [x] T016 [US3] Integrar botão de ação de disparo "Exportar Relatório" com ícone e acessibilidade no cabeçalho analítico em `src/components/AnalyticsNavHeader.tsx`
- [x] T017 [US3] Integrar ação de exportação de relatório no cabeçalho geral do aplicativo em `src/components/AppHeader.tsx`
- [x] T018 [US3] Conectar o estado do modal e acionamento de exportação no painel de controle principal em `src/components/AnalyticsDashboard.tsx` e `src/App.tsx`
- [x] T019 [US3] Adicionar testes de integração para o modal e gatilhos de exportação em `tests/unit/flowReports.test.ts`

**Checkpoint**: Interface de configuração e gatilhos integrados em todas as telas analíticas e de quadro do Metrik.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de conformidade constitucional, documentação viva e garantia de zero regressões.

- [x] T020 [P] Atualizar documentação e registrar guia de execução em `specs/051-exportable-flow-reports/quickstart.md`
- [x] T021 Executar suíte completa de testes automatizados via Vitest (`npm run test`) e garantir 0 regressões
- [x] T022 Validar verificação estática de tipos via TypeScript (`npx tsc --noEmit`) com 0 erros
- [x] T023 Executar build de produção do Vite (`npm run build`) e validar integridade do bundle

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende da conclusão da Phase 1 — BLOQUEIA a implementação das User Stories.
- **User Story 1 (Phase 3 - P1 / MVP)**: Depende da Phase 2 — pode ser testada e entregue de forma independente.
- **User Story 2 (Phase 4 - P2)**: Depende da Phase 2 — pode ser executada em paralelo com US1 se houver capacidade.
- **User Story 3 (Phase 5 - P3)**: Depende das Phases 2, 3 e 4 para orquestrar e disparar os formatos de exportação.
- **Polish (Final Phase)**: Depende da conclusão de todas as User Stories.

### Parallel Opportunities

- **Phase 1**: T001 e T002 podem rodar em paralelo.
- **Phase 2**: T003 e T004 podem rodar em paralelo (arquivos/funções complementares).
- **Phase 3 (US1)**: T007 (CSS) e T008 (TSX) podem ser criados em paralelo.
- **Phase 4 (US2)**: T011 e T012 podem ser desenvolvidos em paralelo com TDD.
- **Phase 5 (US3)**: T014 (CSS) e T015 (TSX) podem ser criados em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Concluir Phase 1 (Setup) e Phase 2 (Foundational).
2. Implementar Phase 3 (User Story 1 - Relatório PDF Executivo).
3. **VALIDAR**: Verificar visualmente a impressão em PDF A4 e executar testes unitários.
4. Entregar MVP para avaliação de stakeholders.

### Incremental Delivery
1. Setup + Foundational → Base testada.
2. US1 → Relatório Executivo em PDF entregue (MVP).
3. US2 → Exportação Tabular para Excel pt-BR entregue.
4. US3 → Modal de parametrização e gatilhos integrados em `AnalyticsNavHeader` e `AppHeader`.
5. Polish → Verificação global de testes, TypeScript e build de produção.
