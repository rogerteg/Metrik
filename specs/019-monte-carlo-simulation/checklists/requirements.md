# Requirements Checklist: Feature 019 - Simulações de Monte Carlo no Gerenciamento de Projetos

## Requisitos de Especificação (Spec Quality Gates)

- [x] O documento possui título e cabeçalho claros de rastreabilidade (Feature Branch, Created, Status).
- [x] As User Stories seguem o formato padrão (Como..., Quero..., Para que...) com prioridade (P1/P2) e justificativa.
- [x] Cada User Story possui um teste independente observável e mensurável.
- [x] O escopo aborda as duas perguntas clássicas da literatura Lean/Agile: "How Many" (Quantos itens?) e "When" (Quando?).
- [x] As regras de negócio e limites de amostra (FR-001 a FR-009) estão definidos com precisão matemática (amostragem com reposição, dias zerados preservados, percentis 50%, 85% e 95%).
- [x] Os critérios de performance e acessibilidade (NFR-001 e NFR-002) estão formalizados.
- [x] **Conformidade Constitucional v1.2.0**:
  - [x] Princípio I: Core Kanban First & Minimalista.
  - [x] Princípio II: TypeScript Estrito e Zero `any`.
  - [x] Princípio III: Estado Centralizado Previsível.
  - [x] Princípio IV: Testes Automatizados Rigorosos.
  - [x] Princípio V: Simplicidade & YAGNI (Zero bibliotecas terceiras de gráficos; SVG nativo).
  - [x] Princípio VI: Foco em Eficiência e Previsibilidade de Fluxo.
  - [x] Princípio VII: Independência Estrita de Marca (Zero referências a produtos de terceiros).

## Validações de Fluxo e UI

- [ ] Definição do design das telas e painel de controle (How Many vs. When).
- [ ] Implementação de gerador pseudoaleatório determinístico com semente opcional para Vitest.
- [ ] Visualização gráfica de Histograma de Frequência em SVG com linhas de percentil.
- [ ] Tratamento de casos de borda (amostra com zero entregas, poucas datas históricas, backlog vazio).
