# Quickstart & Validation Guide: Hub de Espaços de Trabalho e Módulo Separado de Configurações

**Feature Branch**: `029-workspace-hub-and-settings`
**Date**: 2026-09-15
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Contracts**: [contracts/workspace-hub.contract.md](contracts/workspace-hub.contract.md)

---

## 1. Pré-requisitos & Ambiente de Teste

- **Node.js**: v18+ ou v20+
- **Aplicação ativa**: Servidor de desenvolvimento em execução local em `http://localhost:5173/`
- **Comandos de validação**:
  ```bash
  npm test
  npm run build
  ```

---

## 2. Cenários de Validação Rápida

### Cenário 1: Acesso ao Hub e Navegação entre Espaços de Trabalho
1. Abra a aplicação em `http://localhost:5173/`.
2. No cabeçalho principal, clique no botão **"Espaços"** no seletor de visualização (`Espaços | Quadro | Analytics`).
3. **Resultado Esperado**:
   - O quadro Kanban é recolhido e a visão panorâmica do Hub de Espaços de Trabalho é exibida com transição fluida.
   - A barra lateral exibe a lista dos espaços de trabalho com seus marcadores de cor (*Gestão, Produção, P&D, etc.*).
   - Ao clicar em um espaço na lateral (ex.: *P&D*), o grid de cartões atualiza instantaneamente para exibir os quadros daquele espaço (*IU, Desenvolvimento, QA*).

---

### Cenário 2: Vitrine de Quadros Favoritos (Adicionar e Remover com 1 Clique)
1. No grid de quadros do espaço ativo, localize um quadro (ex.: *"Desenvolvimento"*).
2. Clique no ícone de coração desmarcado no canto inferior do card.
3. **Resultado Esperado**:
   - O ícone é preenchido com a cor de destaque (`#f43f5e`).
   - O card do quadro aparece imediatamente na vitrine superior **"Quadros favoritos"**.
   - Ao clicar no coração de um card na vitrine de favoritos, o quadro é desfavoritado e removido da vitrine de forma síncrona.
   - Ao recarregar a página (`F5`), as preferências de favoritos permanecem salvas via `localStorage`.

---

### Cenário 3: Busca e Filtragem em Tempo Real na Barra em Pílula
1. Na barra intermediária de ações, clique no campo de busca da barra em pílula (*Pill Filter* com ícone de funil).
2. Digite o nome de um quadro (ex.: `"IU"` ou `"Dev"`).
3. **Resultado Esperado**:
   - O grid de quadros filtra instantaneamente, exibindo apenas os cartões que correspondem ao termo digitado.
   - O badge numérico da barra de filtro reflete a quantidade de resultados encontrados.

---

### Cenário 4: Acesso à Visão Separada de Configurações (Full View)
1. No cabeçalho ou na barra lateral, clique no botão com ícone de engrenagem / **"Configurações"**.
2. **Resultado Esperado**:
   - A interface transita para a tela dedicada de Configurações em tela cheia com duas colunas bem definidas.
   - A coluna esquerda apresenta as 4 abas verticais:
     - 🎨 *Geral & Aparência*
     - 👥 *Espaços & Squads*
     - 📊 *Políticas de Fluxo*
     - 💾 *Dados & Backup*
   - Ao alternar de tema (Dark, Light, Slate) na aba de aparência, as variáveis semânticas do tema atualizam imediatamente.
   - Ao clicar no botão `"← Voltar ao Quadro"`, a aplicação retorna suavemente para a visão de operação.

---

### Cenário 5: Criação de Novo Espaço de Trabalho via Botão "+ Novo painel"
1. No Hub de Espaços, clique no botão **"+ Novo painel"** na base da barra lateral.
2. No modal simplificado, informe um nome (ex.: *"Operações"*), escolha uma cor cromática na paleta e clique em **"Criar Espaço"**.
3. **Resultado Esperado**:
   - O novo espaço de trabalho é inserido na lista lateral com a cor selecionada.
   - O espaço é selecionado automaticamente e exibe o estado vazio com o botão para criar o primeiro quadro.

---

### Cenário 6: Verificação Automatizada Completa
Execute no terminal da raiz do repositório:
```bash
# Executa todos os testes unitários
npm test

# Executa verificação de tipos TypeScript e build de produção Vite
npm run build
```
**Critério de Aceitação**: Todos os testes verdes (zero falhas) e compilação sem erros.
