# Quickstart & Verification Guide: Feature 016 - Clean Board Layout (Businessmap)

**Feature**: `016-clean-board-layout-businessmap` | **Status**: Planned

---

## 1. Como Iniciar o Ambiente de Testes & Desenvolvimento

```bash
# Navegar até o diretório do projeto
cd Metrik

# Iniciar servidor de desenvolvimento local
npm run dev

# Executar a suíte de testes unitários automatizados
npm test

# Executar a compilação estrita de produção (TypeScript + Vite)
npm run build
```

---

## 2. Roteiro de Verificação Visual e Manual

### Teste 1: Grid e Cabeçalhos das Colunas (Estilo Businessmap)
1. Abra a aplicação em `http://localhost:5173/`.
2. Observe as colunas do board:
   - Os títulos estão nítidos, com contadores de WIP no formato *pill* minimalista (`X / Y`).
   - O cabeçalho possui altura compacta e ações alinhadas com harmonia.
   - A primeira coluna (`To Do`) exibe o ícone de bloqueio de reordenação 🔒 de forma discreta.
   - As colunas contam com separação visual nítida e scrollbars customizadas sutis.

### Teste 2: Cards com Faixa Lateral e Cabeçalho Compacto
1. Examine um cartão em qualquer coluna:
   - A borda esquerda exibe a cor configurada na coluna (`3px a 4px` sólida), com fundo neutro dark slate (`#1e293b`).
   - O cabeçalho do cartão exibe o badge de prioridade alinhado a eventuais badges de status (`⛔ Bloqueado`, `⏳ Parado`).
   - A tipografia do título da tarefa é clara e confortável de ler.

### Teste 3: Campos de Critérios de Aceitação e Cenários de Testes
1. Localize a seção de qualidade no cartão:
   - No estado compacto, exibe um micro-box elegante com indicação resumida e botão de alternância.
   - Ao clicar no botão de expandir/recolher, a seção abre suavemente para edição inline instantânea.
   - Digitar critérios e cenários e sair do campo salva os dados sem perda de foco ou layout quebrado.

### Teste 4: Botões de Ação do Card
1. No rodapé do cartão:
   - Os botões direcionais (← / →) e o botão de lixeira exibem opacidade discreta (`0.6`).
   - Ao passar o mouse sobre eles, a opacidade transiciona suavemente para `1.0`.
   - Clicar no botão de avanço (→) move a tarefa suavemente para a coluna à direita.
   - Tentativas de movimentação para a esquerda continuam firmemente bloqueadas pelo guard de fluxo unidirecional ("Cuidado!").

### Teste 5: Não-Regressão de Regras de Negócio
- Tente arrastar um cartão bloqueado ⛔: o movimento deve ser impedido.
- Tarefas com mais de 3 dias sem alteração adquirem a borda marrom de estagnação (`#8B4513`).
- Gráfico CFD continua mapeando dinamicamente as mesmas cores selecionadas nas colunas.
