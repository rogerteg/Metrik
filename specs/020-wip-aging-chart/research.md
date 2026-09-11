# Research & Technical Decisions: Gráfico de Envelhecimento do Trabalho em Progresso (Aging WIP Chart)

**Feature**: `020-wip-aging-chart` | **Date**: 2026-09-11

---

## 1. Fundamentação Teórica: O Valor Preditivo do Aging WIP no Kanban

De acordo com Daniel Vacanti (*Actionable Agile Metrics for Predictability*) e a teoria do fluxo contínuo:
1. **O Scatter Plot é Retrospectivo, o Aging WIP é Proativo**:
   - O gráfico de dispersão de tempo de ciclo só plota tarefas **após** sua conclusão.
   - O gráfico de envelhecimento do WIP plota tarefas **enquanto ainda estão em andamento**, permitindo intervenção preventiva antes da violação do acordo de nível de serviço (SLE).
2. **Correlação entre Idade do WIP e Tempo de Ciclo Final**:
   - Um item que envelhece na primeira metade do processo tem probabilidade estatisticamente insignificante de recuperar o atraso nas etapas subsequentes.
   - Monitorar as faixas de percentil por etapa (*Pace Percentiles*) indica se o item está se movendo no ritmo normal ou se está estagnado.
3. **Zonas de Risco**:
   - 🟩 **Zona Verde (< P50)**: Comportamento dentro da mediana de permanência.
   - 🟨 **Zona Amarela (P50 a P70)**: Alerta precoce de lentidão.
   - 🟧 **Zona Laranja (P70 a P85)**: Risco elevado de quebra de SLE.
   - 🟥 **Zona Vermelha (> P95)**: Risco crítico / cauda longa / provável bloqueio não sinalizado.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Pace Percentiles por Etapa vs. Linhas Globais
- **Opções Avaliadas**:
  - *Opção A*: Linhas horizontais idênticas atravessando todo o gráfico (calculadas pelo tempo total de ciclo).
  - *Opção B*: Faixas coloridas calculadas especificamente para o tempo histórico de cada etapa individual com fallback gracioso para o ciclo global caso haja poucas amostras (< 3 tarefas).
- **Decisão**: **Opção B (Pace Percentiles por etapa com fallback gracioso)**.
- **Justificativa**: Cada etapa de um fluxo real tem durações naturais diferentes (ex: *Review* costuma durar menos que *In Progress*). Bandas específicas por etapa evitam falsos positivos e refletem com fidelidade o ritmo saudável de cada fase do workflow.

### Decisão 2: Apresentação dos Painéis Laterais (Drawers Retráteis Duais)
- **Opções Avaliadas**:
  - *Opção A*: Painéis estáticos fixos nas laterais do gráfico (layout widescreen de 3 colunas).
  - *Opção B*: Drawers retráteis colapsáveis (à esquerda para *Dataset configuration* e à direita para *Controls for this Chart*) com botões de alternância estilizados.
- **Decisão**: **Opção B (Drawers retráteis duais)**.
- **Justificativa**: Conforme decisão ratificada no `/speckit-clarify`, preserva 100% da área útil do canvas SVG para o gráfico em telas convencionais e laptops, abrindo espaço sob demanda para configurações avançadas.

### Decisão 3: Dispersão Horizontal Determinística (*Deterministic Jitter*)
- **Opções Avaliadas**:
  - *Opção A*: Alinhar todos os pontos no centro exato da coluna ($X = X_{\text{centro}}$).
  - *Opção B*: Aplicar um deslocamento horizontal leve e determinístico baseado no hash do ID da tarefa:
    $$X = X_{\text{centro}} + (\text{hash}(ID) \pmod{20} - 10) \text{ px}$$
- **Decisão**: **Opção B (Dispersão horizontal determinística)**.
- **Justificativa**: Evita sobreposição visual completa de pontos quando múltiplas tarefas possuem idades muito próximas, mantendo os círculos visíveis, inspecionáveis e sem comportamento aleatório instável entre renderizações.

### Decisão 4: Motor Gráfico SVG Nativo (Princípio V)
- **Decisão**: **Princípio V da Constituição (Simplicidade & YAGNI)**.
- **Diretriz**: Construir o gráfico em SVG nativo responsivo (`<rect>`, `<circle>`, `<line>`, `<text>`) com aceleração CSS e tooltips HTML posicionados de forma absoluta. Zero uso de bibliotecas de plotagem de terceiros (D3/Recharts/Chart.js).

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **Sobreposição de pontos** | Múltiplas tarefas criadas juntas | Jitter horizontal determinístico dentro da largura da coluna. |
| **Colunas vazias no board** | Etapas sem cartões ativos (`WIP: 0`) | Renderização das faixas de percentil da coluna mantendo a integridade visual com o rótulo `WIP: 0`. |
| **Board sem tarefas concluídas suficientes** | Board recém-criado | Fallback automático para percentis padrão de demonstração / *Guidance State* didático. |
| **Responsividade em boards largos** | Boards com mais de 8 colunas | Container com scroll horizontal gracioso e eixos fixos ou escala adaptativa. |
