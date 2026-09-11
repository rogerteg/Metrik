# Research & Technical Decisions: Cycle Time Scatter Plot & Analytics Navigation

**Feature**: `017-cycle-time-scatter-plot-percentiles` | **Date**: 2026-09-11

---

## 1. Contexto & Benchmark Visual (ActionableAgile / Daniel Vacanti)

O gráfico de dispersão de tempo de ciclo (*Cycle Time Scatter Plot*) é a ferramenta analítica mais poderosa para prever quando o trabalho será entregue sem recorrer a estimativas subjetivas (Story Points). Em vez de médias enganosas (*Flaw of Averages*), a literatura de Kanban moderno preconiza o uso de **Percentis Probabilísticos**:
- **50% (Mediana)**: Tempo no qual metade das tarefas históricas foram concluídas.
- **85% (SLE Típico)**: Ponto de corte adotado por times de alta performance para compromissos de entrega com clientes e stakeholders (85% de confiança).
- **95% (Variabilidade Extrema / Cauda Longa)**: Quase certeza estatística, destacando anomalias e tarefas retidas por bloqueios severos.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Algoritmo de Cálculo de Percentis
- **Opções Avaliadas**:
  - *Opção A*: Nearest Rank (Posição inteira $\lceil \frac{P}{100} \times N \rceil$).
  - *Opção B*: Interpolação Linear NIST / R-6 (adotado pelo Excel, NumPy e ActionableAgile).
- **Decisão**: **Opção B (Interpolação Linear NIST / ActionableAgile)**.
- **Justificativa**: Evita saltos bruscos quando a amostra possui poucas tarefas (ex: entre 5 e 20 tarefas), gerando valores contínuos e fidedignos para os dias de ciclo.

### Decisão 2: Motor Gráfico SVG vs Canvas vs Bibliotecas Externas
- **Opções Avaliadas**:
  - *Opção A*: Adicionar biblioteca pesada como Chart.js / Recharts / D3.js.
  - *Opção B*: Renderização vetorial nativa em SVG gerenciada por React puro.
- **Decisão**: **Opção B (SVG Vetorial Nativo)**.
- **Justificativa**: Preserva o Princípio V da Constituição (Simplicidade & YAGNI), zero peso no bundle, controle total de styling em CSS com o tema dark slate e performance ultra-leve.

### Decisão 3: Estrutura de Navegação Analítica por Abas
- **Opções Avaliadas**:
  - *Opção A*: Mudar as abas globais no cabeçalho da página (Quadro, Analytics, etc.).
  - *Opção B*: Barra de abas internas no módulo de Analytics (`AnalyticsNavHeader.tsx`).
- **Decisão**: **Opção B (Barra interna de abas no Analytics)**.
- **Justificativa**: Mantém a alternância de contexto principal do Metrik limpa (Quadro vs Analytics), permitindo que a visualização Analytics ofereça sua própria suíte de ferramentas especializadas (Dashboard, Cycle Time, Throughput, CFD, Bloqueios).

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **Zero tarefas concluídas no board** | Primeiro acesso ou quadro novo | Exibir estado vazio informativo amigável (*Empty State*) explicando o propósito do gráfico de dispersão e percentis. |
| **Tarefas com Cycle Time de 0 ms** | Tarefas concluídas instantaneamente na mesma hora | Tratar para exibir mínimo de 0.1 dias ou rótulo "< 1d" sem colapsar a escala Y do gráfico. |
| **Poluição visual por muitos pontos sobrepostos** | Amostras grandes com datas idênticas | Aplicar leve transparência nos pontos (`fill: rgba(129, 140, 248, 0.75)` com borda fina) e jitter sutil de posicionamento se necessário. |
