# Feature Specification: Relatórios Exportáveis em PDF/Excel (Métricas de Fluxo e Inventário)

**Feature Branch**: `051-exportable-flow-reports`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "relatórios exportáveis em PDF/Excel, automações de fluxo, ou integrações externas" (selecionada opção de Relatórios Exportáveis em PDF/Excel)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Relatório Executivo de Fluxo em PDF para Diretoria e Stakeholders (Priority: P1)

Como Delivery Manager, Agile Coach ou Líder Técnico, desejo gerar e exportar um relatório executivo formal em PDF com a saúde e métricas de fluxo do quadro Kanban, para apresentar resultados a executivos, clientes e stakeholders em reuniões de prestação de contas sem necessidade de acesso direto à ferramenta.

**Why this priority**: É a entrega central de maior valor perceptível para tomadores de decisão; viabiliza reuniões de governança, auditorias de entrega e alinhamentos de SLA/SLE com relatórios com padrão visual executivo.

**Independent Test**: Pode ser testado clicando em "Exportar Relatório PDF" na aba Analytics, gerando um documento PDF diagramado com métricas de fluxo (Throughput, Lead Time, Cycle Time P85, CFD, diagnósticos da Mika e taxa de bloqueios) perfeitamente renderizados e prontos para impressão ou compartilhamento.

**Acceptance Scenarios**:

1. **Given** um quadro ativo com tarefas em andamento e concluídas, **When** o usuário clica em "Exportar Relatório PDF" no painel de Analytics, **Then** o sistema gera um documento PDF formatado contendo cabeçalho executivo, resumo de KPIs de fluxo, percentis de Cycle Time (P50, P85, P95), distribuição de vazão, taxa de impedimentos e diagnósticos ativos da Mika AI.
2. **Given** o relatório gerado em PDF, **When** visualizado ou impresso em formato A4/paisagem, **Then** a diagramação respeita quebras de página limpas, tipografia legível, identidade visual elegante do Metrik e ausência de elementos interativos ou controles de interface da web.
3. **Given** um quadro operando em modo offline (Local-First), **When** a exportação em PDF é solicitada, **Then** a renderização e download ocorrem 100% no navegador do cliente sem enviar requisições de dados sensíveis para serviços externos.

---

### User Story 2 - Exportação Tabular de Inventário e Métricas de Fluxo em Planilha Excel/CSV (Priority: P2)

Como Analista de Processos, Scrum Master ou Engenheiro de Dados, desejo exportar os dados tabulares completos de todos os cartões do quadro com suas métricas computadas (Lead Time em dias, Cycle Time em dias, tempo bloqueado, sprint, estimativas e tags) para uma planilha eletrônica (.xlsx/.csv), para cruzar dados no Excel, PowerBI ou Google Sheets.

**Why this priority**: Atende à necessidade de análises aprofundadas, criação de gráficos ad-hoc pelas equipes e integração de relatórios manuais em ferramentas corporativas de BI.

**Independent Test**: Pode ser testado acionando "Exportar Planilha (Excel/CSV)", validando que o arquivo baixado contém cabeçalhos descritivos padronizados, codificação UTF-8 com BOM (abrindo acentos perfeitamente no Microsoft Excel) e valores numéricos corretos para métricas de tempo.

**Acceptance Scenarios**:

1. **Given** um conjunto de tarefas filtradas ou totais no quadro, **When** o usuário solicita a exportação em planilha, **Then** o sistema gera um arquivo contendo todas as colunas essenciais: ID, Título, Tipo (Card/Subtask/Initiative), Coluna Atual, Categoria, Prioridade, Responsável, Sprint, Estimativa (Story Points), Data Criação, Data Início, Data Conclusão, Lead Time (dias), Cycle Time (dias), Status Bloqueado, Tempo Bloqueado e Etiquetas.
2. **Given** cartões com caracteres especiais em português (ex.: "Atenção", "Concluído", "Impedimento"), **When** a planilha é aberta no Microsoft Excel ou Google Sheets, **Then** todos os textos e acentos são exibidos corretamente sem caracteres corrompidos.
3. **Given** que o usuário aplicou filtros na gaveta de Dataset (ex.: janela dos últimos 30 dias ou tipo específico de cartão), **When** a exportação é acionada, **Then** a planilha reflete com precisão o escopo filtrado ativo, indicando os critérios no sumário.

---

### User Story 3 - Configuração e Personalização do Escopo de Exportação (Priority: P3)

Como usuário do Metrik, desejo poder personalizar o escopo antes da geração do relatório (selecionando janela temporal, seções incluídas como gráficos do CFD/Scatter, e inclusão de diagnósticos da Mika), para gerar documentos focados nas necessidades específicas da reunião.

**Why this priority**: Reduz o ruído em reuniões focadas em temas específicos (ex.: apenas impedimentos, ou apenas previsibilidade de vazão).

**Independent Test**: Pode ser testado abrindo o modal de opções de exportação, desmarcando uma seção (ex.: omitir detalhes de bloqueios) e confirmando que o documento final respeita a seleção.

**Acceptance Scenarios**:

1. **Given** o diálogo de exportação aberto, **When** o usuário altera a janela temporal para "Últimos 14 dias" e desmarca "Incluir diagnósticos da Mika", **Then** o relatório gerado calcula as métricas estritamente para o período selecionado e omite o bloco de IA.
2. **Given** um quadro sem nenhuma tarefa concluída no período, **When** a exportação é gerada, **Then** o relatório exibe mensagens contextuais informativas e limpas nos cartões de métricas em vez de erros ou valores vazios como `NaN` ou `undefined`.

---

### Edge Cases

- **Quadro com zero tarefas**: O relatório PDF e a planilha geram uma estrutura consistente com cabeçalhos informativos e mensagem amigável de "Nenhum dado registrado para o período", sem travar a interface.
- **Tarefas com descrições muito longas ou caracteres multilinha**: O relatório tabular e o PDF tratam quebras de linha preservando o formato sem quebrar as linhas do arquivo exportado.
- **Ambiente desconectado ou offline**: Todas as rotinas de geração e parsing funcionam integralmente no cliente via APIs web nativas e utilitários locais, preservando a Soberania Local-First (Constituição VIII).
- **Tarefas com campos opcionais nulos (ex.: sem sprint, sem estimativa, sem bloqueio)**: As células e campos correspondentes exibem traços (`-`) ou valores nulos explícitos em vez de falhas de renderização.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma ação visível e acessível de "Exportar Relatório" tanto no painel de Analytics (`AnalyticsNavHeader`) quanto no menu de ações do quadro.
- **FR-002**: O sistema DEVE permitir a exportação em formato PDF com layout executivo formatado para impressão (A4 paisagem/retrato), contendo cabeçalho institucional, indicadores de fluxo e gráficos essenciais.
- **FR-003**: O relatório executivo DEVE consolidar os seguintes KPIs de fluxo: Throughput total do período, Lead Time médio formatado, Cycle Time médio formatado, Expectativa de Nível de Serviço (SLE no percentil 85%) com taxa de conformidade, e Taxa de Bloqueios (%).
- **FR-004**: O relatório em PDF DEVE incluir os diagnósticos narrativos da Mika AI Flow Copilot vigentes para o período, evidenciando gargalos e recomendações de fluxo.
- **FR-005**: O sistema DEVE permitir a exportação tabular de tarefas em planilha compatível com Excel e ferramentas de BI via formato padronizado com codificação UTF-8 e BOM (`\uFEFF`).
- **FR-006**: A exportação tabular DEVE conter colunas normalizadas: `ID`, `Título`, `Tipo`, `Coluna`, `Categoria`, `Prioridade`, `Responsável`, `Sprint`, `Story Points`, `Criado Em`, `Iniciado Em`, `Concluído Em`, `Lead Time (dias)`, `Cycle Time (dias)`, `Bloqueado`, `Tempo Bloqueado (horas)`, `Tags` e `Total Subtarefas`.
- **FR-007**: A geração dos relatórios DEVE respeitar rigorosamente a filtragem e recorte temporal configurados na gaveta de amostragem de dados (`DatasetFilterConfig`), preservando coerência visual com as telas analíticas.
- **FR-008**: O processo de exportação DEVE ser estritamente não-destrutivo e somente-leitura, sem efetuar qualquer mutação nas tarefas, sprints ou configurações do quadro.
- **FR-009**: Todas as rotinas de exportação DEVEM operar localmente no cliente (Local-First), garantindo total privacidade e conformidade com a Constituição Artigo VIII (sem telemetria ou envio de dados para servidores terceiros).

---

### Key Entities

- **FlowReportSnapshot**: Estrutura imutável que agrega metadados do quadro, janela temporal selecionada, métricas de fluxo calculadas (Throughput, Lead Time, SLE 85%), resumo de impedimentos e diagnósticos ativos.
- **TaskExportRow**: Objeto tabular normalizado contendo os atributos estáticos e métricas de tempo calculadas de um cartão individual para projeção em linhas de planilha.
- **ExportOptions**: Configuração de parametrização fornecida pelo usuário (formato desejado: PDF ou Planilha, janela de amostragem, inclusão de gráficos e diagnósticos).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo de geração e início de download do relatório (seja PDF ou Planilha) DEVE ser inferior a **1,5 segundos** para quadros com até 500 tarefas.
- **SC-002**: 100% dos relatórios em planilha exportados DEVEM abrir no Microsoft Excel sem avisos de codificação ou corrupção de caracteres acentuados em português.
- **SC-003**: O relatório em PDF DEVE renderizar todos os textos e indicadores sem cortes, sobreposições ou quebras indevidas de página em resolução padrão A4.
- **SC-004**: A funcionalidade DEVE atingir **100% de cobertura por testes automatizados** (testes unitários para cálculo das linhas tabulares, formatação de dados de exportação e acionamento dos gatilhos de download).
- **SC-005**: Zero bytes de dados de tarefas ou métricas devem transitar por APIs externas para geração dos relatórios (verificação de soberania Local-First).

---

## Assumptions

- A geração de PDF utilizará capacidades nativas do navegador com estilos CSS `@media print` otimizados para exportação direta ou renderizador leve de documento client-side, evitando dependências externas pesadas (Constituição Artigo V / YAGNI).
- A exportação em planilha utilizará CSV universal formatado com delimitador e BOM UTF-8, garantindo compatibilidade imediata com Microsoft Excel, LibreOffice Calc, Apple Numbers e Google Sheets sem a necessidade de bibliotecas binárias de manipulação de Excel pesadas.
- Usuários com papel de visitante (`guest`) também podem exportar relatórios para visualização, pois trata-se de operação puramente de leitura (read-only).
