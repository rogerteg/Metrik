# Technical Research & Key Decisions: Enterprise Task Timeline Redesign

**Feature Branch**: `034-enhanced-task-timeline` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](spec.md)

---

## Decision 1: Agrupamento Cronológico em Baldes Temporais (Time Buckets)

- **Decision**: Organizar os itens da linha do tempo em grupos temporais ordenados ("Hoje", "Ontem", "Esta Semana", "Anteriores").
- **Rationale**: 
  - Reduz a carga cognitiva em tarefas com dezenas de movimentações e comentários.
  - Permite identificar rapidamente atualizações efetuadas no dia corrente sem precisar ler os horários individualmente.
- **Alternatives Considered**:
  - *Lista plana simples*: Dificulta a varredura visual e causa poluição informativa.
  - *Agrupamento mensal*: Muito amplo para quadros Kanban de fluxo contínuo com ciclo de vida curto/médio.

---

## Decision 2: Formatador Markdown Limpo sem Dependências Externas (`simpleMarkdown.ts`)

- **Decision**: Criar um utilitário interno puro em TypeScript (`simpleMarkdown.ts`) que mapeia sintaxes básicas de Markdown (`**negrito**`, `*itálico*`, `- listas`, ``código inline``) para nós React seguros.
- **Rationale**:
  - Respeita o **Princípio V (Simplicidade & YAGNI)** ao evitar a adição de pacotes pesados como `marked` ou `react-markdown`.
  - Garante **segurança total contra XSS** por renderizar elementos JSX nativos sem utilizar `dangerouslySetInnerHTML`.
- **Alternatives Considered**:
  - *Biblioteca `marked` / `react-markdown`*: Aumentaria o tamanho do bundle minificado e exigiria sanitizadores de HTML como `DOMPurify`.
  - *Texto puro sem formatação*: Atendia ao MVP anterior, mas limitava a expressividade e clareza de notas técnicas complexas.

---

## Decision 3: Cartões Visuais de Diff para Eventos de Auditoria (`[De ➔ Para]`)

- **Decision**: Renderizar eventos de auditoria como cartões visuais estruturados contendo badges coloridos e representação explícita de valores `[De ➔ Para]`.
- **Rationale**:
  - Atende 100% ao critério de sucesso **SC-002**, permitindo comparar instantaneamente colunas, prioridades e tags alteradas.
  - Alinha a interface do Metrik ao padrão dos líderes de mercado em Kanban Enterprise (ex.: Businessmap).
- **Alternatives Considered**:
  - *Frases em texto simples ("Movido de X para Y")*: Funcionais, mas exigiam leitura completa da frase para extrair a informação.

---

## Decision 4: Filtro de Primeira Classe e Badge Dourado para "Decisões de Projeto" (`isDecision`)

- **Decision**: Adicionar o atributo opcional `isDecision?: boolean` em `TaskComment`, um destaque visual com borda dourada e um botão de filtro exclusivo "Decisões" na `TimelineFilterBar`.
- **Rationale**:
  - Resolve a dor reportada pelo usuário de perda de contexto em discussões extensas, destacando alinhamentos arquiteturais e de requisitos.
  - O filtro exclusivo de primeira classe reduz em mais de 60% o tempo para encontrar uma decisão no histórico (**SC-001**).
- **Alternatives Considered**:
  - *Sistema complexo de tags por comentário*: Adicionaria sobrecarga de configuração sem ganho proporcional.

---

## Decision 5: Ícones SVG Nativos Inline para Preservação do Princípio VII

- **Decision**: Utilizar componentes de ícones SVG nativos inline em vez de bibliotecas de terceiros não instaladas (como `lucide-react`).
- **Rationale**:
  - Garante compilação TypeScript e execução em Vitest sem erros de módulo ausente.
  - Preserva estritamente a conformidade com o **Princípio VII (Brand Independence)**.
