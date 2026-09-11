# Research & Design Decisions: Clean Board Layout (Inspirado no Businessmap / Kanbanize)

**Feature**: `016-clean-board-layout-businessmap` | **Date**: 2026-09-11

---

## 1. Contexto & Benchmark Visual (Businessmap)

O **Businessmap** (antigo Kanbanize) é o padrão de ouro da indústria para ferramentas Kanban de nível enterprise devido a três pilares:
1. **Densidade de Informação Inteligente**: Apresenta múltiplos metadados (IDs, prioridade, prazos, bloqueios, sub-itens) sem gerar fadiga visual.
2. **Contenção Visual e Baixo Ruído**: Não usa cores saturadas em blocos maciços; a cor é aplicada cirurgicamente em faixas laterais (*border-left* de 3px a 4px), tags e indicadores de status.
3. **Ergonomia do Card**: Cards mantêm altura enxuta por padrão, permitindo inspeção ou expansão sob demanda, evitando colunas infinitamente esticadas.

---

## 2. Decisões Técnicas e Arquiteturais

### Decisão 1: Abordagem para Campos de Qualidade (Critérios de Aceitação & Cenários de Testes) no Card
- **Opções Avaliadas**:
  - *Opção A*: Sempre abertos e expandidos com textareas no corpo do card (comportamento anterior).
  - *Opção B*: Indicador compacto com toggle de expansão/recolhimento inline (accordion/toggle suave).
  - *Opção C*: Exclusivamente no modal de detalhes (escondidos no board).
- **Decisão**: **Opção B (Toggle Inline de Expansão/Recolhimento com Indicador Compacto)**.
- **Justificativa**: Preserva a altura elegante dos cards no fluxo geral do board. Quando o card contém critérios ou cenários preenchidos, exibe um resumo limpo (ex: `✓ Critérios de Aceitação` / `🧪 Cenários de Testes` com contagem/ícone) e um botão sutil de alternância que abre a edição inline com um único clique, sem a fricção de abrir um modal inteiro.

### Decisão 2: Aplicação da Identidade de Cor da Coluna nos Cards
- **Opções Avaliadas**:
  - *Opção A*: Fundo total do cartão com cor da coluna (alto ruído).
  - *Opção B*: Faixa lateral esquerda sólida de 3px a 4px (`borderLeft`), corpo neutro dark slate (`#1e293b`).
  - *Opção C*: Apenas uma bolinha/badge de cor no topo do card.
- **Decisão**: **Opção B (Faixa lateral sólida `borderLeft: 3px solid ${effectiveColor}`)**.
- **Justificativa**: Consonância perfeita com o Businessmap e ferramentas enterprise. Garante legibilidade máxima do texto, alto contraste e clara associação visual à coluna sem poluição. Tarefas bloqueadas mantêm a faixa vermelha de bloqueio prioritária.

### Decisão 3: Reestruturação do Cabeçalho de Colunas e WIP Limit
- **Opções Avaliadas**:
  - *Opção A*: Manter badges dispersas e botões com textos extensos.
  - *Opção B*: Cabeçalho compacto estilo Businessmap: drag handle sutil, badge de título nítida, cadeado de coluna fixa discreto, WIP em *pill* minimalista (`X / Y` em monospace suave) e seletor de cor integrado.
- **Decisão**: **Opção B (Cabeçalho Compacto Integrado)**.
- **Justificativa**: Reduz a altura do cabeçalho da coluna, melhora o alinhamento horizontal do grid e confere acabamento profissional.

### Decisão 4: Visibilidade e Ergonomia dos Botões de Ação do Card
- **Opções Avaliadas**:
  - *Opção A*: `opacity: 0` por padrão, aparecendo apenas no `:hover` (incompatível com touch/tablets e causa efeito "pisca-pisca").
  - *Opção B*: `opacity: 0.6` persistente, elevando suavemente para `1.0` no `:hover` e `:focus-within`.
- **Decisão**: **Opção B (`opacity: 0.6` constante, `1.0` no hover)**.
- **Justificativa**: Dá um ar limpo e discreto aos botões no board sem prejudicar a acessibilidade nem dispositivos móveis/touch.

---

## 3. Matriz de Riscos & Mitigações (Premortem)

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Quebra de testes de renderização de cards que buscam textareas | Média | Médio | Garantir que o estado inicial permita que os campos sejam encontrados por `getByPlaceholderText` ou renderizados/expandidos conforme os testes unitários esperam. |
| Perda de contraste em telas com baixo brilho | Baixa | Médio | Validar contraste WCAG AA entre `--bg-card` (`#1e293b`), `--text-primary` (`#f1f5f9`) e `--text-muted` (`#94a3b8`). |
| Conflito de estilos com tarefas bloqueadas ou estagnadas | Baixa | Alto | A regra de prioridade visual é estrita: 1º Bloqueado (borda vermelha `#ef4444`), 2º Estagnado (borda marrom `#8B4513`), 3º Cor da Coluna (`columnColor`). |
