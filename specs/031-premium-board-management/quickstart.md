# Quickstart & Verification Guide: Gerenciamento Premium de Quadros (Feature 031)

**Feature**: `031-premium-board-management`  
**Status**: Ready  
**Date**: 2026-09-17  

---

## 1. Prerequisites

- Node.js 18+ e npm instalados.
- Aplicação Metrik em execução local:
  ```bash
  npm run dev
  ```
  URL: `http://localhost:5173/`

---

## 2. End-to-End Validation Scenarios

### Cenário 1: Navegação para a Aba "Gerenciar" e Visualização da Grade
1. Acesse o Metrik no navegador.
2. No cabeçalho principal, localize o grupo de navegação `.view-toggle` (`Espaços | Quadro | Analytics | Gerenciar | Configurações`).
3. Clique em **"Gerenciar"** (ou no botão "Gerenciar" ao lado do seletor de quadros).
4. **Resultado esperado**:
   - A visualização é atualizada para a tela cheia de Gerenciamento de Quadros.
   - O cabeçalho da página exibe título, subtítulo e resumo quantitativo de quadros.
   - Os quadros do usuário são exibidos em cartões amplos com badge de "Quadro Ativo" brilhando, tags de Squad e chips com contagem de colunas e tarefas.

---

### Cenário 2: Alternância Dual de Visualização (Grade de Cartões vs Tabela Compacta)
1. Na tela de Gerenciamento, localize o alternador de visualização no canto superior direito da lista de quadros.
2. Clique no ícone/botão de **Tabela**.
3. **Resultado esperado**:
   - A grade de cartões transiciona suavemente para uma tabela corporativa compacta de alta densidade.
   - Cada linha exibe: Nome do Quadro, Squad, Total de Tarefas, Itens em Andamento (WIP), Colunas e Ações Rápidas.
4. Clique de volta no botão de **Grade** para retornar aos cartões visuais.

---

### Cenário 3: Busca Textual em Tempo Real e Filtro por Squad
1. Na barra de ações superior, digite parte do nome de um dos quadros existentes (ex: "Alpha").
2. **Resultado esperado**: A grade/tabela filtra instantaneamente (< 50ms) mantendo apenas os quadros que contêm o termo buscado.
3. Limpe o campo de busca.
4. No seletor dropdown "Todas as Squads", selecione uma squad específica.
5. **Resultado esperado**: Apenas os quadros vinculados àquela squad permanecem visíveis.

---

### Cenário 4: Criação e Edição Rápida de Nome Inline
1. No painel de criação rápida no topo da tela, digite "Quadro Beta Teste", selecione uma squad e clique em **"Criar Quadro"**.
2. **Resultado esperado**: O novo quadro aparece imediatamente na grade com suas colunas padrão.
3. No cartão do novo quadro, clique na ação **"Renomear"**.
4. Modifique o nome para "Quadro Beta Refatorado" e pressione `Enter`.
5. **Resultado esperado**: O título é atualizado imediatamente e refletido em tempo real no seletor do cabeçalho.

---

### Cenário 5: Exclusão Segura com Diálogo Modal Estilizado
1. No cartão do quadro criado no Cenário 4, clique em **"Excluir"**.
2. **Resultado esperado**: Abre-se um diálogo modal seguro e estilizado (sem alertas nativos do navegador) detalhando as tarefas associadas.
3. Confirme a exclusão no modal.
4. **Resultado esperado**: O quadro é removido permanentemente da grade com animação de saída limpa.
5. Tente excluir o último quadro remanescente caso sobre apenas 1.
6. **Resultado esperado**: O botão de confirmação permanece desabilitado com mensagem explicativa informando que o Metrik exige ao menos um quadro ativo.

---

## 3. Automated Verification Commands

Execute a suíte completa de testes automatizados para certificar zero regressões:

```bash
# Executar todos os testes de unidade e componentes
npm run test

# Validar compilação estrita TypeScript e bundle Vite
npm run build
```

**Critério de Aprovação**: 100% dos testes verdes e zero erros de compilação.
