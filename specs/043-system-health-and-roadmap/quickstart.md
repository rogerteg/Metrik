# Phase 1 — Quickstart: Validação da feature 043

**Feature**: `043-system-health-and-roadmap` | **Date**: 2026-10-07
**Plan**: [plan.md](./plan.md) · **Research**: [research.md](./research.md) · **Data model**: [data-model.md](./data-model.md) · **Contratos**: [contracts/](./contracts/)

Guia de **validação**, não de implementação. Cada cenário declara o estado que **reprova** (red-bar) e o que o aprova, para que a verificação seja falsificável — conforme o modelo 5 (Falsificabilidade / Red-Bar First) do Princípio VI.

Nenhum cenário cria artefato executável: todos usam ferramental já existente (Git, npm, leitura de Markdown). Criar script violaria FR-017.

---

## Pré-requisitos

| Item | Requisito |
|---|---|
| Repositório | Clone do projeto, com histórico completo (os cenários comparam contra um ponto base) |
| Node.js | Versão compatível com `package.json`; dependências instaladas (`npm ci` ou `npm install`) |
| Git | Qualquer versão com `git diff --name-only` |
| Shell | PowerShell 7+ **ou** Bash. Todo comando abaixo usa apenas Git e npm, portanto é idêntico nos dois |
| Base de comparação | O commit imediatamente anterior ao início da feature 043 |

**Ponto base** para os cenários de escopo e de regressão — commit da linha principal imediatamente anterior ao início da feature:

```bash
BASE=369043364b985f3ab0ed09f5fab46c038935669f   # 2026-09-30 — feat(026): fit-columns-to-window and reset-widths controls
```

---

## VS-01 — Fronteira de artefatos (SC-012, FR-017)

**Prova**: esta feature não toca código, testes, documentação de entrada nem outros diretórios de artefato.

Os artefatos desta feature ainda **não estão integrados** na linha principal, portanto a comparação é feita **contra a árvore de trabalho**, e não entre commits. Duas verificações complementares — a primeira cobre arquivos rastreados modificados, a segunda cobre arquivos novos:

```bash
git diff --name-only HEAD | grep -v '^specs/043-system-health-and-roadmap/'
git ls-files --others --exclude-standard | grep -v '^specs/043-system-health-and-roadmap/'
```

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Qualquer linha em qualquer uma das duas saídas — indica alteração fora do diretório da feature |
| 🟢 Aprova | Ambas as saídas vazias |

> **Cuidado de ambiente:** `git status` pode exibir entradas ` M` residuais para arquivos cujo conteúdo é idêntico ao da linha principal — o repositório está sob OneDrive e os arquivos carregam atributo de ponto de reanálise, o que impede a atualização da cache de estatísticas do Git. Por isso a verificação usa `git diff` (que compara conteúdo) e **não** `git status`. Confirmar com `git diff --quiet HEAD -- <arquivo>`; se o comando sair com código 0, o arquivo está limpo e a entrada ` M` é ruído de cache, não alteração.

**Reprova antes**: enquanto os artefatos existirem apenas no diretório da feature, já aprova; se qualquer correção de `README.md`, teste ou código for arrastada para dentro desta feature, passa a reprovar.

---

## VS-02 — Ausência de regressão da suíte (definição de pronto desta feature)

**Prova**: a identidade e a contagem das falhas pré-existentes permanecem inalteradas, o que é evidência de que nenhum código mudou.

```bash
npx vitest run --reporter=basic
```

| Medida | Linha de base de 2026-10-07 | Aprova se |
|---|---|---|
| Arquivos de teste falhando | 2 | = 2 |
| Testes falhando | 5 | = 5 |
| Identidade dos casos | `CycleTimeScatterPlot` (2 casos) e `MonteCarloSimulationView` (3 casos) | Mesmos nomes |

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Contagem maior, ou nome de caso diferente — indica regressão |
| 🟢 Aprova | Contagem e identidade iguais às da linha de base |

> ⚠️ **Não** marque verde reduzindo a contagem. A restauração do verde pertence à feature `044`; reduzi-la aqui só é possível alterando testes, o que FR-017 proíbe.
> Contagem **menor** é sinal de suspeita: investigue antes de aceitar.

---

## VS-03 — Medidas de cobertura com a data de referência (CHK033)

**Prova**: a inconsistência de data das medições de cobertura foi eliminada, e não apenas documentada.

```bash
npm run test:coverage
```

Depois, conferir que os três indicadores em `vision.md` §3.4 carregam a data de referência no cabeçalho e que nenhum deles mantém data de origem anterior.

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Indicador com `data_medicao` anterior a uma alteração de sentinela que o invalida |
| 🟢 Aprova | Todos os indicadores com data igual ou posterior à última alteração de suas sentinelas |

---

## VS-04 — Invariantes do manifesto de sentinela (SC-013, FR-022)

**Prova**: o manifesto respeita `C1` a `C5` de [contracts/sentinel-manifest.md](./contracts/sentinel-manifest.md).

| Invariante | Reprova quando |
|---|---|
| C1 — 3 colunas | O cabeçalho em `vision.md` §3.6 diverge dos termos contratados |
| C2 — caminhos relativos entre crases | Existe caminho absoluto, usa `\` ou contém `:` |
| C3 — indicadores citados existem | A 3ª coluna cita indicador ausente em `vision.md` §7 |
| C4 — **todo indicador é invalidado** | Existe indicador em §7 que nenhuma linha invalida |
| C5 — caminhos únicos | Um caminho aparece duas vezes |

**C4 é o que importa**: um indicador que nenhuma sentinela invalida está, na prática, declarado imune ao tempo.

---

## VS-05 — Completude das oportunidades (SC-007, FR-005)

**Prova**: toda oportunidade tem evidência verificável e critério de encerramento aferível.

Verificar, para cada `OPP-NNN` em `vision.md` §4.1 e §4.2: `evidencia`, `prioridade`, `criterio_encerramento` presentes, e nenhum critério redigido como "melhorar X".

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Oportunidade sem evidência, sem critério, ou com critério não aferível |
| 🟢 Aprova | Zero oportunidades sem evidência e sem critério (SC-007 exige 0) |

---

## VS-06 — Designação de feature corretiva para P1 (SC-011, FR-018)

**Prova**: nenhuma oportunidade de prioridade mais alta ficou sem responsável.

Conferir que cada oportunidade marcada `P1` aparece em `vision.md` §4.4 com um identificador de feature corretiva.

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Qualquer `P1` sem identificador de feature corretiva |
| 🟢 Aprova | 100% dos `P1` designados (SC-011 exige 0 sem designação) |

---

## VS-07 — Protocolo de verificação documental declarado (SC-006, FR-019)

**Prova**: a visão declara o protocolo nas **duas** partes exigidas — e não apenas uma.

Conferir em `vision.md` §5 (Fase 0, ação 0.2) e §7 (linha *Documentos que descrevem tecnologia inexistente*) a presença de: (a) verificação automatizada de consistência e (b) walkthrough registrado conforme [contracts/evidence-record.md](./contracts/evidence-record.md).

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Apenas uma parte declarada, ou protocolo ausente |
| 🟢 Aprova | Ambas as partes declaradas, com a parte (b) referenciando o contrato de evidência |

> Este cenário verifica a **declaração**. A execução da parte (a) pertence à feature `045` — esta feature não a executa, e não pode marcá-la como cumprida.

---

## VS-08 — Integridade documental

**Prova**: os artefatos são navegáveis e as tabelas são válidas, o que sustenta FR-001 (legibilidade sem acesso ao código).

| Verificação | Reprova quando |
|---|---|
| Links relativos entre artefatos | Um link aponta para caminho inexistente |
| Tabelas Markdown | Uma linha tem número de colunas diferente do cabeçalho |
| Identificadores de oportunidade | Duplicado, ou não segue `OPP-NNN` (ver [data-model.md](./data-model.md) §7) |
| Sequência dos checklists | `CHK###` com lacuna, duplicata ou fora da ordem |

---

## VS-09 — Independência de marca (SC-003, FR-011)

**Prova**: nenhum artefato desta feature expõe marca de terceiros como identidade do produto (Constituição, Princípio VII).

Percorrer `spec.md`, `vision.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md` e `contracts/` verificando que a única ocorrência de nome de marca de terceiros é a **citação do nome do diretório de artefato existente** em OPP-009 — que é necessariamente citada para poder ser corrigida.

| Estado | Resultado |
|---|---|
| 🔴 Reprova | Marca de terceiros usada como identidade, inspiração declarada ou termo de domínio |
| 🟢 Aprova | Única ocorrência é a citação factual do diretório a renomear |

---

## VS-10 — Invariantes de item de checklist (contrato)

**Prova**: os checklists respeitam `C2`, `C5` e `C6` de [contracts/checklist-item.md](./contracts/checklist-item.md).

| Invariante | Reprova quando |
|---|---|
| C2 — sequência sem lacunas | `CHK###` fora de ordem ou com lacuna |
| C5 — sem teste de implementação | Item começando por `Verify`/`Test`/`Confirm`/`Check`/`Ensure`/`Validate` seguido de comportamento |
| C6 — itens gerados desmarcados | Item criado pelo gerador já marcado `[x]` |

> `checklists/requirements.md` é mantido por `/speckit-specify` e `/speckit-clarify`; `checklists/planning-readiness.md` pertence ao revisor. Os dois convivem, com ciclos distintos.

---

## Resumo

| Cenário | Requisito | Natureza | Executável por máquina |
|---|---|---|---|
| VS-01 | SC-012, FR-017 | Objetivo | ✅ |
| VS-02 | Definição de pronto ("sem regressão") | Objetivo | ✅ |
| VS-03 | CHK033 | Objetivo | ✅ |
| VS-04 | SC-013, FR-022 | Estrutural | ✅ |
| VS-05 | SC-007, FR-005 | Estrutural | ✅ |
| VS-06 | SC-011, FR-018 | Estrutural | ✅ |
| VS-07 | SC-006, FR-019 | Declarativo | ⚠️ leitura |
| VS-08 | FR-001 | Estrutural | ✅ |
| VS-09 | SC-003, FR-011 | Declarativo | ⚠️ leitura |
| VS-10 | Contrato de checklist | Estrutural | ✅ |

Os cenários de leitura (VS-07, VS-09) verificam apenas a **existência e a forma** de uma declaração — não substituem a verificação executável exigida pelo Princípio III, e não devem ser usados como prova de que o produto se comporta como documentado. Essa prova pertence à feature corretiva designada.

---

## Registro de validação — execução de 2026-10-08

> Executado sobre a árvore de trabalho restaurada (conteúdo idêntico à linha principal para todos os arquivos rastreados). Nenhum resultado abaixo foi obtido por inspeção manual quando havia verificação executável disponível.

| Cenário | Resultado | Evidência registrada |
|---|---|---|
| VS-01 | ✅ **Aprovado** | `git diff --name-only HEAD` filtrado → vazio; `git ls-files --others --exclude-standard` filtrado → vazio. Nenhuma alteração fora de `specs/043-system-health-and-roadmap/**` (SC-012) |
| VS-02 | ✅ **Aprovado** | `npx vitest run --reporter=basic` → **2 arquivos / 5 testes falhando**, 696 passando de 701, em 28,53 s. Identidade: `CycleTimeScatterPlot` (2 casos) e `MonteCarloSimulationView` (3 casos) — **idênticas** à linha de base. Zero regressão |
| VS-03 | ❌ **Bloqueado — não aprovado** | `npm run test:coverage` anuncia a instrumentação e **não produz resumo nem arquivos**, em 5 execuções, inclusive com `reportsDirectory` externo ao repositório. Sem relatório, os três indicadores de cobertura **mantêm a data de 2026-09-28**, declarada com a causa. Ver OPP-018 |
| VS-04 | ✅ **Aprovado** | C1 (3 colunas exatas) ✓ · C2 (nenhum caminho absoluto ou com `\`) ✓ · C3 (15 indicadores citados, todos declarados em §7) ✓ · C4 (15 de 15 indicadores invalidados por ao menos uma sentinela) ✓ · C5 (11 caminhos, nenhum duplicado) ✓ |
| VS-05 | ✅ **Aprovado** | 18 oportunidades distintas (`OPP-001`..`OPP-018`, sem lacunas), todas com `evidencia` e `criterio_encerramento` preenchidos em §4.1/§4.2 |
| VS-06 | ✅ **Aprovado** | 4 oportunidades `P1` (`OPP-007`, `OPP-008`, `OPP-009`, `OPP-018`) e 4 features corretivas designadas em §4.4 (`044`, `045`, `046`, `047`) — 100% (SC-011) |
| VS-07 | ✅ **Aprovado** | Protocolo em duas partes declarado em §5 Fase 0 (ação 0.2) e na linha de indicador de §7: (a) verificação automatizada de consistência, (b) walkthrough registrado com qualificação do executor |
| VS-08 | ✅ **Aprovado** | Zero links relativos quebrados em todos os `.md` da feature; sequência `OPP-001`..`OPP-018` contígua; as divergências de contagem de colunas detectadas são pipes escapados (`\|`) em células — markdown válido |
| VS-09 | ✅ **Aprovado** | 1 única ocorrência de termo de marca em todos os artefatos da feature (`vision.md` §4.2), dentro do limite de "uma ocorrência por artefato" de SC-003 |
| VS-10 | ✅ **Aprovado** | `requirements.md`: 16 itens marcados, 0 abertos. `planning-readiness.md`: 36 itens abertos **por projeto** (propriedade do revisor), 0 marcados — conforme C6 |

### Duas correções exigidas por esta execução

A execução não foi decorativa: ela **reprovou** o próprio artefato em dois pontos, que foram corrigidos e reexecutados.

| # | Defeito detectado | Correção |
|---|---|---|
| 1 | **C3 e C4 violados** em `vision.md` — §3.6 citava `Cobertura de instruções` e `Cobertura de ramificações`, ausentes de §7, e `Marcadores de esclarecimento abertos em funcionalidade entregue`, grafado de forma diferente da linha correspondente em §7 (que por isso ficou sem sentinela) | Os dois indicadores de cobertura foram declarados em §7 com suas metas reais (≥84% e ≥77%, os limiares de `vite.config.ts`), e o nome do indicador de marcadores foi unificado na forma longa. Reexecução: C3 e C4 aprovados |
| 2 | **SC-003 violado** — a exceção de citação de marca é limitada a *uma ocorrência por artefato*, e `vision.md` continha duas (a oportunidade e a linha de indicador) | A linha de indicador passou a referir a ocorrência sem repetir o termo literal. Reexecução: 1 ocorrência |

> **VS-03 é a exceção declarada.** Os outros nove cenários foram verificados com prova executável. VS-03 depende de um resultado que o ambiente não produz, e por isso está registrado como **bloqueado**, nunca como aprovado — a mesma regra que §6 da visão aplica a bloqueios de ambiente.

> **Consequência sobre SC-013:** para os três indicadores de cobertura, SC-013 **não é atestável** enquanto OPP-018 existir — não há medida nova a datar. A lacuna está declarada na visão (§3.4, §7) e tem feature corretiva designada (`047`). Para todos os demais indicadores, a revalidação por evento é satisfeita, pois suas medidas foram refeitas após a última alteração de suas sentinelas.
