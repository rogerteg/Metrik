# Quickstart: Validação do Menu de Administrador e Cabeçalho (028)

**Feature**: `028-admin-menu-header-layout`

---

## 1. Execução Rápida do Ambiente

```bash
npm run dev
```

Acesse a aplicação em `http://localhost:5173/`.

## 2. Roteiro de Teste Manual

1. **Abertura do Menu de Administrador**:
   - Clique no botão com avatar e nome "Administrador" (ou usuário ativo) no cabeçalho superior.
   - **Resultado esperado**: O dropdown abre sobrepondo a barra de métricas (Throughput, Lead Time, Cycle Time) de forma 100% nítida, sem nenhuma transparência irregular ou corte de layout.
2. **Fechamento por Teclado**:
   - Com o menu aberto, pressione a tecla `Escape`.
   - **Resultado esperado**: O menu fecha instantaneamente.
3. **Acesso a Squads e Novo Usuário**:
   - Abra o menu novamente.
   - Clique em "Cadastrar Novo Usuário" -> o formulário abre perfeitamente visível.
   - Clique em "Gerenciar Squads / Times" -> o modal de times abre centralizado e desimpedido.
4. **Verificação de Agrupamento Visual**:
   - Observe os botões no cabeçalho: Quadro/Analytics e Tema à esquerda da sessão, Perfil com destaque, e botões operacionais (Importar, Exportar, Demo, Limpar) agrupados à direita com divisória elegante.

## 3. Testes Automatizados

```bash
npm test
npm run build
```
