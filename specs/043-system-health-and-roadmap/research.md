# Phase 0 — Research: Saúde do Sistema, Oportunidades de Melhoria e Próximos Passos

**Feature**: `043-system-health-and-roadmap` | **Date**: 2026-10-07 | **Plan**: [plan.md](./plan.md)

Esta fase resolve as incógnitas do *Technical Context*. Não há `NEEDS CLARIFICATION` pendente: as cinco decisões de escopo foram resolvidas com o mantenedor na sessão de `/speckit-clarify` de 2026-10-07 e estão transcritas em [spec.md](./spec.md) §Clarifications. As decisões abaixo são de **desenho**, não de requisito.

---

## R1 — Provar que zero arquivos de código foram alterados (SC-012), sem criar script

**Decision**: A verificação usa apenas `git` e uma comparação de conjuntos. Comando único, idêntico em Windows (PowerShell) e Linux (CI):

```bash
git status --porcelain
git diff --name-only <base>...HEAD
```

O conjunto resultante deve ser **subconjunto** da fronteira declarada em FR-017: o diretório `specs/043-system-health-and-roadmap/` e nada além dele. Qualquer caminho fora disso reprova SC-012.

**Rationale**: `git` é ferramental já existente, é cross-platform e é a única fonte de verdade sobre o que mudou — não depende de o autor declarar intenção. Comparar conjuntos é uma operação objetiva, não uma inspeção manual, o que satisfaz a exigência do Princípio III de que inspeção manual não constitui verificação.

**Alternatives considered**:
- **Script de validação dedicado** (`scripts/check-artifact-scope.mjs`) — rejeitado: FR-017 fecha o conjunto de artefatos desta feature, e criar um script o violaria. Além disso o script passaria a ser mais um artefato a manter, contra o Princípio V.
- **Teste automatizado no diretório `tests/`** — rejeitado: FR-017 proíbe explicitamente alterar testes, e um teste que inspeciona o conjunto de arquivos alterados só é significativo fora do próprio commit (seria um teste não determinístico, dependente do estado do repositório).
- **Hook de pré-commit** — rejeitado: adiciona configuração de repositório, que FR-017 não autoriza.

---

## R2 — Forma do manifesto de sentinelas, para que a verificação da feature `045` possa parseá-lo

**Decision**: O manifesto vive em [vision.md](./vision.md) §3.6 como **tabela Markdown com 3 colunas de cabeçalho fixo** (`Arquivo-sentinela`, `Por que invalida`, `Indicadores que invalida`), uma linha por sentinela, e o caminho do arquivo **sempre em crase** e **relativo à raiz do repositório**, separado por `/`. Contrato formal em [contracts/sentinel-manifest.md](./contracts/sentinel-manifest.md).

**Rationale**: Uma tabela Markdown é legível por humano e parseável por máquina sem dependência nova. Fixar o cabeçalho e a forma do caminho agora é o que permite que a verificação executável da feature `045` (o teste de consistência exigido por FR-019a) seja escrita depois **sem renegociar o formato** — exatamente o modo de falha que a pré-mortem desta feature identificou como mais provável (R2 do *Analytical Reasoning* em `plan.md`).

**Alternatives considered**:
- **Arquivo de dados separado** (`sentinels.json` ou `.yml`) — rejeitado: cria um segundo artefato cuja existência FR-017 não autoriza, e separa a declaração do contexto que a explica, exigindo sincronização manual.
- **Lista em prosa** — rejeitada: não é parseável, e forçaria a feature `045` a introduzir um formato de qualquer modo, sem contrato acordado.
- **Globs em vez de caminhos** — rejeitados: um padrão como `specs/**` invalidaria indicadores cuja sentinela real não mudou, gerando rompimento falso e ruído.

---

## R3 — Onde vive a evidência de validação exigida por FR-019b

**Decision**: O **registro** da evidência (forma e campos obrigatórios) é contratado agora, em [contracts/evidence-record.md](./contracts/evidence-record.md). A **instância** da evidência é gravada no diretório da feature que executa a verificação não automatizável — hoje prevista como `specs/045-rewrite-project-readme/`. Esta feature não grava instância alguma.

**Rationale**: FR-017 restringe o conjunto de artefatos de `043` e não autoriza armazenar evidência alheia. Como a obrigação de verificar documentação pertence à feature `045` (FR-018/FR-019), a evidência deve viver junto da obrigação que a satisfaz — assim ela é encontrada por quem audita a correção, e não num diretório de diagnóstico histórico.

**Alternatives considered**:
- **Gravar a evidência em `043/`** — rejeitado: violaria FR-017 e criaria um artefato cuja existência a spec não prevê, além de separar a evidência do seu objeto.
- **Gravar em `.specify/memory/`** — rejeitado: o diretório de memória guarda artefatos vivos transversais (`constitution.md`, `project-context.md`, `lessons-learned.md`); evidência datada de uma verificação pontual não é um deles.
- **Não contratar a forma, deixar para a `045`** — rejeitado: cada feature inventaria um formato, e a auditoria de FR-019b deixaria de ser comparável entre execuções.

---

## R4 — Terminologia canônica e idioma do entregável

**Decision**: O entregável é o **Documento de Visão e Rumo**, cujo arquivo é `vision.md`. Idioma: **português**, com os termos de fluxo em terminologia canônica do Metrik Design System quando citados. Termos canônicos fixados: *visão* (o documento), *medida* (valor com data), *sentinela* (arquivo que invalida medidas), *bloqueante* / *consultivo* (mecanismo de verificação), *entregue* (definição de FR-024), *oportunidade* e *herança de execução*.

**Rationale**: Toda a documentação de governança do projeto já está em português, e o Princípio VII exige terminologia canônica e proíbe marca de terceiros. Fixar os termos agora resolve o item **Outstanding** de terminologia apontado na revalidação do checklist de requisitos e evita que `vision.md`, `spec.md` e os contratos divirjam no vocabulário — que é o modo de falha mais barato de introduzir e o mais caro de descobrir.

**Alternatives considered**:
- **Inglês, alinhado ao template do SpecKit** — rejeitado: os artefatos vizinhos (spec, project-context, lessons-learned) estão em português; a divergência obrigaria tradução mental em cada leitura e produziria dois vocabulários canônicos.
- **Bilíngue** — rejeitado: duplica o vocabulário e cria duas fontes que podem divergir, contra o Princípio V.
- **Não fixar termos** — rejeitado: o item ficou Outstanding justamente porque "visão markdown" não tinha termo canônico.

---

## R5 — Provar ausência de regressão de forma reprodutível, para um feature que não toca código

**Decision**: A ausência de regressão é aferida por **dois números estáveis**, medidos antes e depois, com a suíte existente e o relatório básico:

```bash
npx vitest run --reporter=basic
```

Comparar: (a) **número de arquivos de teste falhando**, (b) **número de testes falhando**, e (c) a **identidade** dos casos no relatório `Failed Tests`. A linha de base de 2026-10-07 é **2 arquivos / 5 testes**, com os casos nomeados em [spec.md](./spec.md) §Anexo A.3. Além disso, remedir a cobertura com `npm run test:coverage` para regravar os três indicadores com a data de referência, resolvendo **CHK033**.

**Rationale**: Contagens e nomes são estáveis e verificáveis por qualquer pessoa, independentemente da máquina (o defeito é determinístico, não intermitente — confirmado por execução isolada em 2026-10-07). É a única definição de pronto que não colide com FR-017 e que não exige mudar o pipeline.

**Alternatives considered**:
- **Exigir suíte verde** — rejeitado: impossível sem violar FR-017; é a justificativa já registrada em `plan.md` §Complexity Tracking.
- **Comparar a saída completa do relatório** — rejeitada: durações e caminhos absolutos variam entre execuções e máquinas, produzindo falha falsa.
- **Usar apenas o código de saída da suíte** — rejeitado: hoje é sempre `1`, portanto não distingue "nada regrediu" de "tudo piorou".
- **Congelar a suíte nesta feature** — rejeitado: alterar configuração de teste viola FR-017 e criaria uma dívida cuja remoção ninguém agendaria.

---

## R6 — Impedir que a visão envelheça em silêncio

**Decision**: A validade é **dirigida por evento** e verificável: o manifesto de sentinelas (R2) determina quais medidas uma dada alteração invalida, e a visão publica a data de referência no cabeçalho. Nenhuma revalidação periódica e nenhum revalidação sob demanda (FR-023). A convenção de identificadores `OPP-NNN` é **permanente e append-only** (ver [data-model.md](./data-model.md)), de modo que o histórico de resolução acumula prova de que a dívida cai, em vez de ser reescrita.

**Rationale**: A causa raiz das 5 falhas atuais é exatamente envelhecimento silencioso — os testes dependiam do relógio e ninguém foi bloqueado. Um gatilho determinístico por arquivo-sentinela transforma "quando alguém lembrar" em "quando isto mudar", que é verificável por máquina. Identificadores permanentes são o que torna a prova acumulável: se `OPP-007` pudesse ser renumerado, a linha do tempo de resolução perderia sentido.

**Alternatives considered**:
- **Revalidação por prazo fixo** — rejeitada pelo mantenedor (Clarifications Q4): gera trabalho sem causa e produz revalidação cerimonial.
- **Revalidação sob demanda** — rejeitada pelo mantenedor (Clarifications Q4): depende de alguém desconfiar do documento, que é precisamente o comportamento que falhou.
- **Renumerar oportunidades ao resolver** — rejeitado: destrói a rastreabilidade que justifica manter a seção de itens resolvidos.
- **Remover oportunidades resolvidas** — rejeitado: elimina a única evidência de que a dívida diminui, permitindo que o mesmo item retorne sem histórico.

---

## Resumo das decisões

| ID | Decisão | Artefato que a materializa |
|---|---|---|
| R1 | Verificação de escopo por comparação de conjuntos com `git`, sem script novo | [quickstart.md](./quickstart.md) |
| R2 | Manifesto de sentinelas em tabela Markdown com forma fixa | [contracts/sentinel-manifest.md](./contracts/sentinel-manifest.md) |
| R3 | Forma da evidência contratada aqui; instância gravada na feature que verifica | [contracts/evidence-record.md](./contracts/evidence-record.md) |
| R4 | Terminologia canônica e idioma em português | [data-model.md](./data-model.md) |
| R5 | Ausência de regressão por contagem e identidade das falhas, mais remedição de cobertura | [quickstart.md](./quickstart.md) |
| R6 | Validade dirigida por evento, identificadores permanentes e append-only | [data-model.md](./data-model.md) |

**Incógnitas remanescentes**: nenhuma. Não há `NEEDS CLARIFICATION` aberto nesta feature.
