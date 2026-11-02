# Guia de Validação Rápida (Quickstart): Mika Conversational AI Chat Copilot (Feature 052)

**Feature Branch**: `052-mika-ai-chat`  
**Date**: 2026-10-29  
**Status**: Completed  
**Spec Reference**: [spec.md](./spec.md)

---

## 1. Verificação Automatizada (Testes de Unidade)

A funcionalidade é coberta por testes automatizados com o Vitest garantindo conformidade com o Princípio III (Verificação Automatizada):

```bash
# Executar suíte de testes unitários do chat da Mika
npm run test tests/unit/mikaChat.test.tsx

# Executar validação de tipos TypeScript
npx tsc --noEmit

# Validar compilação do bundle de produção Vite
npm run build
```

### Casos de Teste Chave Implementados:
1. **Motor Heurístico Local (`mikaChatHeuristicEngine.test.ts`)**:
   - Reconhece intenção de gargalos com menção à coluna de maior acúmulo.
   - Reconhece intenção de cartões bloqueados e extrai `referencedTaskIds`.
   - Reconhece intenção de SLE de 85% e reflete o percentil calculado.
   - Fornece resposta padrão cordial para perguntas fora de escopo.
2. **Gerenciador de Contexto e Armazenamento (`mikaContextBuilder.test.ts` e `mikaChatStorage.test.ts`)**:
   - Monta o snapshot de telemetria sem vazamento de marcas de terceiros (Princípio VII).
   - Limita rigorosamente o armazenamento local a 30 mensagens em regime FIFO.
   - Prepara payload com as últimas 6 mensagens contextuais para a API Gemini.
3. **Componentes Visuais (`MikaDrawer.test.tsx` e `MikaChatInterface.test.tsx`)**:
   - Alternância fluida entre abas "💬 Chat" e "📊 Diagnósticos".
   - Disparo imediato ao clicar em chips de perguntas rápidas.
   - Exibição de indicador de digitação (*typing indicator*) com `aria-live="polite"`.
   - Cópia de resposta com badge temporário "Copiado!".
   - Clique em identificador `#ID` disparando `onOpenTaskDetails`.

---

## 2. Roteiro de Validação Manual no Navegador

### Cenário 1: Navegação por Abas e Consulta de Boas-Vindas
1. Abra a aplicação no navegador (`npm run dev`).
2. No cabeçalho global, clique no botão da **Mika** para abrir a gaveta retrátil.
3. Observe as duas abas no topo: **"💬 Chat"** (ativa) e **"📊 Diagnósticos"**.
4. Clique na aba **"📊 Diagnósticos"**: verifique se os cards analíticos clássicos são exibidos normalmente.
5. Retorne para a aba **"💬 Chat"**: verifique a mensagem de introdução da Mika e os 4 chips de perguntas rápidas.

### Cenário 2: Envio com Chips de Perguntas Rápidas e Fallback Local
1. Clique no chip **"Cartões bloqueados"**.
2. Observe o indicador animado de digitação enquanto a resposta é formulada.
3. Constatar que a Mika lista as tarefas impedidas com seus IDs (ex.: `#1`, `#2`) e tempo de bloqueio.
4. Clique sobre o chip do identificador `#1`: verifique se o modal de detalhes da tarefa (`TaskDetailsModal`) é aberto imediatamente.
5. Feche o modal da tarefa.

### Cenário 3: Cópia de Resposta
1. Na resposta gerada pela Mika, localize o botão **"Copiar"** no rodapé do balão.
2. Clique no botão: verifique a confirmação visual temporária **"Copiado!"**.
3. Cole o conteúdo em um editor de texto e confirme a fidelidade da mensagem formatada.

### Cenário 4: Perguntas Livres e Persistência Local-First
1. No campo de entrada de texto, digite: *"Onde está o principal gargalo do fluxo?"* e pressione `Enter`.
2. Verifique a resposta apontando a coluna com maior tempo de permanência ou violação de WIP.
3. Feche a gaveta no botão `✕` ou pressione `Escape`.
4. Reabra a gaveta da Mika: confirme que todo o histórico das mensagens foi restaurado a partir do `localStorage`.

### Cenário 5: Limpeza de Histórico
1. No topo da área de chat, clique no botão **"Limpar Conversa"** (ícone de lixeira).
2. Confirme o diálogo de confirmação.
3. Verifique que o histórico é resetado para a tela inicial limpa com chips de sugestão.
