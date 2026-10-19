# Research & Technical Decisions: Feature 047

**Feature**: `047-static-quality-governance` | **Cycle**: 4 (P2)  
**Spec**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md)

---

## 1. Mapeamento & Estratégia de Deduplicação de Seletores CSS (OPP-001)

### 1.1 Inventário dos 12 Seletores Conflitantes

A trava de regressão em `tests/unit/cssDuplicationGuard.test.ts` mapeia 12 seletores declarados em duplicidade. A varredura detalhada no código identificou suas localizações exatas:

| # | Seletor | Ocorrência 1 | Ocorrência 2 | Módulo Canônico de Destino | Decisão de Consolidação |
|:---:|:---|:---|:---|:---|:---|
| 1 | `.add-column-card` | `02-task-detail-inline.css:511` | `03-priority-tags-filters.css:469` | `03-priority-tags-filters.css` | Remover declaração espúria de `02-task-detail-inline.css` (módulo de tarefas). |
| 2 | `.add-column-icon` | `02-task-detail-inline.css:538` | `03-priority-tags-filters.css:510` | `03-priority-tags-filters.css` | Remover declaração espúria de `02-task-detail-inline.css`. |
| 3 | `.btn-add-column` | `02-task-detail-inline.css:518` | `03-priority-tags-filters.css:476` | `03-priority-tags-filters.css` | Unificar variantes `:hover` e `:disabled` em `03-priority-tags-filters.css` e remover de `02-task-detail-inline.css`. |
| 4 | `.badge-cycle-time` | `02-task-detail-inline.css:447` | `02-task-detail-inline.css:702` | `02-task-detail-inline.css` | Unificar as duas declarações internas no mesmo arquivo em um único bloco coeso. |
| 5 | `.badge-lead-time` | `02-task-detail-inline.css:441` | `02-task-detail-inline.css:696` | `02-task-detail-inline.css` | Unificar as duas declarações internas no mesmo arquivo. |
| 6 | `.badge-metric-time` | `02-task-detail-inline.css:433` | `02-task-detail-inline.css:686` | `02-task-detail-inline.css` | Unificar as duas declarações internas no mesmo arquivo. |
| 7 | `.metrik-comment-list` | `10-comments-containment.css:41` | `10-comments-containment.css:76` | `10-comments-containment.css` | Consolidar propriedades de containment e flex em uma única regra de topo no arquivo. |
| 8 | `.task-blocked-dependency-chip` | `02-task-detail-inline.css:420` | `08-task-types-links.css:103` | `08-task-types-links.css` | Módulo canônico de links e dependências é o `08`; remover bloco duplicado de `02`. |
| 9 | `.task-card-header` | `01-design-system-core.css:1051` | `03-priority-tags-filters.css:9` | `01-design-system-core.css` | Manter a estrutura básica no core (`01`) e restringir em `03` apenas modificadores específicos se necessário, evitando redeclaração idêntica. |
| 10 | `.task-indicator-badge` | `02-task-detail-inline.css:385` | `02-task-detail-inline.css:643` | `02-task-detail-inline.css` | Unificar declarações internas duplicadas de badges de indicadores de tarefa. |
| 11 | `.task-indicators` | `02-task-detail-inline.css:377` | `02-task-detail-inline.css:637` | `02-task-detail-inline.css` | Unificar declarações internas duplicadas de container de indicadores. |
| 12 | `.task-metrics-badges` | `02-task-detail-inline.css:426` | `02-task-detail-inline.css:679` | `02-task-detail-inline.css` | Unificar declarações internas duplicadas de métricas. |

---

## 2. Redistribuição e Descontinuação de `13-recovered.css` (OPP-016)

O arquivo `src/styles/13-recovered.css` agrega regras órfãs geradas em refatorações prévias. O plano ratificado na clarificação (Opção A) é redistribuir 100% de suas regras para seus módulos funcionais de domínio:

1. **Header e Ações Globais**:
   - `.header-cluster`, `.header-cluster-divider`, `.task-nav-buttons`, `.btn-settings-trigger` → `src/styles/01-design-system-core.css`.
2. **QA e Resumo de Tarefas**:
   - `.task-qa-section`, `.task-qa-summary`, `.task-qa-summary-item` (e estados `.has-content`) → `src/styles/02-task-detail-inline.css`.
3. **Workspace & Board Headers**:
   - `.board-workspace-tag`, `.edit-ws-name`, `.board-metrics-summary` → `src/styles/12-workspace.css`.
4. **Modais e Banners de Erro**:
   - `.modal-title-with-color`, `.modal-error-banner` → `src/styles/06-team-squad-modal.css`.
5. **Ajustes de Manifesto e Trava**:
   - Atualizar `src/App.css` removendo `@import './styles/13-recovered.css';`.
   - Atualizar `tests/unit/appCssStructure.test.ts` removendo `'./styles/13-recovered.css'` de `EXPECTED_ORDER`.
   - Excluir o arquivo `src/styles/13-recovered.css`.

---

## 3. Calibração dos Limiares de Cobertura em `vite.config.ts` (OPP-006 & OPP-018)

### 3.1 Medição Real de Cobertura (V8 Engine)

Medição executada em 2026-10-16 sobre a totalidade da suíte (701 testes unitários verdes):
- **Statements**: 86.34%
- **Lines**: 86.34%
- **Branches**: 79.75%
- **Functions**: 62.01%
- **Relatórios Gerados**: `coverage/index.html` e `coverage/lcov.info` presentes e atualizados.

### 3.2 Novos Limiares Blindados

| Dimensão | Limiar Anterior | Linha de Base Atual | Novo Limiar (`vite.config.ts`) | Margem de Segurança |
|:---|:---:|:---:|:---:|:---:|
| **Functions** | 58% | 62.01% | **60%** | +2.01% |
| **Statements** | 84% | 86.34% | **85%** | +1.34% |
| **Lines** | 84% | 86.34% | **85%** | +1.34% |
| **Branches** | 77% | 79.75% | **78%** | +1.75% |

---

## 4. Análise de Riscos e Não-Regressão

1. **Inversão de Cascata CSS**: A ordem de precedência nos módulos segue rigorosamente a hierarquia de importação do `App.css`. Regras migradas de `13-recovered.css` mantêm a mesma especificidade de classes para evitar alterações em layouts computados.
2. **Compatibilidade Multi-Tema**: As regras consolidadas mantêm uso estrito de tokens semânticos (`var(--bg-card)`, `var(--text-primary)`, `var(--border-subtle)`), garantindo conformidade nos 3 temas.
3. **Determinismo da Suíte**: Todos os 701 testes são mantidos e a trava `cssDuplicationGuard.test.ts` passa a garantir `duplicates.length === 0`.
