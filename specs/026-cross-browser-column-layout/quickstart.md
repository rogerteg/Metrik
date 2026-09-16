# Quickstart: Verificação da Paridade de Renderização do Quadro (026)

**Feature**: `026-cross-browser-column-layout`
**Date**: 2026-09-14
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Contrato**: [contracts/layout-parity.contract.md](contracts/layout-parity.contract.md)

---

## 1. Pré-requisitos

- Node.js e dependências instaladas (`npm install`)
- Quatro navegadores disponíveis: Edge, Chrome, Firefox e Safari
- Acesso ao DevTools de cada navegador (para fixar janela e ampliação)

## 2. Subir a aplicação

```bash
npm run dev          # desenvolvimento — http://localhost:5173/
npm run build        # produção — tsc + vite build
npm run preview      # servir o build — http://localhost:4173/
```

Use `npm run preview` (e não `npm run dev`) para a verificação de paridade: o build de produção remove avisos de desenvolvimento e é a forma como a aplicação será usada.

## 3. Verificação automatizada (invariantes)

```bash
npm run test         # suíte completa (Vitest)
npm run build        # zero erros de tipagem e bundling
```

Resultado esperado:

| Verificação | Resultado esperado |
|---|---|
| `columnGeometry.test.ts` | Resolução e limites aprovados, incluindo entradas inválidas |
| `columnGeometryContract.test.ts` | Padrão, mínimo e máximo idênticos entre CSS e TypeScript; nenhum literal de largura em componente |
| `Column.test.tsx`, `Board.test.tsx` | Largura explícita sempre presente; arraste sem salto; restaurar volta ao padrão |
| Suíte completa | Todos os testes anteriores continuam verdes, sem regressão |
| `npm run build` | Conclui sem erros |

O jsdom **não** calcula layout: as suítes verificam os invariantes de geometria (contrato §3, GC-01 a GC-09), não a geometria renderizada. A paridade medida é verificada na seção 4.

## 4. Verificação de paridade em navegador real

### 4.1 Eliminar variáveis de ambiente (obrigatório antes de concluir)

Em **cada** navegador:

1. Abra o DevTools e ative o modo de dispositivo (barra de dispositivos).
2. Fixe a janela em **1280×720** e confira que a ampliação está em **100%**.
3. Importe o **mesmo arquivo de quadro** (mesmo conteúdo, mesmas colunas) nos quatro navegadores — o armazenamento é local por navegador, portanto preferências de largura **não** são compartilhadas.
4. Para o cenário "sem preferências", limpe as chaves `metrik-col-widths-*` do armazenamento local antes de comparar.

### 4.2 Medir

Para cada coluna, obtenha a largura renderizada no console do navegador:

```js
// Executar no console, com o quadro visível
[...document.querySelectorAll('.kanban-column')].map(c => ({
  id: c.id || c.getAttribute('aria-label'),
  width: Math.round(c.getBoundingClientRect().width * 100) / 100,
  left: Math.round(c.getBoundingClientRect().left * 100) / 100,
}));
```

Registre os valores como `Amostra de Paridade` (ver `data-model.md` §1.4) com navegador, janela, ampliação e densidade.

### 4.3 Matriz mínima de aceite

| Cenário | Edge | Chrome | Firefox | Safari | Critério |
|---|---|---|---|---|---|
| 6 colunas · 1280×720 · 100% · sem preferências | ☐ | ☐ | ☐ | ☐ | GP-01, GP-02, GP-04 |
| 6 colunas · 1920×1080 · 100% · sem preferências | ☐ | ☐ | ☐ | ☐ | GP-01, GP-02, GP-04 |
| 6 colunas · 1920×1080 · 100% · preferências válidas | ☐ | ☐ | ☐ | ☐ | GP-02, GP-03 |
| 12 colunas · 1280×720 · 100% (soma excede a janela) | ☐ | ☐ | ☐ | ☐ | GP-04, GC-10 |
| 2 colunas · 2560×1440 · 100% | ☐ | ☐ | ☐ | ☐ | GP-01, GP-04 |
| 6 colunas · 1920×1080 · 50% / 150% / 200% | ☐ | ☐ | ☐ | ☐ | GP-05 |
| 6 colunas · densidade 1,50 e 2,00 | ☐ | ☐ | ☐ | ☐ | GP-06 |
| Preferências corrompidas (valor inválido na chave) | ☐ | ☐ | ☐ | ☐ | GC-09 |
| Temas claro, escuro e neutro | ☐ | ☐ | ☐ | ☐ | GP-09 |
| Visão Analytics e modais | ☐ | ☐ | ☐ | ☐ | GP-10 |

### 4.4 Comparar

Válido quando, entre navegadores, na mesma janela e ampliação:

- a quantidade e a ordem das colunas são idênticas (GP-01);
- a diferença de largura por coluna é de no máximo 1 px (GP-02);
- a diferença de posição horizontal acumulada é de no máximo 1 px (GP-03);
- nenhuma coluna aparece cortada, sobreposta, colapsada ou fora da área visível (GP-04).

## 5. Cenários de comportamento (validação funcional)

| Cenário | Passos | Resultado esperado |
|---|---|---|
| Largura padrão | Abrir quadro sem preferências | Todas as colunas com a mesma largura padrão |
| Arraste sem salto | Iniciar arraste da alça e mover 1 px | Largura aumenta ~1 px, sem salto (GC-06) |
| Limites | Arrastar até o extremo mínimo e o máximo | Largura não sai da faixa permitida (GC-03) |
| Preferência válida | Definir largura, recarregar | Largura preservada exatamente (GC-04) |
| Restaurar | Duplo clique na alça, duas vezes | Volta ao padrão nas duas vezes (GC-05) |
| Preferência corrompida | Gravar texto ou valor fora da faixa na chave e recarregar | Layout íntegro com a largura padrão (GC-09) |
| Rolagem contida | Quadro de 12 colunas em janela de 1280 px | Rolagem horizontal dentro da área do quadro; cabeçalho, métricas e filtros intactos (GC-10) |

## 6. Diagnóstico

Quando a largura resolvida divergir do esperado, procurar no console registros com prefixo `[Metrik Guard]` contendo `columnId`, `expected`, `resolved`, `preference` e `reason` (contrato §6, FR-014).

Se, com janela e ampliação idênticas e o mesmo conteúdo, **não houver divergência** entre navegadores, a causa do relato era ambiental (janela, ampliação ou estado local distinto) — hipóteses H2/H4 de `research.md`. Se houver divergência mesmo assim, a causa é de código e cai nas hipóteses H1/H3, tratadas pela fonte única de geometria.

## 7. Encerramento

- [ ] `npm run test` e `npm run build` limpos
- [ ] Matriz de §4.3 preenchida nos quatro navegadores
- [ ] Cenários de §5 aprovados
- [ ] Nenhum registro `[Metrik Guard]` de divergência inesperada
- [ ] Checklists `checklists/requirements.md` e `checklists/browser-parity.md` revisados pelo responsável

---

## 8. Resultados registrados — 2026-09-14

### 8.1 Verificação automatizada

| Verificação | Resultado |
|---|---|
| `npm run test` | **393 testes em 58 arquivos, todos aprovados** (linha de base anterior: 335) |
| `npm run build` | **Limpo** — `tsc` sem erros, 121 módulos, bundle gerado |
| `tests/unit/columnGeometry.test.ts` | 16 testes — resolução, limites, descarte, diagnóstico |
| `tests/unit/columnGeometryContract.test.ts` | 21 testes — guarda anti-drift CSS ↔ TS e ausência de detecção de navegador |
| `tests/unit/useColumnWidths.test.ts` | 10 testes — padrão, limites, descarte, restauração idempotente, troca de quadro |
| `tests/unit/Board.test.tsx` | 4 testes — largura explícita em toda coluna |
| `tests/unit/Column.test.tsx` | 13 testes (6 novos) — geometria explícita, arraste sem salto, restauração |

**Barra vermelha demonstrada**: antes da correção, `columnGeometryContract.test.ts` falhava em **9 testes** porque o CSS declarava 290/220, o TypeScript declarava 280/200, `useColumnWidths` não reusava o módulo puro e `Column.tsx` continha `width || 280` e `Math.max(200, Math.min(650, …))`.

### 8.2 Medição em navegador real (Chromium, ambiente de desenvolvimento)

Ambiente: navegador Chromium integrado, janela **1148 × 960**, densidade **1,25**.

**Linha de base — sem preferências salvas (T002)**

| Coluna | Largura medida | Estilo inline |
|---|---|---|
| Coluna To Do | 290 px | `290px` |
| Coluna In Progress | 290 px | `290px` |
| Coluna Blocked | 290 px | `290px` |
| Coluna Completed | 290 px | `290px` |

Posições horizontais: 22 / 326 / 630 / 934 → espaçamento constante de **304 px** (290 + 14 de intervalo). Contêiner rolável: `clientWidth` 1112, `scrollWidth` 1486 → o transbordo (4 colunas + cartão de nova coluna) fica **dentro** da área rolável do quadro, sem deslocar cabeçalho, métricas e filtros.

Custom properties resolvidas: `--metrik-column-width-default: 290px`, `--metrik-column-width-min: 220px`, `--metrik-column-width-max: 650px`.

**Após a correção — preferência válida + preferência inválida (T023)**

| Cenário | Preferência | Largura medida | Veredito |
|---|---|---|---|
| `todo` | 400 | **400 px** (`inline: 400px`) | GC-04 atendido |
| `in-progress` | 99999 (fora da faixa) | **290 px** (padrão) | GC-09 atendido |
| `blocked`, `completed` | ausente | 290 px | GC-02 atendido |

Diagnóstico emitido no console do navegador real (FR-014):

```text
[Metrik Guard] Column geometry divergence — columnId=in-progress expected=99999 resolved=290 preference=99999 reason=out-of-range
```

Em desenvolvimento a mensagem aparece **duas vezes** porque `src/main.tsx` usa `React.StrictMode` (montagem dupla intencional); em produção é emitida uma única vez. O estado do navegador foi restaurado após a medição (nenhuma preferência de largura remanescente).

### 8.3 Desfecho das hipóteses (T026)

| Hipótese | Desfecho |
|---|---|
| **H1** — drift de geometria + estado local por navegador | **Confirmada no código** e eliminada: havia 290 no CSS contra 280 no TS, e 220 contra 200. Agora existe fonte única, largura sempre explícita e guarda automatizada contra reintrodução. A reprodução visual do sintoma relatado no Chrome **não** foi possível neste ambiente (só há um motor Chromium disponível) — a confirmação final é a comparação manual Edge × Chrome |
| **H2** — ambiente diferente (janela, ampliação, barras) | **Provável co-fator**: a janela medida tinha 1148 px para 4 colunas de 290 px, ou seja, o quadro já transborda horizontalmente. Com contêiner rolável contido, o transbordo é o comportamento correto (FR-003). Comparação com janela e ampliação idênticas segue pendente |
| **H3** — salto no arraste | **Eliminada**: o arraste parte da largura renderizada (era base fixa de 280 px numa coluna de 290 px). Coberta por teste automatizado (GC-06) |
| **H4** — arredondamento em densidade não inteira | **Não observada**: com densidade 1,25 as larguras medidas foram exatas (290 e 400), sem fração. O arredondamento para inteiro agora é garantido por contrato |

### 8.4 Pendências de verificação manual

Estas verificações **não** puderam ser executadas neste ambiente e permanecem sob responsabilidade do responsável pela revisão:

- Comparação lado a lado **Edge × Chrome × Firefox × Safari** na matriz de §4.3.
- Cenários de **2, 6 e 12 colunas** e as variações de ampliação (50%/150%/200%) e densidade (1,50/2,00).
- Paridade das telas de **Analytics**, dos **modais** e dos **temas** claro/escuro/neutro entre navegadores.
- Arraste real da alça em navegador (a cobertura atual é por teste de componente).

