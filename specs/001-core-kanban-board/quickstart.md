# Quickstart: Core Kanban Board (MVP Fase 1)

## Visão Geral
Este guia descreve como inicializar, executar e testar o componente do quadro Kanban do Metrik localmente.

---

## 1. Pré-Requisitos
- Node.js (v18+) e npm / pnpm / yarn
- Navegador moderno com suporte a LocalStorage e CSS Grid

---

## 2. Inicialização & Execução Local
```bash
# Instalar dependências (caso seja um novo projeto Vite/React)
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 3. Roteiro de Validação Manual (User Journeys)

### Teste 1: Renderização do Quadro (US1)
1. Abra a aplicação no navegador (`http://localhost:5173`).
2. Confirme que as 4 colunas (`Todo`, `In Progress`, `Blocked`, `Completed`) estão visíveis lado a lado.
3. Observe as cores das badges:
   - `Todo`: Cinza
   - `In Progress`: Azul
   - `Blocked`: Vermelho
   - `Completed`: Verde

### Teste 2: Adição & Edição de Cartão (US2)
1. Na coluna `Todo`, clique no botão `+`.
2. Um novo cartão em branco deve aparecer imediatamente.
3. Digite um título de múltiplas linhas: a caixa deve expandir automaticamente sem barra de rolagem.
4. Clique fora para remover o foco: o texto permanece.

### Teste 3: Teste de Persistência (US3)
1. Crie uma tarefa na coluna `In Progress` chamada `"Minha tarefa teste"`.
2. Recarregue a página com `F5` ou feche e reabra a aba.
3. Verifique se `"Minha tarefa teste"` continua exatamente na coluna `In Progress`.

### Teste 4: Transição de Coluna (US4)
1. Mova a tarefa de `In Progress` para `Blocked`.
2. Verifique se a contagem de `In Progress` decresceu em 1 e `Blocked` aumentou em 1.
3. Confirme que o cartão adquire destaque de bloqueio.

### Teste 5: Exclusão e Reset (US5)
1. Clique no ícone de lixeira em um cartão: ele deve sumir imediatamente.
2. Clique no botão de topo "Clear Tasks" e confirme: todo o quadro deve ser esvaziado.
