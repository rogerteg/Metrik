# Tarefas de Implementação — Feature 059: Quitação de Dívida Técnica Legada Congelada

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI — MANDATÓRIO)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante Fundamental de CSS**: A cascata CSS depende unicamente da especificidade dos seletores e da ordem em que as regras aparecem no documento. Se dividirmos `Analytics.css` em arquivos menores e os importarmos na ordem original exata em um arquivo agregador, a especificidade, a cascata e o peso final no bundle compilado permanecem 100% idênticos.
- **Invariante Fundamental de Componentes React**: Um componente complexo com 800 linhas pode ser decomposto em uma árvore hierárquica de componentes puros (`props in -> JSX out`) e um hook de cálculo sem alterar o ciclo de renderização nem quebrar `data-testid`s ou listeners de eventos.
- **Menor Verdade Irredutível**: Para quitar a dívida legada perante o gate de 400 linhas, basta que cada arquivo físico em disco possua $\le 400$ linhas e que a fidelidade comportamental seja provada por testes unitários e de integração existentes.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- *Hipótese de Falha 1 (Cascata CSS Quebrada)*: Ao extrair regras CSS, seletores de temas claros/escuros ou de gavetas podem ser reordenados, fazendo com que uma regra com mesma especificidade sobrescreva incorretamente outra.
  - *Mitigação*: O particionamento é cirúrgico e sequencial. O arquivo agregador `Analytics.css` carrega os módulos na ordem idêntica da linha 1 à linha 3256 do arquivo original.
- *Hipótese de Falha 2 (Regressão em Testes de CFD)*: `CumulativeFlowChart.test.tsx` busca elementos SVG internos via `data-testid="wip-vertical-line"`, `cfd-inspection-overlay`, etc. Se esses nós forem movidos para dentro de elementos `<div />` ou contêineres HTML inválidos dentro de `<svg>`, o teste quebra.
  - *Mitigação*: `CfdInspectionOverlay` retornará exclusivamente um elemento `<g className="cfd-inspection-group" data-testid="cfd-inspection-overlay">` válido como filho direto de `<svg>`.
- *Hipótese de Falha 3 (Violação do Ratchet de Linhas)*: Ao criar novos arquivos em `src/components/analytics/` ou `src/components/charts/cfd/`, se algum deles tiver 401 linhas, o teste `moduleLineCountGuard.test.ts` falha imediatamente.
  - *Mitigação*: Cada fatia CSS e TSX é limitada a no máximo 380 linhas.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas**:
  - `Analytics.css` cobre estritamente o particionamento de estilos do painel analítico.
  - `CumulativeFlowChart.tsx` cobre estritamente o particionamento do gráfico CFD e seus cálculos.
  - `moduleLineCountGuard.test.ts` cobre estritamente a remoção das duas entradas do baseline congelado.
- **Coletivamente Exaustivas**:
  - A soma de todos os arquivos decompostos cobre 100% das 3256 linhas de CSS e 821 linhas de TSX originais.
  - Todos os testes de unidade de gráficos analíticos e os 9 testes de `moduleLineCountGuard` permanecem verdes.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- *Alternativa A*: Reescrever `Analytics.css` usando módulos CSS (`.module.css`) ou CSS-in-JS.
  - *Poda*: Descartada. Exigiria renomear dezenas de classes em vários componentes (`CycleTimeScatterPlot`, `CumulativeFlowChart`, `WipAgingChart`, etc.), violando YAGNI e gerando alto risco de quebra de testes e temas.
- *Alternativa B*: Importar os arquivos CSS individuais diretamente em cada componente e deletar `Analytics.css`.
  - *Poda*: Descartada. Quebraria a cascata global estabelecida em `AnalyticsDashboard.tsx` e o manifesto compartilhado.
- *Caminho Escolhido (Alternativa C)*: Manter `Analytics.css` como agregador transparente de `@import` de domínio em `src/components/analytics/`, e decompor `CumulativeFlowChart.tsx` em subcomponentes SVG e hooks em `src/components/charts/cfd/`.

### 5. Critério de Falsificabilidade & Testabilidade (*TDD / Red-Bar First*)
- *Teste de Linhas*: `npx vitest run tests/unit/moduleLineCountGuard.test.ts` falha se qualquer arquivo exceder 400 linhas.
- *Teste de CFD*: `npx vitest run tests/unit/CumulativeFlowChart.test.tsx` (8 testes) verifica interação de mouse, tooltips, legendas, medição de WIP e inspeção de Lead Time.
- *Red Bar*: Atualmente, `Analytics.css` e `CumulativeFlowChart.tsx` só passam porque estão listados no baseline congelado. O sucesso consiste em removê-los do baseline e o teste continuar 100% verde.

### 6. Triangulação Adversarial & Verificação da Constituição (*Polygraph Verification*)
- O Artigo II.3 da Constituição v1.8.7 prescreve explicitamente: *"The single largest legacy stylesheet, src/components/Analytics.css (3256 lines), is formalised as the top priority for modular decomposition... ratcheting down the frozen ceiling in FROZEN_LEGACY_DEBT_BASELINE"*.
- Esta feature cumpre diretamente a diretriz constitucional sem criar dívida secundária.

---

## 📋 Lista de Tarefas (MECE & Ordenada por Dependência)

- [x] T001: Criar o diretório `src/components/analytics/` e extrair as fatias CSS por domínio preservando a ordem da cascata ($\le 400$ linhas cada).
- [x] T002: Atualizar `src/components/Analytics.css` para agregar as folhas via `@import` sequencial ($\le 50$ linhas).
- [x] T003: Criar `src/components/charts/cfd/useCfdPlotCoordinates.ts` com o hook de coordenadas, polígonos dinâmicos e inspeção dual.
- [x] T004: Criar os subcomponentes `CfdLegend.tsx`, `CfdInspectionOverlay.tsx`, `CfdAxesLabels.tsx` e `CfdTooltip.tsx` em `src/components/charts/cfd/`.
- [x] T005: Refatorar `src/components/charts/CumulativeFlowChart.tsx` para utilizar os subcomponentes extraídos ($\le 200$ linhas).
- [x] T006: Remover `'src/components/charts/CumulativeFlowChart.tsx'` e `'src/components/Analytics.css'` de `FROZEN_LEGACY_DEBT_BASELINE` em `tests/unit/moduleLineCountGuard.test.ts`.
- [x] T007: Executar a suíte de testes de CFD e o guard de linhas para comprovar 9/9 testes verdes sem as duas entradas legadas.
