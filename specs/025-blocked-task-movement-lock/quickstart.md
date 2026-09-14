# Quickstart & Manual Validation Guide: Trava Estrita de Movimentação para Cartões Bloqueados (025-blocked-task-movement-lock)

**Branch**: `025-blocked-task-movement-lock` | **Date**: 2026-09-14 | **Status**: In Planning | **Spec**: [specs/025-blocked-task-movement-lock/spec.md](spec.md)

---

## 1. Visão Geral

Este guia rápido fornece o roteiro completo de testes manuais e automatizados para validar a **Trava Estrita de Movimentação para Cartões Bloqueados** implementada na Feature 025.

---

## 2. Inicialização do Ambiente

1. Certifique-se de que as dependências estão instaladas:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra o navegador em: [http://localhost:5173/](http://localhost:5173/)

---

## 3. Roteiro de Cenários de Teste Manual

### Cenário 1: Bloqueio e Tentativa de Arrastar para Outra Coluna
- **Objetivo**: Confirmar que o cartão bloqueado não pode ser arrastado nem solto em outra coluna.
- **Passos**:
  1. Identifique um cartão na coluna "To Do" ou "em desenvolvimento".
  2. Abra os detalhes do cartão e clique em **"Bloquear Tarefa"** (ou insira a tag `"bloqueado"`).
  3. Observe que o cartão ganha o badge `⛔ Bloqueado` e estilo visual de bloqueio.
  4. Passe o mouse sobre o cartão: observe o cursor de proibição (`cursor: not-allowed`).
  5. Tente clicar e arrastar o cartão para a coluna seguinte: o cartão **não deve iniciar o arrasto** (`draggable="false"`).
  6. Caso tente forçar a soltura em outra coluna, uma notificação contextual amigável aparece: *"Cartão bloqueado: retire a etiqueta de bloqueado para mover entre colunas"* e o cartão **permanece na sua coluna original**.

---

### Cenário 2: Reordenação Vertical na Mesma Coluna
- **Objetivo**: Confirmar que a equipe ainda consegue priorizar cartões bloqueados dentro da mesma coluna.
- **Passos**:
  1. Na coluna que contém múltiplos cartões (incluindo o cartão bloqueado), arraste o cartão bloqueado para cima ou para baixo **dentro da própria coluna**.
  2. Solte o cartão: a nova posição vertical dentro da coluna deve ser respeitada.
  3. Verifique que o status de bloqueio e a coluna original permanecem 100% inalterados.

---

### Cenário 3: Inatividade dos Botões de Navegação Lateral
- **Objetivo**: Confirmar que atalhos por botões também não permitem transitar o cartão.
- **Passos**:
  1. Observe a barra inferior de ações do cartão bloqueado.
  2. Os botões de avançar (`→`) e recuar (`←`) coluna não devem ser exibidos ou devem estar estritamente desabilitados.

---

### Cenário 4: Desbloqueio Rápido com 1 Clique no Badge
- **Objetivo**: Validar a retirada imediata da etiqueta e liberação da movimentação.
- **Passos**:
  1. No cartão bloqueado no quadro Kanban, clique diretamente sobre o badge `⛔ Bloqueado`.
  2. O sistema remove a etiqueta de bloqueio instantaneamente.
  3. O badge desaparece e o cursor volta ao normal.
  4. Arraste o cartão para outra coluna: a movimentação é realizada imediatamente com sucesso!

---

### Cenário 5: Sincronização Automática com a Tag "bloqueado"
- **Objetivo**: Garantir que o modelo mental de "etiqueta" (tag) funcione perfeitamente.
- **Passos**:
  1. Em um cartão desbloqueado, adicione a tag `"bloqueado"`.
  2. O sistema reconhece a etiqueta, ativa o status bloqueado e aplica a trava de movimento.
  3. Remova a tag `"bloqueado"` clicando no `×` da etiqueta.
  4. O sistema desfaz o bloqueio e libera a movimentação imediatamente.

---

## 4. Execução dos Testes Automatizados

Execute a suíte de testes unitários:
```bash
npm run test
```
*Critério de Sucesso*: Todos os testes unitários (incluindo `blockedTaskMoveGuard.test.tsx` e `taskReorder.test.ts`) devem passar com 100% de sucesso.

Valide a integridade do build:
```bash
npm run build
```
*Critério de Sucesso*: Compilação TypeScript e empacotamento Vite sem nenhum erro ou aviso.
