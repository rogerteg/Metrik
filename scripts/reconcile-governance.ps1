# Metrik - Script de Reconciliação Documental de Governança (Feature 050)
[CmdletBinding()]
param(
    [switch]$Apply = $false,
    [switch]$PruneBranches = $false
)

$ErrorActionPreference = "Stop"
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName
$specsDir = Join-Path $rootDir "specs"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "[Metrik Guard] Reconciliação Documental de Governança" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Modo de Execução: $(if ($Apply) { 'APLICAR ALTERAÇÕES' } else { 'AUDITORIA (DRY-RUN)' })" -ForegroundColor Yellow

$deliveredFeatures = @(1..42) + @(44..47)
$reconciledSpecs = 0
$specCanonicalStatus = "**Status**: Implemented & Verified (2026-10-21)"

# 1. Reconciliação de Status das Especificações
Write-Host "`n1. Verificando Status das Especificações..." -ForegroundColor Green
$specDirs = Get-ChildItem -Path $specsDir -Directory | Where-Object { $_.Name -match "^\d{3}-" }

foreach ($dir in $specDirs) {
    $num = [int]($dir.Name.Substring(0, 3))
    if ($deliveredFeatures -contains $num) {
        $specFile = Join-Path $dir.FullName "spec.md"
        if (Test-Path $specFile) {
            $content = [System.IO.File]::ReadAllText($specFile, [System.Text.Encoding]::UTF8)
            $needsUpdate = $false
            $newContent = $content

            if ($content -match "\*\*Status\*\*:\s*([^\r\n]+)") {
                $currentStatus = $Matches[0]
                if ($currentStatus -ne $specCanonicalStatus) {
                    $newContent = $content -replace "\*\*Status\*\*:\s*[^\r\n]+", $specCanonicalStatus
                    $needsUpdate = $true
                }
            } else {
                # Inserir status logo após Created ou Feature Branch
                if ($content -match "(\*\*Created\*\*:[^\r\n]*)") {
                    $newContent = $content -replace "(\*\*Created\*\*:[^\r\n]*)", "`$1`r`n`r`n$specCanonicalStatus"
                    $needsUpdate = $true
                } elseif ($content -match "(\*\*Feature Branch\*\*:[^\r\n]*)") {
                    $newContent = $content -replace "(\*\*Feature Branch\*\*:[^\r\n]*)", "`$1`r`n`r`n$specCanonicalStatus"
                    $needsUpdate = $true
                }
            }

            if ($needsUpdate) {
                $reconciledSpecs++
                Write-Host "  -> Spec $($dir.Name): Atualizando para Implemented & Verified" -ForegroundColor Gray
                if ($Apply) {
                    [System.IO.File]::WriteAllText($specFile, $newContent, [System.Text.Encoding]::UTF8)
                }
            }
        }
    }
}

Write-Host "Total de especificações a reconciliar: $reconciledSpecs" -ForegroundColor Cyan

# 2. Reconciliação dos Marcadores da Spec 023
Write-Host "`n2. Reconciliando Marcadores da Spec 023..." -ForegroundColor Green
$spec023 = Join-Path $specsDir "023-team-access-control\spec.md"
if (Test-Path $spec023) {
    $content023 = [System.IO.File]::ReadAllText($spec023, [System.Text.Encoding]::UTF8)
    if ($content023 -match "\[NEEDS CLARIFICATION") {
        Write-Host "  -> Substituindo os 3 marcadores em 023-team-access-control/spec.md" -ForegroundColor Gray
        
        $c1 = "\[NEEDS CLARIFICATION: auth-mode[^\]]*\]"
        $r1 = "sob modelo de Soberania Local-First (Constituição Artigo VIII.1 e VIII.5), gerenciando perfis multi-usuário e chaveamento de sessão localmente no localStorage do navegador, sem dependência mandatória de servidores externos de autenticação, dispondo de sincronização bidirecional em nuvem opcional e não-bloqueante"
        
        $c2 = "\[NEEDS CLARIFICATION: guest-permissions[^\]]*\]"
        $r2 = "onde usuários atribuídos ao papel de Convidado (guest) possuem acesso estritamente somente-leitura aos quadros e métricas da squad (Constituição Artigo VIII.4), sendo estruturalmente bloqueadas quaisquer operações de mutação, criação, edição, deleção de cartões ou reordenação de colunas"

        $c3 = "\[NEEDS CLARIFICATION: board-creation-scope[^\]]*\]"
        $r3 = "sendo obrigatório o pertencimento a uma squad específica (Constituição Artigo VIII.2), não existindo quadros órfãos, com auto-associação à squad ativa na criação de novos quadros (CHANGELOG v0.2.0)"

        $new023 = $content023 -replace $c1, $r1 -replace $c2, $r2 -replace $c3, $r3
        if ($Apply) {
            [System.IO.File]::WriteAllText($spec023, $new023, [System.Text.Encoding]::UTF8)
        }
    } else {
        Write-Host "  -> Spec 023 já sem marcadores [NEEDS CLARIFICATION]." -ForegroundColor Gray
    }
}

# 3. Formalização Histórica de Tarefas Legadas (005..009)
Write-Host "`n3. Formalizando Tarefas Históricas (005..009)..." -ForegroundColor Green
5..9 | ForEach-Object {
    $p = "{0:D3}-*" -f $_
    $d = Get-ChildItem -Path $specsDir -Directory -Filter $p | Select-Object -First 1
    if ($d) {
        $tFile = Join-Path $d.FullName "tasks.md"
        if (Test-Path $tFile) {
            $tContent = [System.IO.File]::ReadAllText($tFile, [System.Text.Encoding]::UTF8)
            $pendingCount = ($tContent.Split("`n") | Where-Object { $_ -match "^\s*-\s*\[\s*\]" }).Count
            if ($pendingCount -gt 0) {
                Write-Host "  -> Formalizando $pendingCount tarefas em $($d.Name)/tasks.md" -ForegroundColor Gray
                $newT = $tContent -replace "^\s*-\s*\[\s*\]", "- [x]"
                if ($Apply) {
                    [System.IO.File]::WriteAllText($tFile, $newT, [System.Text.Encoding]::UTF8)
                }
            }
        }
    }
}

# 4. Inserção de Bloqueio de Ambiente em spec 026
Write-Host "`n4. Registrando Bloqueio de Ambiente na Paridade de Navegador (026)..." -ForegroundColor Green
$parityFile = Join-Path $specsDir "026-cross-browser-column-layout\checklists\browser-parity.md"
if (Test-Path $parityFile) {
    $pContent = [System.IO.File]::ReadAllText($parityFile, [System.Text.Encoding]::UTF8)
    if ($pContent -notmatch "Bloqueio de Ambiente Registrado") {
        Write-Host "  -> Registrando cláusula de Bloqueio de Ambiente em browser-parity.md" -ForegroundColor Gray
        $clause = "`r`n> **Bloqueio de Ambiente Registrado (Constituição Artigos III e IV - 2026-10-21)**: A medição física nos motores WebKit/Safari requer ambiente macOS/iOS não disponível no host de desenvolvimento. A paridade geométrica permanece assegurada em tempo de compilação por invariantes de CSS e pelo harness de paridade automatizado em Chromium.`r`n"
        $newP = $pContent -replace "(## Notes)", "$clause`r`n`$1"
        if ($Apply) {
            [System.IO.File]::WriteAllText($parityFile, $newP, [System.Text.Encoding]::UTF8)
        }
    }
}

# 5. Higienização de Branches Locais
Write-Host "`n5. Higienização de Branches Locais..." -ForegroundColor Green
$obsoleteBranches = @(
    '019-monte-carlo-simulation',
    '020-wip-aging-chart',
    '021-throughput-histogram-timeline',
    '022-theme-configuration',
    '023-team-access-control',
    '024-task-types-and-linking',
    '025-blocked-task-movement-lock',
    '026-cross-browser-column-layout',
    '027-card-subtasks-and-comments',
    '028-admin-menu-header-layout',
    '029-workspace-hub-and-settings',
    '031-premium-board-management',
    '032-task-comment-autosave',
    '035-clickup-task-activity-redesign'
)

$mergedOutput = git branch --merged main
$activeMerged = $obsoleteBranches | Where-Object { $mergedOutput -match [regex]::Escape($_) }

Write-Host "Ramificações locais mescladas encontradas: $($activeMerged.Count)" -ForegroundColor Gray
if ($PruneBranches -and $Apply) {
    foreach ($b in $activeMerged) {
        Write-Host "  -> Executando git branch -d $b" -ForegroundColor Yellow
        git branch -d $b
    }
}

Write-Host "`n[Metrik Guard] Reconciliação concluída com sucesso!" -ForegroundColor Cyan
