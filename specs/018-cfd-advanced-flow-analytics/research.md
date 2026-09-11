# Research & Technical Decisions: CFD Avançado com Análise de Fluxo e Gargalos

**Feature**: `018-cfd-advanced-flow-analytics` | **Date**: 2026-09-11

---

## 1. Contexto & Benchmark Visual (Flow Analytics Enterprise)

O Diagrama de Fluxo Cumulativo (*Cumulative Flow Diagram - CFD*) é o mapa topográfico de um processo Kanban. No padrão de excelência analítica da indústria:
1. **Medição Vertical (WIP)**: A distância vertical entre a curva de entrada e de saída em qualquer data $t$ quantifica o trabalho em progresso ativo.
2. **Medição Horizontal (Lead Time)**: A distância horizontal entre a curva de saída na data $t$ e a data anterior $t_0$ onde a curva de entrada atingiu o mesmo patamar cumulativo reflete o tempo real de permanência no sistema (tempo de ciclo aproximado pela Lei de Little).
3. **Detecção de Gargalo**: Quando a inclinação da curva de entrada é superior à da curva de saída (banda vertical alargando com $WIP_{\text{recente}} \ge 1.4 \times WIP_{\text{início}}$), há formação de gargalo ativo (*A queue column expanding*).

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Interpolação e Alinhamento Horizontal do Lead Time
- **Opções Avaliadas**:
  - *Opção A*: Busca exata por igualdade de valor (`val === departureVal`).
  - *Opção B*: Interpolação e busca pelo primeiro ponto da curva de chegada onde `val >= departureVal` usando chaves dinâmicas (`arrivalKey`, `departureKey`) e `getPointValue`.
- **Decisão**: **Opção B (Busca dinâmica com `getPointValue`)**.
- **Justificativa**: Garante que o cálculo funcione perfeitamente com qualquer conjunto de colunas personalizadas do board sem quebrar quando a curva sobe em degraus.

### Decisão 2: Motor Gráfico SVG Nativo vs Bibliotecas Externas
- **Opções Avaliadas**:
  - *Opção A*: Adicionar Recharts, Chart.js ou D3.
  - *Opção B*: SVG Vetorial Nativo puro com renderização React e aceleração gráfica por CSS.
- **Decisão**: **Opção B (SVG Vetorial Nativo)**.
- **Justificativa**: Conforme o Princípio V da Constituição (Simplicidade & YAGNI), mantém zero dependências externas extras, resposta instantânea (60fps) e visual dark enterprise consistente com o tema do Metrik.

### Decisão 3: Controles de Filtro e Mini-Timeline
- **Opções Avaliadas**:
  - *Opção A*: Barra fixa ocupando 30% do espaço útil da tela.
  - *Opção B*: Painel retrátil (drawer colapsável à esquerda com toggle minimalista) e sub-gráfico inferior arrastável (*Timeline Scrubber*).
- **Decisão**: **Opção B (Drawer colapsável + Mini-Timeline Scrubber)**.
- **Justificativa**: Prioriza a área útil do canvas de visualização e permite navegação suave tanto em telas médias quanto em monitores ultrawide.

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **Intervalo de datas invertido** | Usuário define data final anterior à data inicial | Validação defensiva no `CfdFilterDrawer` e normalização graciosa no hook `useCfdData.ts` (retorno dos últimos 14 dias em caso de data inválida). |
| **Banda com zero tarefas** | Etapa intermediária vazia | Suporte defensivo no `getPointValue` retornando 0 sem divisões por zero ou colapso do polígono SVG. |
| **Vazamento de nomes de marcas de referência** | Comentários ou labels citando ferramentas terceiras | Higienização completa em todo o codebase, specs e comentários, mantendo terminologia neutra e proprietária (Metrik). |
