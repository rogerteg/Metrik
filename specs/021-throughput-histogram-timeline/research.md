# Research & Technical Decisions: Gráfico de Vazão Avançado com Histograma e Linha do Tempo (Throughput Analytics)

**Feature**: `021-throughput-histogram-timeline` | **Date**: 2026-09-11

---

## 1. Fundamentação Teórica: Vazão, Variabilidade e Previsibilidade Lean

De acordo com Daniel Vacanti (*Actionable Agile Metrics for Predictability*), Troy Magennis e Frank Vega:
1. **A Vazão como Variável Discreta Empírica**:
   - Ao contrário do Lead Time e Cycle Time (que são contínuos), o Throughput é uma contagem discreta inteira de itens concluídos por unidade de tempo ($0, 1, 2, 3, \dots$).
2. **A Questão Crítica dos Dias com Zero Conclusões**:
   - Em qualquer equipe real, existem dias em que nenhum item é concluído (finais de semana, feriados, dias de refinamento ou dias onde os itens continuam em progresso).
   - Ignorar dias sem entregas cria uma ilusão estatística de que a capacidade média da equipe é muito superior à realidade empírica.
   - O preenchimento com `0` em todos os dias de calendário no intervalo selecionado reflete fielmente o histograma de referência, onde a barra do `0` é a mais alta.
3. **O Valor Conjugado do Histograma + Linha do Tempo (Run Chart)**:
   - **Histograma de Vazão (*Throughput Histogram*)**: Responde à pergunta probabilística: *"Quantos itens costumamos entregar em um dia típico e com qual nível de certeza?"*.
   - **Linha do Tempo Diária (*Daily Run Chart*)**: Responde à pergunta de estabilidade de processo: *"As entregas estão ocorrendo de maneira estável e constante ou em lotes volumosos pontuais (*batching*)?"*.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Representação Vetorial em SVG Nativo Responsivo (Princípio V)
- **Opções Avaliadas**:
  - *Opção A*: Adotar uma biblioteca de gráficos externa (Chart.js / Recharts / D3).
  - *Opção B*: Construir os componentes estritamente em SVG nativo responsivo com elementos semânticos (`<rect>`, `<path>`, `<circle>`, `<line>`, `<text>`).
- **Decisão**: **Opção B (SVG Nativo Puro)**.
- **Justificativa**: Conforme o Princípio V da Constituição do Metrik (Simplicidade & YAGNI), o Metrik preserva zero impacto no tamanho do bundle, controle estético milimétrico com temas CSS (dark/light mode) e máxima fidelidade à imagem de referência.

### Decisão 2: Inclusão Obrigatória de Dias de Calendário com Zero Entregas
- **Opções Avaliadas**:
  - *Opção A*: Filtrar apenas dias que registraram pelo menos 1 conclusão.
  - *Opção B*: Considerar todos os dias de calendário da janela selecionada, preenchendo os dias sem conclusão com `0`.
- **Decisão**: **Opção B (Preenchimento contínuo com 0)**.
- **Justificativa**: Ratificada no `/speckit-clarify` e fundamentada na literatura de fluxo: omissão de dias sem entrega causa viés positivo artificial de capacidade.

### Decisão 3: Linhas de Percentil NIST no Topo do Histograma (50%, 70%, 85%, 95%)
- **Opções Avaliadas**:
  - *Opção A*: Exibir apenas a mediana (50%) e o SLE (85%).
  - *Opção B*: Exibir as 4 linhas pontilhadas de referência da imagem: 50% (Mediana), 70%, 85% (SLE) e 95% (Alta Certeza).
- **Decisão**: **Opção B (50%, 70%, 85% e 95%)**.
- **Justificativa**: Reprodução exata da referência visual e fornecimento de patamares consolidados para tomada de decisão e compromissos com stakeholders.

### Decisão 4: Disposição Conjunta Vertical Sincronizada
- **Opções Avaliadas**:
  - *Opção A*: Criar abas internas no Throughput para alternar entre "Histograma" e "Linha do Tempo".
  - *Opção B*: Layout vertical unificado: Histograma no topo e Run Chart na parte inferior.
- **Decisão**: **Opção B (Layout conjunto vertical)**.
- **Justificativa**: Permite correlação visual imediata entre a distribuição agregada de capacidade e a ordem cronológica de eventos.

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **Eixo X desconfigurado em boards sem dados** | Nenhuma tarefa concluída no board ativo | Estado educativo e acolhedor (*Empty/Guidance State*) convidando à conclusão de tarefas para gerar métricas de vazão. |
| **Janelas longas gerando Run Chart poluído** | Muitos pontos (ex: 90 ou 180 dias) | Densidade controlada dos marcadores (`dot radius` dinâmico ou adaptativo) e labels de mês/quinzena no eixo X para evitar sobreposição de textos. |
| **Divergência de timezones em datas ISO** | Conclusões registradas próximo à meia-noite | Uso da string de data UTC `YYYY-MM-DD` das tarefas para agrupar as conclusões em dias consistentes. |
