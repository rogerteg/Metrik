# Especificação 060 — Otimização de Peso de Entrada e Particionamento de Bundle (Entry Payload Optimization)

**Status**: Implemented & Verified (2026-11-19)  
**Prioridade**: P2  
**Autor**: Metrik Core Team  
**Precedência**: `constitution.md` > `project-context.md` > `lessons-learned.md` > `spec.md` > `plan.md` > `tasks.md` > código.

---

## 1. Contexto e Motivação

O Metrik adota como princípio não-negociável a soberania **Local-First** e performance de classe mundial. No entanto, auditorias recentes identificaram dois pontos críticos de degradação no carregamento inicial da aplicação:
1. **Ativos de Imagem Inflados**: O logotipo raster `public/metrik-logo.png` possuía 982,6 kB e o ativo compilado `dist/assets/metrik-logo-*.png` pesava 43,3 kB, sem suporte a favicon vetorial escalável SVG.
2. **Chunk Monolítico no Build**: O chunk principal de JavaScript (`dist/assets/index-*.js`) atingia 634,7 kB minificado, ultrapassando o limiar de performance do Vite (500 kB) e gerando o aviso de compilação `(!) Some chunks are larger than 500 kB after minification`.

Esta especificação formaliza a otimização de payload de entrada e o particionamento inteligente de módulos, garantindo carregamento instantâneo e zero avisos de build.

---

## 2. Requisitos Funcionais e Técnicos

### FR-001: Favicon Vetorial SVG e Otimização de Ativos Raster
- O sistema DEVE fornecer um favicon vetorial em SVG (`public/favicon.svg`), leve (< 2 kB) e escalável para alta densidade de pixels.
- O logotipo principal raster (`public/metrik-logo.png` e `src/assets/metrik-logo.png`) DEVE ser reprocessado para resolução otimizada de 160x160 pixels com filtro Lanczos e compressão PNG máxima.
- O ativo compilado final `dist/assets/metrik-logo-*.png` MUST ter tamanho estritamente inferior a 30 kB (alcançando ~20,9 kB).
- O arquivo `index.html` DEVE carregar o favicon SVG nativo prioritário com fallback para o PNG compacto.

### FR-002: Particionamento Modular de Chunks (Chunk Principal < 500 kB)
- A configuração do Rollup em `vite.config.ts` DEVE implementar função de `manualChunks` baseada em limites de domínio arquitetural.
- Os seguintes subsistemas devem ser particionados em chunks dedicados para desonerar o entry point:
  - `feature-flow-rules`: Regras de automação de fluxo (`FlowRulesModal`, `FlowRuleBuilder`, utilitários e hooks).
  - `feature-mika`: Copiloto Mika AI (`MikaDrawer`, `MikaChatInterface`, contexto e clientes).
  - `feature-workspace-management`: Gestão de workspaces e configurações (`WorkspaceHub`, `ManageBoardsView`, `SettingsView`).
  - `feature-reports`: Relatórios e exportação (`ExportReportModal`, `ExecutiveReportPrintView`, `flowReportExporter`).
  - `feature-sprints`: Gestão iterativa de sprints (`SprintManagerModal`, utilitários de sprint).
- O chunk principal da aplicação (`dist/assets/index-*.js`) MUST ter tamanho estritamente inferior a 500 kB (meta alcançada: ~238 kB).
- O build de produção (`npm run build`) DEVE passar com código 0 e **zero avisos** de chunks acima de 500 kB.

---

## 3. Critérios de Aceitação e Falsificabilidade

1. `(Get-Item public/metrik-logo.png).Length` < 30.000 bytes.
2. `(Get-Item src/assets/metrik-logo.png).Length` < 30.000 bytes.
3. `Test-Path public/favicon.svg` retorna `True`.
4. `npm run build` executa em < 4 segundos com código de saída 0.
5. O relatório de build não emite o aviso `(!) Some chunks are larger than 500 kB after minification`.
6. O arquivo `dist/assets/index-*.js` possui tamanho minificado < 500 kB.
7. Todos os 165 arquivos de teste e 1040 casos automatizados permanecem 100% verdes.
