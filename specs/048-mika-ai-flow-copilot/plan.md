# Implementation Plan: Mika — AI Flow Copilot (Ciclo 5)

**Branch**: `048-mika-ai-flow-copilot` | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/048-mika-ai-flow-copilot/spec.md`

---

## Summary

Implementação da **Mika**, o copiloto nativo de inteligência artificial e eficiência de fluxo do Metrik. A solução é arquitetada de forma modular e soberana (Local-First):
1. **Motor Heurístico Local (`MikaHeuristicEngine`):** Análise determinística de telemetria estatística (Cycle Time, Throughput, Lei de Little, simulações de Monte Carlo e riscos de SLE) com execução instantânea e zero dependência de rede.
2. **Conector Google Gemini API (BYOK):** Chamadas HTTP nativas via `fetch` do navegador sem instalação de novas dependências externas pesadas no `package.json`, utilizando chave de API pessoal informada pelo usuário.
3. **Gaveta Retrátil Global & Cards Analíticos:** Componente `MikaDrawer` acionável no cabeçalho e `MikaInsightCard` embutido nos painéis de Analytics, estilizados com Vanilla CSS no Design System do Metrik.
4. **Assistente de Decomposição:** Botão contextual no `TaskDetailsModal` para sugerir subtarefas diretamente no checklist interno da tarefa com aprovação *human-in-the-loop*.

---

## Technical Context

**Language/Version**: TypeScript 5.6+ / React 18+  
**Primary Dependencies**: React, Lucide-react (ícones já instalados), motor analítico existente (`statistics.ts`, `boardMetrics.ts`, `monteCarlo.ts`) — **Zero novas bibliotecas**.  
**Storage**: `localStorage` (com ofuscação de credenciais e cache reativo de diagnósticos).  
**Testing**: Vitest + React Testing Library (testes unitários isolados para o motor e componentes).  
**Target Platform**: Navegador Web moderno (Chrome, Edge, Safari, Firefox).  
**Project Type**: Single-Page Application (Local-First Kanban Analytics).  
**Performance Goals**: Diagnósticos heurísticos locais < 50ms; renderização de cards < 300ms; chamadas Gemini com streaming ou resposta < 1.5s.  
**Constraints**: Não quebrar nenhum dos 701 testes existentes; manter o bundle de produção < 5s; não vazar dados para a rede em modo offline.  
**Scale/Scope**: 1 novo serviço de IA, 1 hook customizado, 4 novos componentes React focados e 1 módulo de estilo coeso.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I (Model Integrity & Soberania):** ✅ Aprovado. A Mika respeita a arquitetura Local-First; opera offline por padrão e suporta BYOK sem tráfego de dados não autorizado.
- **Princípio II (Clean Architecture):** ✅ Aprovado. Separação estrita entre camada de domínio estatístico, serviços de IA (`src/services/ai/`), hooks de estado (`useMika`) e componentes de apresentação (`src/components/Mika/`).
- **Princípio III (Automated Quality Gates):** ✅ Aprovado. Testes unitários cobrindo o motor heurístico, fallback de rede e componentes sem enfraquecer limiares de cobertura.
- **Princípio V (Simplicidade & YAGNI):** ✅ Aprovado. Zero novos pacotes em `package.json`; chamadas HTTP nativas via `fetch`.
- **Princípio VI (Raciocínio Analítico Pré-Tarefas):** ✅ Aprovado. A decomposição em `tasks.md` obedecerá aos 6 Modelos de Raciocínio Analítico Obrigatórios.

---

## Project Structure

### Documentation (this feature)

```text
specs/048-mika-ai-flow-copilot/
├── spec.md              # Especificação funcional refinada com clarificações
├── plan.md              # Este plano de arquitetura técnica
├── research.md          # Decisões de arquitetura (Gemini BYOK, motor heurístico, cache)
├── data-model.md        # Entidades TypeScript (MikaInsight, MikaDecomposition, etc.)
├── quickstart.md        # Guia de validação ponta a ponta
├── contracts/           # Esquemas JSON de validação de payloads
│   ├── mika-insights-schema.json
│   └── mika-decomposition-schema.json
└── checklists/
    └── requirements.md  # Checklist de qualidade dos requisitos
```

### Source Code Touched & Created

```text
src/
├── types/
│   └── mika.ts                   # Novas interfaces (MikaInsight, MikaPreferences, etc.)
├── services/
│   └── ai/
│       ├── mikaHeuristicEngine.ts # Motor local de diagnósticos estatísticos (offline)
│       ├── mikaGeminiClient.ts    # Cliente HTTP nativo para Google Gemini API
│       ├── mikaCacheManager.ts    # Gerenciador de cache reativo (boardId + checksum)
│       └── mikaService.ts         # Orquestrador central unificado
├── hooks/
│   └── useMika.ts                # Hook de conexão com estado global e quadro ativo
├── components/
│   ├── Mika/
│   │   ├── MikaTriggerButton.tsx  # Botão no cabeçalho com pulso visual
│   │   ├── MikaDrawer.tsx         # Gaveta retrátil lateral
│   │   ├── MikaInsightCard.tsx    # Card executivo nas telas de Analytics
│   │   ├── MikaTaskAssistant.tsx  # Modal/seção de decomposição de subtarefas
│   │   └── MikaSettingsTab.tsx    # Aba de preferências e BYOK em Configurações
│   ├── TaskDetailsModal.tsx       # Integração do botão de refinamento com a Mika
│   ├── AnalyticsDashboard.tsx     # Integração do MikaInsightCard no dashboard
│   ├── SettingsView.tsx           # Inclusão da aba Mika AI em Configurações
│   └── App.tsx                    # Inclusão do MikaDrawer e botão global
└── styles/
    └── 13-mika.css                # Estilos dedicados e coesos da Mika (Dark/Light/HC)
```

---

## Architecture Phases & Implementation Steps

### Phase 1: Setup & Data Modeling
1. Criar `src/types/mika.ts` exportando `MikaInsight`, `MikaDecomposition`, `MikaPreferences` e tipos de suporte.
2. Criar `src/services/ai/mikaCacheManager.ts` para armazenamento e invalidação reativa em memória/localStorage.

### Phase 2: Motor Heurístico & Serviços de IA
1. Implementar `src/services/ai/mikaHeuristicEngine.ts`:
   - Análise de percentil 85 de Cycle Time.
   - Análise de estrangulamento de WIP e Lei de Little por coluna.
   - Tradução probabilística da simulação de Monte Carlo.
   - Decomposição heurística local de tarefas comuns baseada em verbos de ação.
2. Implementar `src/services/ai/mikaGeminiClient.ts` com chamada nativa a `generativelanguage.googleapis.com` usando schema JSON estruturado.
3. Implementar `src/services/ai/mikaService.ts` com fallback automático e orquestração.
4. Testes unitários para `mikaHeuristicEngine.test.ts` e `mikaService.test.ts`.

### Phase 3: Hook Customizado & Integração com UI
1. Implementar `src/hooks/useMika.ts` escutando mutações no quadro ativo e gerenciando preferências.
2. Criar componentes `MikaTriggerButton`, `MikaDrawer`, `MikaInsightCard` e `MikaTaskAssistant`.
3. Criar folha de estilo `src/styles/13-mika.css` e incluir no manifesto `App.css`.
4. Integrar em `AnalyticsDashboard.tsx`, `TaskDetailsModal.tsx` e `SettingsView.tsx`.
5. Testes unitários de componentes e acessibilidade.

### Phase 4: Validação & Polish
1. Formatação com Prettier (`npm run format`).
2. Lint com ESLint estrito (`npm run lint`).
3. Suíte completa de testes (`npm test`) garantindo 701+ testes verdes.
4. Compilação de produção com Vite (`npm run build`) < 5s.
