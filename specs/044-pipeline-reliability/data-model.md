# Data Model: Estruturas de Dados e Fixtures Temporais de Teste

**Feature**: `044-pipeline-reliability`  
**Date**: 2026-10-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Visão Geral

Esta funcionalidade opera sobre a camada de qualidade e infraestrutura de testes. Não altera os modelos relacionais do banco em produção (PostgreSQL/Supabase) nem a tipagem base de cartões do Kanban (`TaskModel`). Ela formaliza a estrutura temporal das massas de dados de teste (fixtures) utilizadas pelas suítes determinísticas.

---

## 2. Estrutura das Fixtures de Tarefas em Teste (`mockTasks`)

```typescript
export interface MockTaskFixture {
  id: string;
  title: string;
  column: string;
  createdAt: string;       // ISO 8601 UTC
  startedAt?: string;      // ISO 8601 UTC
  completedAt?: string;    // ISO 8601 UTC (crítico para filtros de tempo de ciclo e throughput)
  blocked?: boolean;
  blockedReason?: string;
  totalBlockedMs?: number;
}
```

### Invariantes Temporais das Fixtures:
- **Janela de Referência Fixa**: Data congelada em `2026-09-15T12:00:00.000Z`.
- **Intervalo de Conclusão**: `completedAt` entre `2026-09-01` e `2026-09-10`.
- **Validação de Intervalo Móvel**:
  - Janela de 14 dias: Abrange datas de `2026-09-01` a `2026-09-15`. (Todas as tarefas incluídas).
  - Janela de 30 dias: Abrange datas de `2026-08-16` a `2026-09-15`. (Todas as tarefas incluídas).
  - Janela de 60 dias: Abrange datas de `2026-07-17` a `2026-09-15`. (Todas as tarefas incluídas).

---

## 3. Estrutura dos Artefatos de Cobertura de Código

Os artefatos gerados pelo provedor V8 sob o diretório `coverage/` seguem o seguinte esquema de persistência:

| Caminho do Arquivo | Formato | Finalidade |
|---|---|---|
| `coverage/index.html` | HTML / CSS / JS | Relatório de navegação visual estática para desenvolvedores. |
| `coverage/lcov.info` | Texto LCOV | Arquivo padrão de ingestão para SonarQube, Codecov ou GitHub Actions. |
| `coverage/coverage-final.json` | JSON V8 | Estrutura bruta de nós e blocos auditados. |

---

## 4. Regras de Transição e Ciclo de Vida do Timer em Teste

```text
[Suite Start: describe()]
        │
        ▼
[beforeEach()] ──► vi.useFakeTimers({ toFake: ['Date'] })
                   vi.setSystemTime(new Date('2026-09-15T12:00:00.000Z'))
        │
        ▼
[Execução do Caso de Teste: it()] (Componente renderiza avaliando new Date() congelado)
        │
        ▼
[afterEach()]  ──► vi.useRealTimers() (Restaura o relógio real para isolamento estrito)
        │
        ▼
[Suite End]
```
