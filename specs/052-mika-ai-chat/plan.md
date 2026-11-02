# Implementation Plan: Mika Conversational AI Chat Copilot (Feature 052)

**Branch**: `052-mika-ai-chat` | **Date**: 2026-10-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/052-mika-ai-chat/spec.md`

---

## Summary

Esta funcionalidade expande a Mika AI de uma gaveta de diagnósticos estáticos para uma **experiência conversacional completa e interativa em linguagem natural (Chat)** dentro do painel lateral global ([`MikaDrawer.tsx`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/Mika/MikaDrawer.tsx)):
1. **Navegação por Abas na Gaveta**: Abas dedicadas no topo ("💬 Chat" e "📊 Diagnósticos") preservando o acesso aos diagnósticos consolidados clássicos e oferecendo altura integral e foco na conversa.
2. **Motor Duplo de Inteligência**:
   - *Google Gemini API (BYOK)*: Contexto multi-turn de até 6 mensagens com injeção de telemetria rica do quadro ativo.
   - *Motor Heurístico Local-First (Offline)*: Classificador determinístico de intenções por palavras-chave com templates dinâmicos ([`mikaChatHeuristicEngine.ts`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/ai/mikaChatHeuristicEngine.ts)), garantindo respostas em <10ms sem internet e sem custos de tokens.
3. **Interatividade Operacional de Tarefas**: Menções a tarefas (ex.: `#42`) renderizadas como chips clicáveis que abrem o modal de detalhes ([`TaskDetailsModal`](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TaskDetailsModal.tsx)).
4. **Persistência Local-First com Janela Deslizante**: Histórico retido no navegador em regime FIFO limitado a 30 mensagens por quadro, com ação de limpeza sob confirmação e botão de cópia de respostas em 1 clique.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 18 / Node.js 18+  
**Primary Dependencies**: React 18, Vite, Vitest (zero novas dependências externas de runtime)  
**Storage**: Client-side `localStorage` (Local-First sovereignty)  
**Testing**: Vitest (`npm run test`), TypeScript strict checking (`npx tsc --noEmit`), Vite production build (`npm run build`)  
**Target Platform**: Navegadores modernos (Chrome, Edge, Firefox, Safari)  
**Project Type**: Single-page web application (Kanban & Flow Analytics)  
**Performance Goals**: Respostas locais em < 300ms (SC-002), abertura da gaveta e início de consulta em < 3s (SC-001)  
**Constraints**: 
- 100% de soberania Local-First: dados não trafegam sem chave configurada (Princípio VIII)
- Zero menções a produtos ou marcas de concorrentes (Princípio VII)
- Modo estritamente consultivo (*read-only*): sem mutações automáticas no quadro sem confirmação do usuário (FR-009)
- Janela deslizante de 30 mensagens em `localStorage` para prevenir estouro de cota (FR-005)  
**Scale/Scope**: Quadros com até 500 tarefas, múltiplas colunas e estados de bloqueio.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio Constitucional | Avaliação de Conformidade | Status |
|---|---|---|
| **I. Spec-Driven Development** | Ciclo formal cumprido: `spec.md` → `research.md` → `data-model.md` → `contracts/` → `quickstart.md` → `plan.md`. | **PASS** |
| **II. Qualidade de Código & Modularidade** | Separação estrita entre o cliente de IA, classificador heurístico, gerenciador de armazenamento, construtor de telemetria e componentes visuais de chat. | **PASS** |
| **III. Verificação Automatizada** | Suíte de testes unitários abrangente cobrindo o classificador de intenção, renderização com chips interativos, alternância de abas e FIFO. | **PASS** |
| **IV. Observabilidade** | Logs estruturados com prefixo `[Metrik Mika Chat]` para operações e fallbacks de rede. | **PASS** |
| **V. Simplicidade & YAGNI** | Uso de classificador heurístico leve baseado em regex e palavras-chave locais; zero frameworks pesados de IA no cliente. | **PASS** |
| **VI. Raciocínio Analítico Pré-Tarefas** | Os 6 modelos analíticos obrigatórios precederão formalmente a lista de tarefas no `tasks.md`. | **PASS** |
| **VII. Independência de Marca** | Respostas e prompts estritamente padronizados na literatura Lean/Kanban; zero referências a ferramentas terceiras. | **PASS** |
| **VIII. Soberania Local-First** | Funciona 100% offline via `mikaChatHeuristicEngine` e armazena histórico isolado por quadro no `localStorage`. | **PASS** |
| **IX. Integridade de Dados** | Operação estritamente consultiva: Mika analisa e recomenda, mas jamais move ou exclui cartões autonomamente. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/052-mika-ai-chat/
├── spec.md              # Especificação com requisitos e decisões do clarify
├── plan.md              # Plano técnico de arquitetura (este arquivo)
├── research.md          # Decisões arquiteturais e análise de trade-offs
├── data-model.md        # Entidades, invariantes de armazenamento e máquina de estados
├── contracts/           # Contratos de interfaces e tipagens TypeScript
│   └── chat-contracts.ts
├── quickstart.md        # Guia de validação automatizada e roteiro manual
├── checklists/
│   └── requirements.md  # Checklist de qualidade de requisitos
└── tasks.md             # Tarefas atômicas de implementação (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── mika.ts                         # Adição de MikaChatMessage, MikaChatSession, MikaQuickPrompt
├── services/
│   └── ai/
│       ├── mikaChatHeuristicEngine.ts  # Classificador determinístico de intenções e templates dinâmicos
│       ├── mikaContextBuilder.ts       # Extrator de telemetria do quadro e construtor de prompts
│       ├── mikaChatStorageManager.ts   # Persistência FIFO de 30 mensagens em localStorage
│       └── mikaGeminiClient.ts         # Suporte a chat multi-turn com history de até 6 mensagens
├── components/
│   └── Mika/
│       ├── MikaDrawer.tsx              # Atualização com navegação por abas ("💬 Chat" vs "📊 Diagnósticos")
│       ├── MikaDrawer.css              # Estilos das abas e layout do container
│       ├── MikaChatInterface.tsx       # Componente do chat (lista de mensagens, chips, indicador de digitação)
│       ├── MikaChatInterface.css       # Estilos da área de conversa, balões e rodapé de envio
│       └── MikaMessageContent.tsx      # Formatador de markdown com chips clicáveis de tarefas (#ID)
tests/
└── unit/
    └── mikaChat.test.tsx               # Suíte Vitest cobrindo motor heurístico, storage e UI
```

**Structure Decision**: Manter a lógica analítica em serviços puros (`src/services/ai/`) sem dependências do DOM para execução determinística em milissegundos nos testes Vitest, e desacoplar o chat em componentes focados dentro de `src/components/Mika/`.

---

## Complexity Tracking

*Nenhuma violação ou exceção constitucional necessária. Todas as decisões técnicas cumprem rigorosamente YAGNI, Local-First e modularidade.*
