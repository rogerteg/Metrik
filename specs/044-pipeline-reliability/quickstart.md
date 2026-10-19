# Quickstart: Validação e Execução da Suíte de Confiabilidade

**Feature**: `044-pipeline-reliability`  
**Date**: 2026-10-15  
**Spec**: [spec.md](./spec.md)

---

## 1. Pré-requisitos

Certifique-se de estar na raiz do repositório Metrik com as dependências instaladas:
```powershell
node -v   # v20+ recomendado
npm -v    # v10+ recomendado
```

---

## 2. Cenários de Validação Rápida

### Cenário 1: Execução Isolada dos Testes Corrigidos
Valida que as duas suítes anteriormente falhas agora passam sem dependência de relógio:
```powershell
npm test tests/unit/CycleTimeScatterPlot.test.tsx tests/unit/MonteCarloSimulationView.test.tsx
```
**Resultado Esperado**:
- Todos os testes passam (100% verde).
- Zero testes em estado "Unable to find an element".

---

### Cenário 2: Validação Completa da Suíte de Testes
Executa todos os 113 arquivos de teste da aplicação:
```powershell
npm run test
```
**Resultado Esperado**:
- 113 arquivos aprovados.
- Mais de 700 casos de teste com status `passed`.
- Duração total < 45 segundos.

---

### Cenário 3: Validação do Gate de Cobertura e Comprovação de Arquivos
Gera os relatórios e certifica a presença dos artefatos:
```powershell
npm run test:coverage
```
**Verificação dos Artefatos**:
```powershell
Test-Path coverage/index.html
Test-Path coverage/lcov.info
```
Ambos os comandos devem retornar `True`.

---

### Cenário 4: Checagem de Build e Tipagem Estrita
Certifica que as alterações não introduziram regressões de tipos ou compilação:
```powershell
npm run build
npm run lint
```
**Resultado Esperado**:
- `npm run build` conclui com código de saída 0.
- `npm run lint` conclui com 0 erros (e no máximo 40 avisos controlados).
