# Research & Technical Decisions: Core Kanban Board

## 1. Contexto & Objetivos
Definir as decisões de arquitetura e tecnologia para a Fase 1 do MVP do Metrik: um quadro Kanban ágil com 4 colunas (`Todo`, `In Progress`, `Blocked`, `Completed`), edição inline de tarefas e persistência local sem dependência de infraestrutura em nuvem no primeiro momento.

---

## 2. Decisões Técnicas

### Decisão 1: Arquitetura de Estado & Reatividade
- **Opções Avaliadas**:
  - *Opção A*: Redux Toolkit / Zustand
  - *Opção B*: Context API + Custom Hook reativo (`useTaskCollection`) com sincronização em `localStorage`
  - *Opção C*: Estado local descentralizado por coluna
- **Decisão**: **Opção B (Custom Hook Reativo `useTaskCollection` + LocalStorage)**.
- **Justificativa**: Em alinhamento com o Princípio V da Constituição (Simplicidade & YAGNI), o escopo do MVP não justifica a complexidade de boilerplate do Redux. Um hook desacoplado centraliza todas as operações atômicas (`addTask`, `updateTask`, `deleteTask`, `moveTask`, `clearTasks`), garantindo testabilidade isolada e zero dependência de libs pesadas de estado global.

### Decisão 2: Estratégia de Persistência no LocalStorage
- **Opções Avaliadas**:
  - *Opção A*: Uma chave única serializada com o estado global do quadro (`metrik_kanban_tasks`)
  - *Opção B*: Múltiplas chaves (uma por coluna: `metrik_todo`, `metrik_in_progress`...)
  - *Opção C*: IndexedDB via Dexie.js
- **Decisão**: **Opção A (Chave única `metrik_kanban_tasks` estruturada por dicionário de colunas)**.
- **Justificativa**: Garante atomicidade em operações de movimentação de tarefas entre colunas (evita inconsistências se uma chave falhar ao gravar e outra suceder) e simplifica o reset/backup do quadro. A payload do MVP (< 500 tarefas) ocupa menos de 200KB, muito abaixo do limite típico de 5MB do `localStorage`.

### Decisão 3: Mecanismo de Auto-redimensionamento de Textarea
- **Opções Avaliadas**:
  - *Opção A*: `contenteditable` div
  - *Opção B*: Elemento `<textarea>` com hook de cálculo dinâmico de `scrollHeight`
  - *Opção C*: CSS moderno `field-sizing: content` com fallback
- **Decisão**: **Opção B combinada com C (Textarea controlado com ajuste via `ref.scrollHeight` e `field-sizing: content`)**.
- **Justificativa**: Elementos `contenteditable` introduzem problemas graves de sanitização de HTML e manipulação de quebra de linha. O `<textarea>` garante texto puro seguro, acessibilidade e redimensionamento suave sem barras de rolagem.

### Decisão 4: Modelo de Identificação Única (IDs)
- **Decisão**: **UUID v4**.
- **Justificativa**: Elimina riscos de colisão ao criar tarefas em rápida sucessão e mantém compatibilidade futura imediata com bancos de dados distribuídos (PostgreSQL, Supabase) nas fases posteriores do Metrik.

---

## 3. Matriz de Riscos e Mitigações (Premortem)

| Risco Técnico | Causa Potencial | Mitigação Arquitetural |
|---|---|---|
| **JSON corrompido no LocalStorage** | Edição externa manual no DevTools ou falha do navegador | Wrapper defensivo com bloco `try/catch`. Se o parse falhar, restaura dados seed limpos e emite log estruturado. |
| **Degradação de performance em re-renders** | Renderizar 100+ tarefas disparando renderizações desnecessárias | Componentes puros (`React.memo` ou divisão atômica `Column` / `Task`), isolando o estado de edição inline em cada cartão. |
| **Estouro de cota de armazenamento** | Usuário colando blocos massivos de texto | Limite superior de 1.000 caracteres por cartão validado na UI. |
