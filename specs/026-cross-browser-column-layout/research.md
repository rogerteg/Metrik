# Technical Research: Paridade de Renderização do Quadro entre Navegadores (026)

**Date**: 2026-09-14
**Feature**: `026-cross-browser-column-layout`
**Status**: Completed
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Diagnóstico (Root Cause Analysis)

A investigação do código-fonte mostrou que a divergência de layout **não** vem de recurso de estilo exclusivo de um navegador. A varredura por `:has()`, `subgrid`, `container-type`/`@container`, `field-sizing`, `scrollbar-gutter`, `text-wrap`, `zoom`, `dvh`/`svh` e `@supports` encontrou **zero ocorrências** em `src/`. Os únicos prefixos presentes são `-webkit-` para estilização de barra de rolagem, `font-smoothing` e `background-clip` — todos suportados de forma idêntica por Edge e Chrome, que compartilham o mesmo motor.

A causa identificada é de **estado, não de motor**: a geometria da coluna é declarada em quatro lugares que não concordam entre si, e qual delas prevalece depende de a preferência da coluna existir no `localStorage` — que é **por navegador**. O resultado é que o mesmo quadro, aberto em dois navegadores com históricos locais diferentes, renderiza colunas com larguras diferentes.

| Origem | Padrão | Mínimo | Máximo |
|---|---|---|---|
| CSS `.kanban-column` | 290 px | 220 px | — |
| `useColumnWidths.ts` | 280 px | 200 px | 650 px |
| `Column.tsx` (arraste) | 280 px (literal) | 200 px (literal) | 650 px (literal) |
| `Column.tsx` (duplo clique) | 280 px (literal) | — | — |

Consequências verificadas no código:

1. Coluna sem preferência renderiza **290 px**; a mesma coluna com preferência renderiza **280 px** (ou outro valor) — divergência visível e permanente entre navegadores.
2. Coluna com preferência de 200 px renderiza **220 px**: o `min-width` do CSS vence o valor escolhido pelo usuário.
3. Arraste parte de base fixa **280 px** mesmo com a coluna renderizada em 290 px → salto no primeiro movimento.
4. Duplo clique "restaurar" **grava** 280 px em vez de limpar a preferência → nunca retorna ao estado inicial.
5. **Nenhuma suíte de teste cobre geometria de coluna** (busca por `columnWidths`, `useColumnWidths`, `DEFAULT_COLUMN_WIDTH`, `MIN_COLUMN_WIDTH` e `onResizeWidth` em `tests/` retorna vazio).

---

## 2. Decisões Arquiteturais

### D1: Medição determinística antes de qualquer alteração de estilo

**Decision**: Antes de alterar CSS, fixar o ambiente de comparação — mesma janela, mesma ampliação, mesmo conteúdo — e medir a geometria real de cada coluna, em vez de julgar "a olho" entre navegadores.

**Rationale**: Sem eliminar as variáveis de ambiente (janela, ampliação, dados locais distintos), qualquer conclusão sobre "o Chrome renderiza errado" é não falsificável. A medição transforma o relato em números comparáveis e permite separar causa ambiental de causa de código.

**Alternatives considered**:
- *Corrigir CSS por tentativa e verificar visualmente* — rejeitado: não produz evidência objetiva nem critério de encerramento.
- *Adicionar biblioteca de regressão visual* — rejeitado na Fase 0 por YAGNI (NFR-006) e por exigir dependência nova (Constitution V).

### D2: Fonte única de verdade para a geometria da coluna

**Decision**: Criar `src/utils/columnGeometry.ts` como única fonte de `DEFAULT`, `MIN` e `MAX`, consumida por hook, componentes e CSS.

**Rationale**: Os valores 290/280 e 220/200 são o defeito, não o sintoma. Uma única fonte elimina a classe inteira de divergências e impede que o próximo ajuste reintroduza o problema.

**Alternatives considered**:
- *Manter constantes duplicadas e apenas sincronizar os valores agora* — rejeitado: o drift retorna na próxima alteração.
- *Extrair os valores do CSS em tempo de execução* — rejeitado: acopla o layout a leitura de estilo computado e introduz custo e fragilidade desnecessários.

### D3: Largura sempre explícita na coluna

**Decision**: Toda coluna recebe uma largura resolvida explícita; o componente nunca depende de largura indefinida nem da distribuição do contêiner flex.

**Rationale**: Hoje a largura efetiva depende de um estado oculto (preferência existir ou não) e de `min-width` do CSS. Largura explícita torna a geometria previsível e igualmente verificável em qualquer navegador.

**Alternatives considered**:
- *Deixar o CSS decidir quando não há preferência* — rejeitado: mantém dois caminhos de renderização, que é exatamente a origem do defeito.

### D4: Guarda automatizada contra divergência entre CSS e TypeScript

**Decision**: Uma suíte lê `src/App.css` e exige que as custom properties de geometria reflitam exatamente as constantes do módulo puro, e que `.kanban-column` não contenha literais de largura.

**Rationale**: jsdom não calcula layout, então a verificação automatizada de geometria real é impossível nas suítes atuais. A guarda de contrato é verificável de forma determinística e barata, e bloqueia justamente a regressão que originou o defeito.

**Alternatives considered**:
- *Confiar em revisão humana* — rejeitado: foi o que permitiu o drift chegar ao produto.
- *Adotar ambiente de navegador real na suíte automatizada* — rejeitado por custo e complexidade (NFR-006); a paridade medida fica na matriz manual documentada.

### D5: Restaurar significa limpar a preferência, não gravar um número

**Decision**: A ação de restaurar remove a preferência de largura da coluna, fazendo-a voltar ao padrão vigente; o arraste parte sempre da largura **renderizada**.

**Rationale**: Corrige G5 e G6 de forma direta e torna o comportamento idempotente: restaurar duas vezes produz o mesmo resultado.

**Alternatives considered**:
- *Gravar explicitamente o valor padrão* — rejeitado: congela o valor e ignora futuras mudanças do padrão.

### D6: Verificação de paridade fora do jsdom

**Decision**: Invariantes de geometria verificadas automaticamente nas suítes atuais; paridade medida verificada por sonda numérica em navegador real, seguindo a matriz do `quickstart.md`.

**Rationale**: Reconhece a limitação real do ambiente de teste atual sem introduzir dependência nova, e mantém a paridade como critério objetivo (diferença de até 1 px) em vez de impressão visual.

**Alternatives considered**:
- *Só testes automatizados* — rejeitado: não cobriria o requisito central da feature (SC-001/SC-003).
- *Só verificação manual* — rejeitado: perderia a proteção contra o drift já identificado.

### D7: Espaço horizontal excedente permanece como está

**Decision**: Quando a soma das larguras é menor que a janela, as colunas mantêm largura fixa e o espaço restante permanece livre. Nenhum comportamento de esticamento é introduzido.

**Rationale**: Fecha a ambiguidade registrada nos itens CHK003 e CHK041 do checklist de paridade. O relato é sobre navegadores mostrarem colunas diferentes, não sobre espaço sobrando; introduzir esticamento mudaria também o Edge, que hoje serve de referência de "correto". Alinha-se a "Fora de Escopo: redesenho visual" e ao princípio de simplicidade.

**Alternatives considered**:
- *Esticar colunas para preencher a janela* — rejeitado nesta rodada: altera a referência de aceite e a aparência do navegador de referência.
- *Colunas totalmente fluídas* — rejeitado: elimina a largura escolhida pelo usuário e amplia muito o escopo.

> **Pendência de escopo**: esta decisão foi derivada por padrão (a pergunta correspondente em `/speckit-clarify` não foi respondida). Se a intenção for preencher a janela, a spec precisa ser ajustada via `/speckit-clarify` **antes** da implementação — o plano atual entrega paridade estrita.

---

## 3. Hipóteses de Divergência entre Navegadores (ordenadas e falsificáveis)

| # | Hipótese | Como falsificar | Ação se confirmada |
|---|---|---|---|
| H1 | **Drift de geometria + estado local por navegador** (causa principal): colunas sem preferência renderizam 290 px e colunas com preferência 280 px, e cada navegador tem histórico local próprio | Medir a largura renderizada por coluna em dois navegadores com o mesmo quadro importado e sem preferências salvas | Corrigir com D2/D3 — resolve na raiz |
| H2 | **Ambiente diferente** (janela, ampliação, barras) altera a largura disponível e o corte das últimas colunas | Igualar janela e ampliação pelo modo responsivo e remeidir | Documentar a matriz e garantir rolagem horizontal contida (FR-003) |
| H3 | **Salto no arraste** (G5): base fixa de 280 px contra coluna renderizada em 290 px | Iniciar arraste em coluna sem preferência e medir no primeiro movimento | Corrigir com D3/D5 |
| H4 | **Arredondamento subpixel** em ampliação/densidade não inteira gera diferenças de 1 px | Medir em DPR 1,25 e 1,5 e comparar | Aceitar dentro da tolerância de ±1 px (NFR-002) |

---

## 4. Conformidade Constitucional

- **I. SDD**: research, plan, spec, checklists e contrato produzidos antes do código.
- **II. Modularidade**: módulo puro isolado (`columnGeometry.ts`), sem dependência circular.
- **III. Verificação Automatizada**: duas suítes novas mais ajustes nas de componente.
- **IV. Observabilidade**: diagnóstico com prefixo `[Metrik Guard]` e valores medidos.
- **V. YAGNI**: nenhuma dependência nova, nenhum redesenho, nenhuma abstração especulativa.
- **VII. Independência de Marca**: terminologia neutra (*Metrik Column Geometry Contract*).
- **VIII. Local-First**: preferências permanecem exclusivamente locais, sem nuvem.
