# Research: Interação Drag-and-Drop Nativa (HTML5 Drag & Drop)

**Feature**: `003-drag-and-drop-interaction`  
**Date**: 2026-09-08  
**Status**: Completed  

---

## 1. Contexto & Desafios Técnicos

O Metrik foi concebido sob princípios estritos de simplicidade (YAGNI), arquitetura limpa e performance de 60 FPS offline-first sem dependências infladas.

Para viabilizar a interação de arrastar e soltar cartões no quadro Kanban, duas abordagens foram avaliadas:
1. **Bibliotecas Externas de Terceiros** (`react-beautiful-dnd`, `@dnd-kit/core`, `react-dnd`):
   - *Prós*: Suporte touch embutido, animações sofisticadas de física.
   - *Contras*: `react-beautiful-dnd` está descontinuada/incompatível com React 19; `@dnd-kit` adiciona dependências transitivas, hooks pesados e complexidade de peer-dependencies; overhead significativo no bundle.
2. **API Nativa HTML5 Drag and Drop** (Recomendada):
   - *Prós*: 0 bytes de dependências adicionais, suporte nativo universal em todos os navegadores modernos, performance máxima, total compatibilidade com React 19.
   - *Contras*: Requer tratamento cuidadoso dos eventos de `dragenter`/`dragleave` para evitar tremulação (flickering) quando o cursor transita por elementos filhos da coluna.

**Decisão Arquitetural**: Adotar a **API Nativa HTML5 Drag and Drop**, encapsulada em hooks limpos e classes CSS puras, preservando os botões direcionais (`←` e `→`) como mecanismo de acessibilidade e fallback perfeito para mobile/touch.

---

## 2. Padrões de Implementação HTML5 DnD em React 19

### 2.1. Mitigando Tremulação (Flickering) em `dragenter` / `dragleave`
No modelo de eventos do navegador, quando um item arrastado sobrevoa um elemento filho (ex: um cartão dentro da coluna), o navegador dispara `dragleave` no pai e `dragenter` no filho. Se uma classe de estilo `.kanban-column-drop-target` for alternada ingenuamente nesses eventos, a coluna sofrerá tremulação visual contínua.

*Solução*:
Utilizar um contador de profundidade (`dragDepthRef` ou estado) na coluna:
- Ao entrar (`dragenter`), incrementa o contador. Se o contador for 1, ativa o highlight.
- Ao sair (`dragleave`), decrementa o contador. Se o contador chegar a 0, remove o highlight.
- No `drop` ou `dragend`, zera o contador incondicionalmente.

### 2.2. Prevenção de Conflito com `AutoResizeTextarea`
Cartões de tarefas possuem um textarea expansível para edição do título. Se o usuário clicar e arrastar para selecionar texto dentro do textarea, o navegador não deve iniciar o arraste do cartão.

*Solução*:
- Atributo `draggable={!isEditing}` no container do cartão.
- No `AutoResizeTextarea`: `onPointerDown={(e) => e.stopPropagation()}` e `draggable={false}` garantem que eventos de ponteiro no campo de texto permaneçam isolados.
- Botões direcionais e botão de exclusão recebem `onPointerDown={(e) => e.stopPropagation()}`.

### 2.3. Algoritmo de Reordenação e Posicionamento
O array de tarefas em `useTaskCollection` mantém a ordem dos cartões.
Quando um cartão `A` é solto:
1. **Solto sobre uma coluna vazia ou espaço vazio da coluna**:
   - `A` é movido para o final daquela coluna (`targetIndex = undefined` ou índice final).
2. **Solto sobre outro cartão `B`**:
   - Se o cursor estiver na metade superior de `B`, insere `A` antes de `B`.
   - Se o cursor estiver na metade inferior de `B`, insere `A` depois de `B`.
3. **Mapeamento de Timestamps de Fluxo**:
   - Se o cartão mudou de coluna, invoca a mesma máquina de estados determinística já consolidada na Feature 002:
     - Ingresso em `In Progress` ou `Blocked`: registra `startedAt` se estava nulo.
     - Ingresso em `Completed`: registra `completedAt`.
     - Saída de `Completed` para outra coluna: limpa `completedAt` (`null`).

---

## 3. Matriz de Compatibilidade e Acessibilidade

| Interação | Desktop (Mouse) | Teclado | Mobile / Touch |
|---|---|---|---|
| **Drag-and-Drop Nativo** | ✅ Ativo e fluido | ❌ N/A | ⚠️ Limitado (varia por SO) |
| **Botões Direcionais (`←`/`→`)** | ✅ Totalmente funcional | ✅ Totalmente acessível | ✅ Excelente ergonomia móvel |
| **Persistência `localStorage`** | ✅ Imediata | ✅ Imediata | ✅ Imediata |

---

## 4. Conclusão da Pesquisa

A abordagem puramente nativa atende 100% aos requisitos de funcionalidade, ergonomia visual e performance sem inflar o projeto. Todos os pontos de incerteza técnica foram elucidados e não há impedimentos para a formalização do modelo de dados e quickstart.
