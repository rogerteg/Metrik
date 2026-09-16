# Data Model & State Invariants: Paridade de Renderização do Quadro entre Navegadores (026)

**Date**: 2026-09-14
**Feature**: `026-cross-browser-column-layout`
**Status**: Completed
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## 1. Entidades

Esta feature não introduz novas entidades persistidas. Ela **consolida** a definição de geometria que hoje está dispersa, e formaliza o registro de preferência que já existe no `localStorage`.

### 1.1 Constantes de Geometria (nova — módulo puro)

Fonte única de verdade para largura de coluna. Substitui as quatro declarações divergentes (CSS e três literais em TypeScript).

```typescript
/** Largura padrão de uma coluna sem preferência salva, em pixels CSS. */
export const DEFAULT_COLUMN_WIDTH = 290;

/** Menor largura permitida para uma coluna, em pixels CSS. */
export const MIN_COLUMN_WIDTH = 220;

/** Maior largura permitida para uma coluna, em pixels CSS. */
export const MAX_COLUMN_WIDTH = 650;
```

**Nota de valor**: `DEFAULT` assume 290 e `MIN` assume 220 para preservar a aparência que hoje é a **referência de aceite** (o CSS atual, que você confirmou estar correto no Edge). A escolha de qual número é o "certo" é justamente o defeito G1–G4; a decisão aqui é ancorar todos os consumidores na geometria atualmente visível ao usuário, sem alterar a aparência do navegador de referência.

### 1.2 Preferência de Largura Persistida (existente)

```typescript
/** Mapa coluna → largura, por quadro, persistido no armazenamento local. */
export interface PersistedColumnWidths {
  [columnId: string]: number;
}
```

- **Chave de armazenamento**: `metrik-col-widths-<boardId>`
- **Escopo**: por quadro e **por navegador** — este é o fato que explica grande parte da divergência percebida (FR-009, Assumption registrada na spec).

### 1.3 Largura de Coluna Resolvida (nova — derivada, não persistida)

```typescript
/**
 * Largura efetiva a ser renderizada, sempre um número finito dentro da faixa permitida.
 * Nunca retorna undefined.
 */
export type ResolvedColumnWidth = number;
```

**Regra de resolução** (função pura):

1. Se a preferência existe e é um número finito → `clamp(preferência, MIN, MAX)`.
2. Se a preferência é ausente, não numérica, `NaN`, infinita ou fora da faixa → `DEFAULT`.
3. Nenhum caminho retorna `undefined` (elimina o estado oculto que gerava dois caminhos de renderização).

### 1.4 Amostra de Paridade (nova — apenas para verificação)

```typescript
/** Medição da geometria renderizada de uma coluna, usada na verificação de paridade. */
export interface LayoutParitySample {
  columnId: string;
  browser: string;
  viewportWidth: number;
  zoom: number;
  devicePixelRatio: number;
  measuredWidth: number;
}
```

Não é persistida. Serve à matriz de verificação de `quickstart.md` e à comparação numérica com tolerância de ±1 px (NFR-002).

---

## 2. Invariantes de Estado

1. **Fonte única**: `DEFAULT_COLUMN_WIDTH`, `MIN_COLUMN_WIDTH` e `MAX_COLUMN_WIDTH` existem em **um único** módulo TypeScript e em **um único** bloco de custom properties no CSS, obrigatoriamente iguais entre si.

   $$\text{DEFAULT}_{TS} = \text{DEFAULT}_{CSS} \land \text{MIN}_{TS} = \text{MIN}_{CSS} \land \text{MAX}_{TS} = \text{MAX}_{CSS}$$

2. **Largura sempre definida**: para toda coluna renderizada, existe uma largura efetiva explícita em pixels.

   $$\forall c \in \text{Colunas},\ \exists\, w(c) \in \mathbb{R}^{+}$$

3. **Faixa respeitada**: nenhuma coluna renderiza fora da faixa permitida.

   $$\forall c,\ \text{MIN} \le w(c) \le \text{MAX}$$

4. **Preferência válida é honrada**: se existe preferência finita dentro da faixa, a largura renderizada é igual a ela — o CSS não pode sobrescrever a escolha do usuário.

   $$w(c) = \text{clamp}(\text{pref}(c)) \quad \text{quando } \text{pref}(c) \text{ é válida}$$

5. **Restaurar é idempotente**: restaurar remove a preferência e a largura passa a ser o padrão, repetidamente.

   $$\text{restaurar}^n(c) \Rightarrow w(c) = \text{DEFAULT},\quad \forall n \ge 1$$

6. **Arraste sem salto**: a base do arraste é a largura renderizada, portanto o primeiro movimento altera a largura exatamente pelo deslocamento do ponteiro.

   $$\Delta w = \Delta x \quad \text{no primeiro movimento}$$

7. **Nenhum literal de largura no componente**: `Column.tsx` e `Board.tsx` não contêm literais numéricos de largura de coluna; todos os valores vêm do módulo de geometria.

8. **Paridade entre navegadores**: para o mesmo conteúdo, mesma janela e mesma ampliação, a diferença de geometria entre navegadores não excede 1 px.

   $$|w_A(c) - w_B(c)| \le 1 \quad \forall c$$

9. **Persistência íntegra**: preferências inválidas ou corrompidas são descartadas e nunca impedem a renderização de um quadro íntegro (FR-009).

---

## 3. Transições de Estado

Nenhuma entidade nova possui máquina de estados. O ciclo de vida existente permanece e passa a ter comportamento determinístico:

| Evento | Antes | Depois |
|---|---|---|
| Quadro aberto sem preferências | Colunas em 290 px (CSS) | Colunas em `DEFAULT` (mesmo valor, agora explícito) |
| Usuário arrasta a alça | Base fixa 280 px → salto possível | Base = largura renderizada, sem salto |
| Usuário solta a alça | Preferência gravada, limitada 200–650 | Preferência gravada, limitada `MIN`–`MAX` |
| Usuário dá duplo clique em restaurar | Grava 280 px permanentemente | Remove a preferência e volta ao `DEFAULT` |
| Preferência corrompida no armazenamento | Poderia renderizar valor inválido | Descartada; renderiza `DEFAULT` |
| Troca de quadro | Preferências do novo quadro carregadas | Inalterado (comportamento preservado) |

---

## 4. Regras de Validação (derivadas dos requisitos)

| Regra | Origem |
|---|---|
| Aceitar apenas número finito | FR-009 |
| Descartar `NaN`, `Infinity`, negativos e não numéricos | FR-009 |
| Aplicar limite mínimo e máximo | FR-009, NFR-002 |
| Aplicar o padrão quando não há preferência utilizável | FR-010 |
| Nunca renderizar largura indefinida | FR-001, FR-002 |
| Comparar geometria entre navegadores com tolerância de 1 px | NFR-002, SC-001 |
| Reportar divergência com prefixo `[Metrik Guard]` e valores medidos | FR-014, Constitution IV |
