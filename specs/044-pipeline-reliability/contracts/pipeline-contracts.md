# Pipeline Verification Contracts: Metrik CI & Quality Gates

**Feature**: `044-pipeline-reliability`  
**Date**: 2026-10-15  
**Spec**: [spec.md](../spec.md)

---

## 1. Contratos de Execução de Comandos (Exit Codes & Sinais)

| Comando | Código de Saída Esperado | Critério de Sucesso | Critério de Falha |
|---|---|---|---|
| `npm run test` | `0` | 100% dos testes aprovados (zero falhas, zero erros). | `> 0` se qualquer caso falhar ou timeout ocorrer. |
| `npm run test:coverage` | `0` | Todos os testes aprovados E limiares mínimos atingidos (`statements ≥ 84%`, `lines ≥ 84%`, `branches ≥ 77%`, `functions ≥ 58%`). | `> 0` se qualquer teste falhar ou percentual ficar abaixo dos limiares. |
| `npm run lint` | `0` | Zero erros impeditivos E contagem de avisos ≤ 40. | `> 0` se qualquer erro for detectado. |
| `npm run build` | `0` | Compilação TypeScript (`tsc`) e bundle Vite concluídos com sucesso. | `> 0` se houver erro de tipagem ou falha de importação. |
| `npm run format:check` | `0` | Todos os arquivos formatados segundo o Prettier. | `> 0` se houver divergência de estilo. |

---

## 2. Contrato de Presença Física de Evidências (Gate Comprobatório)

Conforme o **Princípio Constitucional III.4 ("Gates Must Prove Themselves")**, após a execução de `npm run test:coverage`, os seguintes arquivos DEVEM existir com tamanho maior que zero:

```text
coverage/
├── index.html          # Deve existir e conter a tabela HTML de cobertura
├── lcov.info           # Deve existir e conter registros TN: / SF: / DA: / BRDA:
└── coverage-final.json # Deve existir e conter os mapas de branches e statements
```
