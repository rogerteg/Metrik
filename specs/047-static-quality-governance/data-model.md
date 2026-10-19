# Data Model & Architecture Entities: Feature 047

**Feature**: `047-static-quality-governance` | **Cycle**: 4 (P2)  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Research**: [research.md](./research.md)

---

## 1. Arquitetura de Módulos de Estilo (Manifest Cascade Model)

O sistema de estilos do Metrik opera sobre um manifesto ordenado em `src/App.css`, garantindo especificidade determinística sem frameworks invasivos:

```
src/App.css (Manifesto @import)
 ├── 01-design-system-core.css        (Tokens, variáveis de tema, reset, base layout, header global)
 ├── 02-task-detail-inline.css        (Cartões de tarefa, campos inline, indicadores, badges de tempo)
 ├── 03-priority-tags-filters.css     (Barra de filtros, tags, ações de coluna e cabeçalho de cartões)
 ├── 04-column-color-picker.css       (Seletores de cor de coluna e paletas personalizadas)
 ├── 05-profile-menu-session.css      (Menu de perfil de usuário, sessão e logout)
 ├── 06-team-squad-modal.css          (Modais de squads, membros, convites e títulos de modal)
 ├── 07-restricted-board-fallback.css (Fallbacks de permissão e boards restritos)
 ├── 08-task-types-links.css          (Tipos de tarefa, chips de dependência e links direcionados)
 ├── 09-task-links-cross-squad.css    (Vínculos cross-squad entre diferentes times)
 ├── 10-comments-containment.css      (Contenção e isolamento da árvore de comentários)
 ├── 11-sprint.css                    (Planejamento de sprints, burndown e métricas ágeis)
 └── 12-workspace.css                 (Configurações de workspace, tags de board e resumos de métricas)
```

*Nota: O módulo heterogêneo `13-recovered.css` é descontinuado e suas regras absorvidas nos módulos 01, 02, 06 e 12.*

---

## 2. Entidades de Governança Estática & Travas de Qualidade (Quality Guards)

### 2.1 Trava de Duplicação de CSS (`CssDuplicationGuard`)
- **Arquivo de Teste**: `tests/unit/cssDuplicationGuard.test.ts`
- **Mecanismo**: Leitura estática dos seletores de topo via regex `^([.#][^{}\n,]+?)\s*\{` em todos os módulos importados.
- **Invariante**:
  - `DUPLICATE_BASELINE = new Set([])` (Zero seletores duplicados permitidos).
  - Violação: Se qualquer seletor de topo aparecer mais de 1 vez na cascata combinada, o teste falha imediatamente.

### 2.2 Trava de Estrutura do Manifesto (`AppCssStructureGuard`)
- **Arquivo de Teste**: `tests/unit/appCssStructure.test.ts`
- **Mecanismo**: Validação da ordem sequencial dos `@import` e integridade física de cada arquivo importado.
- **Invariante**:
  - `EXPECTED_ORDER` contém exatamente os 12 módulos canônicos.
  - O arquivo `App.css` deve conter estritamente comentários e declarações `@import`, com zero blocos de regra CSS inline.

### 2.3 Trava de Cobertura de Testes (`CoverageThresholdGuard`)
- **Arquivo de Configuração**: `vite.config.ts` (`test.coverage.thresholds`)
- **Mecanismo**: Análise de cobertura pós-execução gerada pelo motor V8.
- **Entidade de Limiares**:
  ```ts
  thresholds: {
    statements: 85,
    lines: 85,
    branches: 78,
    functions: 60
  }
  ```
- **Invariante**:
  - Nenhuma alteração de código pode reduzir a cobertura abaixo desses limiares.
  - Artefatos obrigatórios gerados: `coverage/index.html` e `coverage/lcov.info`.

---

## 3. Matriz de Mapeamento de Seletores Consolidados

| Seletor | Módulo de Destino | Responsabilidade Semântica |
|:---|:---|:---|
| `.add-column-card`, `.add-column-icon`, `.btn-add-column` | `src/styles/03-priority-tags-filters.css` | Ação de adicionar nova coluna no quadro |
| `.badge-cycle-time`, `.badge-lead-time`, `.badge-metric-time` | `src/styles/02-task-detail-inline.css` | Badges de tempo de ciclo e lead time no cartão |
| `.task-indicator-badge`, `.task-indicators`, `.task-metrics-badges` | `src/styles/02-task-detail-inline.css` | Containers e indicadores de metadados de tarefa |
| `.task-blocked-dependency-chip` | `src/styles/08-task-types-links.css` | Chip indicador de dependência de tarefa bloqueada |
| `.task-card-header` | `src/styles/01-design-system-core.css` | Cabeçalho canônico do cartão de tarefa |
| `.metrik-comment-list` | `src/styles/10-comments-containment.css` | Lista com containment de comentários |
| `.header-cluster`, `.header-cluster-divider`, `.task-nav-buttons` | `src/styles/01-design-system-core.css` | Agrupamento de botões no topo da interface |
| `.board-workspace-tag`, `.edit-ws-name`, `.board-metrics-summary` | `src/styles/12-workspace.css` | Identificação e resumos de workspace e board |
| `.modal-title-with-color`, `.modal-error-banner` | `src/styles/06-team-squad-modal.css` | Elementos de modais e alertas |
