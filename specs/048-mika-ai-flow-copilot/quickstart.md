# Quickstart & Verification Guide: Feature 048 (Mika — AI Flow Copilot)

**Feature**: `048-mika-ai-flow-copilot` | **Cycle**: 5  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Research**: [research.md](./research.md) · **Data Model**: [data-model.md](./data-model.md)

Este documento descreve os procedimentos automatizados e manuais para validar a integração do copiloto de IA **Mika** no Metrik.

---

## 1. Pré-Requisitos de Ambiente

- Node.js instalado (v18+)
- Dependências instaladas (`npm install` ou `npm ci`)
- Navegador moderno com suporte a ES Modules e `localStorage`
- Servidor local ativo: `npm run dev` (acesso em `http://localhost:5173/`)

---

## 2. Cenários de Validação

### Cenário 1: Diagnóstico Narrativo nos Dashboards Analíticos (US1)

1. Abra a aplicação em `http://localhost:5173/`.
2. Garanta que o quadro ativo possui tarefas concluídas e em andamento (ou utilize o botão *"Reset Demo"* para carregar a massa estatística de demonstração).
3. Navegue até a visualização de **Analytics** (CFD, Cycle Time Scatter Plot ou Monte Carlo).
4. Verifique a renderização do card executivo **`MikaInsightCard`** no topo do painel:
   - **Resultado esperado**:
     - Diagnóstico legível em português sintetizando o Cycle Time do 85º percentil.
     - Projeção de data estimada com base na simulação de Monte Carlo.
     - Indicador de status/severidade adequado (verde/azul se o fluxo for estável, âmbar/vermelho se houver gargalos).

---

### Cenário 2: Decomposição de Tarefas no Modal de Detalhes (US2)

1. No quadro Kanban, clique em qualquer cartão com descrição para abrir o `TaskDetailsModal`.
2. Localize e clique no botão **"Sugerir Subtarefas com Mika"**.
3. O assistente da Mika deve propor uma lista de 3 a 5 subtarefas atômicas com caixas de seleção.
4. Desmarque uma das sugestões e clique em **"Adicionar Selecionadas ao Checklist"**.
5. **Resultado esperado**:
   - Os itens aprovados são imediatamente inseridos na seção de checklist do cartão (`task.checklist`).
   - O quadro Kanban permanece enxuto sem criar cartões espúrios.
   - O estado é persistido com sucesso no `localStorage`.

---

### Cenário 3: Operação Autônoma Offline e BYOK com Google Gemini (US3)

1. Abra o menu de **Configurações** e selecione a aba **Mika AI**.
2. Alterne o modo para *"Modo Heurístico (Offline)"*.
3. Navegue para o Analytics e acione um recálculo:
   - **Resultado esperado**: A Mika gera os diagnósticos utilizando o motor determinístico local em < 50ms, com zero chamadas de rede no painel Network do DevTools.
4. Volte para as Configurações, selecione *"Google Gemini API"*, insira uma chave fictícia ou válida e salve.
   - **Resultado esperado**: A chave é exibida mascarada (`AIzaSy...****`) e salva com ofuscação no `localStorage`.

---

### Cenário 4: Validação Automatizada de Testes Unitários

Executa os testes específicos da Mika e a suíte completa de regressão:

```bash
# Testes específicos do motor da Mika e componentes
npx vitest run tests/unit/mika.test.ts

# Suíte completa de não-regressão (701+ testes)
npm test
```

- **Critério de Aprovação**: 100% dos testes verdes com zero regressão.

---

### Cenário 5: Verificação de Build e Performance

```bash
npm run build
```

- **Critério de Aprovação**: Compilação TypeScript e empacotamento Vite sem erros em tempo inferior a 5 segundos.
