# Tarefas de Implementação — Feature 060: Otimização de Peso de Entrada e Particionamento de Bundle

---

## 🧠 Modelos de Raciocínio Analítico Pré-Tarefas (Constituição VI — MANDATÓRIO)

### 1. Decomposição por Primeiros Princípios (*First-Principles Thinking*)
- **Invariante de Carregamento Web**: O tempo até a interatividade (*Time to Interactive - TTI*) é dominado pelo tempo de download e parse/compilação do JavaScript do chunk principal. Um arquivo de 634 kB bloqueia o processamento em conexões móveis e dispositivos restritos.
- **Decomposição Irredutível**: Recursos que só são necessários sob demanda (modais de configuração de regras, relatórios, assistente Mika, gerenciador de squads) não devem residir no grafo de execução síncrono da tela inicial do quadro Kanban.
- **Menor Verdade**: Reduzir a carga inicial a < 250 kB de JS e ativos estáticos a < 30 kB garante resposta em milissegundos sem alterar uma única linha de regra de negócio.

### 2. Análise Pré-Mortem & Pensamento Invertido (*Inversion & Premortem Analysis*)
- *Hipótese de Falha 1 (Dependências Circulares entre Chunks)*: Ao dividir `manualChunks`, dependências cruzadas entre `feature-flow-rules` e `feature-workspace-management` podem gerar chunks circulares ou referências indefinidas em tempo de execução.
  - *Mitigação*: Agrupamento centrado em folhas de domínio (`src/components/FlowRules/`, `src/components/Mika/`, etc.), preservando os utilitários puros no grafo comum. Verificação comprovada via execução completa do `npm run build` e suíte de testes.
- *Hipótese de Falha 2 (Distorção ou Perda de Qualidade Visual do Logo)*: Reduzir a imagem pode torná-la borrada em telas de alta densidade (Retina/4K).
  - *Mitigação*: A resolução de 160x160 provê 5x a densidade do tamanho renderizado (32x32 no cabeçalho), e o favicon primário é vetorial SVG com nitidez infinita.

### 3. Validação MECE (*Mutually Exclusive, Collectively Exhaustive*)
- **Mutuamente Exclusivas**:
  - A otimização de imagens (`public/`, `src/assets/`, `index.html`) atua exclusivamente na camada de ativos.
  - O particionamento Rollup (`vite.config.ts`) atua exclusivamente na camada de empacotamento JS/CSS.
- **Coletivamente Exaustivas**:
  - Ambas as ações eliminam 100% dos avisos de build e satisfazem todos os critérios de aceitação da `spec.md`.

### 4. Árvore de Decisão & Poda de Alternativas (*Tree of Thoughts & Trade-off Pruning*)
- *Alternativa A*: Aumentar artificialmente o limite de aviso do Vite (`chunkSizeWarningLimit: 1000`).
  - *Poda*: Descartada liminarmente. Viola o Princípio III (Gates Must Prove Themselves) e esconde o problema em vez de resolvê-lo.
- *Alternativa B*: Converter todos os componentes para `React.lazy` dinâmico em tempo de execução.
  - *Poda*: Descartada por adicionar complexidade excessiva de `Suspense` em dezenas de pontos com risco de piscar a UI.
- *Caminho Escolhido (Alternativa C)*: `manualChunks` declarativo por limites de domínio no Rollup somado a ativos reamostrados para alta densidade e favicon SVG.

### 5. Critério de Falsificabilidade & Testabilidade (*TDD / Red-Bar First*)
- *Red Bar*: `npm run build` emitia `(!) Some chunks are larger than 500 kB after minification`, `dist/assets/index-*.js` possuía 634,72 kB e `public/metrik-logo.png` pesava 982 kB.
- *Green Bar*: `npm run build` compila sem nenhum aviso, `dist/assets/index-*.js` pesa 237,9 kB (< 500 kB) e `dist/assets/metrik-logo-*.png` pesa 20,96 kB (< 30 kB).

### 6. Triangulação Adversarial & Verificação da Constituição (*Polygraph Verification*)
- A otimização respeita integralmente a Constituição II (Qualidade de Código), III (Verificação Automatizada) e VIII (Local-First), garantindo leveza absoluta e autonomia na inicialização.

---

## 📋 Lista de Tarefas (MECE & Ordenada por Dependência)

- [x] T001: Criar favicon vetorial `public/favicon.svg` escalável com design semântico do Metrik.
- [x] T002: Otimizar `src/assets/metrik-logo.png` e `public/metrik-logo.png` para 160x160 com filtro Lanczos (< 30 kB).
- [x] T003: Atualizar `index.html` para carregar o favicon SVG nativo prioritário com fallback para PNG.
- [x] T004: Configurar particionamento modular por domínio no `manualChunks` de `vite.config.ts`.
- [x] T005: Executar `npm run build` e validar eliminação total do aviso de chunks > 500 kB e tamanho do logo < 30 kB.
- [x] T006: Executar a suíte de testes completa para garantir integridade funcional inalterada.
