# Quickstart & Verification Guide: Salvamento Manual e Automático de Comentários e Campos da Tarefa

**Feature Branch**: `032-task-comment-autosave`  
**Date**: 2026-09-18  
**Spec**: [`specs/032-task-comment-autosave/spec.md`](spec.md)

---

## 1. Pré-Requisitos

- Node.js 18+ e npm instalados.
- Branch atual: `032-task-comment-autosave`.
- Dependências instaladas (`npm install`).

---

## 2. Cenários de Validação Automatizada

### Testes Unitários de Persistência e Hooks:
```bash
# Executar testes unitários específicos do novo hook e componentes de edição
npm test -- tests/unit/useFieldEdit.test.ts tests/unit/TaskFieldActionToolbar.test.tsx tests/unit/Task.test.tsx tests/unit/TaskDetailsModal.test.tsx
```

### Validação Geral da Suíte:
```bash
# Executar suíte completa de testes unitários do Metrik
npm test -- --run

# Validar tipagem TypeScript e compilação do bundle de produção
npm run build
```

---

## 3. Roteiro de Validação Manual Ponta a Ponta

### Cenário 1: Edição Manual com Botão Salvar e Descartar (Modo Manual)
1. Abrir a aplicação (`npm run dev`) e navegar para a aba **Configurações** (`SettingsView`).
2. Na aba **Geral & Aparência**, desativar o switch *"Salvar automaticamente comentários e campos de texto"*.
3. Retornar ao **Quadro** (Kanban).
4. Abrir o modal de detalhes de um cartão ou expandir os campos de qualidade no próprio cartão.
5. Digitar texto na descrição ou critérios de aceitação.
6. **Verificação Esperada**:
   - O indicador exibe *"Alterações não salvas"*.
   - Os botões *"Salvar"* e *"Descartar"* tornam-se visíveis e habilitados.
7. Clicar em *"Descartar"* (ou pressionar `Escape` dentro do campo):
   - O texto retorna ao estado original e a barra de ações volta para o estado repouso.
8. Digitar novo texto e clicar em *"Salvar"*:
   - O indicador exibe *"Salvando..."* e transiciona para *"✓ Salvo"*.
   - Após 2 segundos, o aviso de sucesso se desvanece suavemente.
   - Recarregar a página e constatar que o texto digitado permanece gravado.

### Cenário 2: Atalho de Teclado `Ctrl+S` / `Cmd+S`
1. Em qualquer campo textual de tarefa em edição (no cartão ou no modal), digitar alterações.
2. Pressionar a combinação de teclas `Ctrl+S` (Windows/Linux) ou `Cmd+S` (macOS).
3. **Verificação Esperada**:
   - A janela nativa do navegador para salvar arquivo HTML NÃO deve ser aberta.
   - As alterações são salvas imediatamente com exibição de *"✓ Salvo"*.

### Cenário 3: Salvamento Automático via Debounce Inteligente (Modo Padrão)
1. Em **Configurações**, reativar a opção *"Salvar automaticamente comentários e campos de texto"*.
2. Voltar ao quadro e editar a descrição de uma tarefa.
3. Parar de digitar e aguardar 800ms.
4. **Verificação Esperada**:
   - O indicador exibe automaticamente *"Salvando..."* e depois *"✓ Salvo"*.
   - Nenhuma perda de dados ao fechar o modal ou mudar de aba.

### Cenário 4: Proteção Contra Saída Acidental do Modal
1. No modo manual, digitar alterações na descrição sem salvar.
2. Clicar no botão fechar ('×') do modal ou fora do modal.
3. **Verificação Esperada**:
   - Diálogo de proteção pergunta se o usuário deseja salvar as alterações pendentes antes de sair.
