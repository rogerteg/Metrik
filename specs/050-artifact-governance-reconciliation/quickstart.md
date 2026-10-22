# Quickstart Validation Guide: Reconciliação Documental de Artefatos

**Feature**: `050-artifact-governance-reconciliation`  
**Date**: 2026-10-21  
**Status**: Ready for Validation  

---

## 1. Pré-requisitos de Execução

- Ambiente Windows com **PowerShell 7+** (`pwsh`).
- Node.js 18+ e dependências instaladas (`npm install`).
- Linha principal `main` ativa no repositório local.
- Git 2.30+ configurado.

---

## 2. Cenários de Validação Rápida Ponta a Ponta

### Cenário 1: Validação do Status das Especificações Entregues (OPP-010 / SC-001)

Executar o comando PowerShell para auditar o status das especificações entregues (`specs/001` a `specs/042` e `specs/044` a `specs/047`):

```powershell
Get-ChildItem -Path specs -Recurse -Filter "spec.md" | 
  Where-Object { 
    $num = [int]($_.Directory.Name.Substring(0, 3)); 
    ($num -ge 1 -and $num -le 42) -or ($num -ge 44 -and $num -le 47) 
  } | 
  ForEach-Object { 
    $line = (Get-Content $_.FullName | Select-String -Pattern "^\*\*Status\*\*:\s*Implemented & Verified"); 
    if (-not $line) { [PSCustomObject]@{ Feature = $_.Directory.Name; Issue = "DIVERGENTE OU AUSENTE" } } 
  }
```

**Resultado Esperado**:
- Zero objetos retornados (100% das especificações entregues possuem `**Status**: Implemented & Verified (...)`).

---

### Cenário 2: Validação da Eliminação dos Marcadores da Spec 023 (OPP-011 / SC-002)

Verificar se não resta nenhum marcador `[NEEDS CLARIFICATION]` em `specs/023-team-access-control/spec.md`:

```powershell
$markers = Select-String -Path "specs/023-team-access-control/spec.md" -Pattern "\[NEEDS CLARIFICATION"
Write-Host "Marcadores encontrados: $($markers.Count)"
```

**Resultado Esperado**:
- `Marcadores encontrados: 0`.

---

### Cenário 3: Validação das Tarefas Históricas em `specs/005` a `specs/009` (OPP-012 / SC-003)

Inspecionar se não há checkboxes não marcados (`- [ ]`) nos 5 arquivos de tarefas legados:

```powershell
5..9 | ForEach-Object {
  $dir = Get-ChildItem -Path specs -Directory -Filter ("{0:D3}-*" -f $_)
  $tasksFile = Join-Path $dir.FullName "tasks.md"
  $pending = (Get-Content $tasksFile | Select-String -Pattern "^\s*-\s*\[\s*\]").Count
  [PSCustomObject]@{ Feature = $dir.Name; PendingTasks = $pending }
}
```

**Resultado Esperado**:
- `PendingTasks` igual a `0` para todas as 5 features (`005`, `006`, `007`, `008`, `009`).

---

### Cenário 4: Validação da Higienização das Ramificações Mescladas (OPP-013 / SC-005)

Comprovar que as 14 ramificações locais antigas foram removidas:

```powershell
$merged = git branch --merged main | ForEach-Object { $_.Trim().TrimStart('*').Trim() } | Where-Object { $_ -ne "main" }
Write-Host "Ramificações locais mescladas restantes: $($merged.Count)"
```

**Resultado Esperado**:
- `Ramificações locais mescladas restantes: 0`.

---

### Cenário 5: Execução da Trava de Teste Automatizada (FR-009 / SC-006)

Executar a nova trava unitária de governança documental via Vitest:

```powershell
npx vitest run tests/unit/documentaryGovernance.test.ts
```

**Resultado Esperado**:
- Todos os testes da suíte passam com sucesso (verde), atestando a conformidade dos contratos de governança.

---

### Cenário 6: Verificação de Estabilidade Global da Suíte

Assegurar que os 744 casos de teste pré-existentes permanecem 100% verdes:

```powershell
npm test
```

**Resultado Esperado**:
- Zero falhas, zero regressões (Constituição Artigo III).
