# Phase 1 — Data Model: Saúde do Sistema, Oportunidades de Melhoria e Próximos Passos

**Feature**: `043-system-health-and-roadmap` | **Date**: 2026-10-07 | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Este modelo descreve os **dados documentais** do Documento de Visão e Rumo. Não há banco de dados, migração ou schema executável: as "entidades" são seções estruturadas de [vision.md](./vision.md), e as "regras de validação" são regras de forma e rastreabilidade verificáveis por leitura e, onde indicado, por comparação de conjuntos.

---

## 1. Diagrama de relações

```text
Arquivo-sentinela  ──invalida (1..N)──▶  Indicador de Qualidade
                                              │
                                              │ possui próximo passo
                                              ▼
Fase de Próximos Passos  ──contém (1..N)──▶  Oportunidade de Melhoria
                                                   │
                                                   │ designa (obrigatório se P1)
                                                   ▼
                                            Feature corretiva (identificador externo)

Bloqueio de Ambiente   ──substitui a meta de──▶  Indicador de Qualidade
Evidência de Validação ──comprova──▶             verificação não automatizável
```

Regra de cardinalidade que importa: **nenhum indicador fora da meta pode ficar sem oportunidade associada** (CHK018 / MECE). E **nenhuma oportunidade de prioridade P1 pode ficar sem feature corretiva designada** (FR-018).

---

## 2. Oportunidade de Melhoria

Item de trabalho potencial identificado pelo diagnóstico.

| Campo | Obrigatoriedade | Tipo / domínio | Regra de validação |
|---|---|---|---|
| `identificador` | **Obrigatório** | `OPP-NNN` | **Permanente e nunca reutilizado.** Sequencial, sem lacunas causadas por remoção. Ver §7. |
| `titulo` | **Obrigatório** | texto curto | Deve descrever o problema, não a solução |
| `origem` | **Obrigatório** | `já registrada` \| `nova` | `já registrada` exige referência ao artefato de memória que a rastreava |
| `evidencia` | **Obrigatório** | caminho, medida ou artefato, com data | Deve ser verificável por terceiros; FR-005. Proibido "observação geral" |
| `impacto` | **Obrigatório** | texto curto | Deve declarar o que quebra ou encarece se não for tratado |
| `prioridade` | **Obrigatório** | `P1` \| `P2` \| `P3` | Escala fechada, definida em §3 |
| `custo_relativo` | **Opcional** | `baixo` \| `médio` \| `alto` | **Não bloqueante.** Se ausente, o campo não é exibido (resolução de CHK014) |
| `criterio_encerramento` | **Obrigatório** | texto verificável | Deve ser aferível sem julgamento; proibido "melhorar X" |
| `estado` | **Obrigatório** | `aberta` \| `resolvida` \| `lacuna_aceita` | Transições em §4 |
| `data_referencia` | **Obrigatório** | data ISO | Data da medição que originou o item |
| `feature_corretiva` | **Obrigatória se `prioridade = P1`** | identificador de feature | FR-018; SC-011. Ausente em P1 ⇒ reprova |
| `data_resolucao` | **Obrigatória se `estado ≠ aberta`** | data ISO | Prova a queda da dívida (R6) |

**Regras transversais**

- A **ordem dos identificadores não pode ser alterada** para reordenar prioridades: prioridade é um campo, não a posição na lista.
- `estado = resolvida` **não remove** a oportunidade da visão; ela migra para a seção de itens resolvidos com `data_resolucao` (append-only).
- `estado = lacuna_aceita` **exige** que `criterio_encerramento` declare explicitamente o que permanece não verificado e por quê.

---

## 3. Escala de prioridade (escala fechada)

| Valor | Significado | Consequência |
|---|---|---|
| `P1` | Rompe o sinal automatizado, a confiabilidade da documentação ou um princípio constitucional | **Exige** `feature_corretiva` designada (FR-018) |
| `P2` | Dívida estrutural ou divergência de governança | Recebe designação no momento em que entra em execução |
| `P3` | Higiene, desempenho ou sustentação | Recebe designação no momento em que entra em execução |

A escala é **fechada**: um valor fora de `P1/P2/P3` é inválido. Isto resolve a ambiguidade apontada em CHK005 ("prioridade mais alta" definida por escala fixa, não por rótulo livre).

---

## 4. Transições de estado da Oportunidade

```text
                        ┌──────────────────────────────────────┐
                        │                                      │
   (identificada) ──▶ aberta ──encerramento satisfeito──▶ resolvida
                        │                                      │
                        └──justificativa datada──▶ lacuna_aceita
                                                                 │
                                                        (nunca retorna a aberta
                                                         sem novo identificador)
```

| Transição | Pré-condição | Efeito |
|---|---|---|
| `— → aberta` | `identificador` atribuído, `evidencia` e `criterio_encerramento` presentes, `prioridade` atribuída | Oportunidade entra no backlog rastreado; se `P1`, exige `feature_corretiva` |
| `aberta → resolvida` | `criterio_encerramento` aferido como satisfeito | `data_resolucao` gravada; item passa a compor o histórico. **Nunca removido** |
| `aberta → lacuna_aceita` | Justificativa datada de por que não será tratada | `criterio_encerramento` reformulado para declarar o escopo não verificado |
| `lacuna_aceita → resolvida` | Oportunidade posteriormente tratada | Permitido, com `data_resolucao`; o identificador **permanece o mesmo** |
| `resolvida → aberta` | **Proibido** | Se o problema retornar, recebe **novo** `OPP-NNN` e referencia o anterior. Reescrever o passado destruiria a auditoria (R6) |

**Regra de exceção (CHK036)**: se uma oportunidade for encerrada como `lacuna_aceita` enquanto a `feature_corretiva` designada estava aberta, a designação deve ser liberada explicitamente e a razão gravada — caso contrário a visão manteria a aparência de trabalho em andamento que não existe.

---

## 5. Fase de Próximos Passos

| Campo | Obrigatoriedade | Tipo | Regra de validação |
|---|---|---|---|
| `ordem` | **Obrigatório** | inteiro, único | Define a sequência de execução; sem duplicidade |
| `objetivo` | **Obrigatório** | texto curto | Uma frase, orientada a resultado |
| `itens` | **Obrigatório** | lista de referências `OPP-NNN` ou ações | Toda referência deve resolver para uma oportunidade existente |
| `resultado_verificavel` | **Obrigatório** | texto verificável | Deve ser aferível sem inspeção manual; FR-007/FR-008 |

**Regras transversais**

- **Exclusividade mútua (CHK017)**: uma mesma ação corretiva **não pode** aparecer sob duas fases. Sobreposição reprova o MECE.
- Uma fase sem `resultado_verificavel` aferível é inválida — a fase existe para produzir prova, não para agrupar intenções.

---

## 6. Indicador de Qualidade e Arquivo-sentinela

### 6.1 Indicador de Qualidade

| Campo | Obrigatoriedade | Tipo / domínio | Regra de validação |
|---|---|---|---|
| `nome` | **Obrigatório** | texto | Único no documento |
| `valor_medido` | **Obrigatório** | número ou estado | Valor **observado**, nunca estimado |
| `data_medicao` | **Obrigatório** | data ISO | Se anterior à última alteração de uma sentinela que o invalida, a medida é **inválida** (FR-022) |
| `meta` | **Obrigatório** | número, estado ou meta declarada | Deve ser comparável a `valor_medido` |
| `mecanismo` | **Obrigatório** | `bloqueante` \| `consultivo` | FR-020. Fechado: nenhum indicador pode ficar sem classificação |
| `como_medir` | **Obrigatório** | comando ou procedimento | Deve ser reproduzível por terceiros |
| `proximo_passo` | **Obrigatório se fora da meta** | referência `OPP-NNN` ou ação | SC-010 |

### 6.2 Arquivo-sentinela

| Campo | Obrigatoriedade | Tipo | Regra de validação |
|---|---|---|---|
| `caminho` | **Obrigatório** | caminho relativo à raiz, com `/`, em crase | Forma fixada em [contracts/sentinel-manifest.md](./contracts/sentinel-manifest.md) |
| `razao` | **Obrigatório** | texto curto | Deve explicar **por que** a alteração invalida medidas |
| `indicadores_invalidados` | **Obrigatório** | lista de nomes de indicador | Toda referência deve resolver para um indicador existente |

**Regra de coerência (CHK030)**: todo indicador declarado deve ser invalidado por **ao menos uma** sentinela. Um indicador que nenhuma sentinela invalida é, na prática, declarado imune ao tempo — se essa for a intenção, ela deve estar escrita.

---

## 7. Regras de identidade e unicidade

| Item | Regra |
|---|---|
| Formato do identificador de oportunidade | `OPP-NNN`, com `NNN` de três dígitos, alocado em sequência crescente |
| Unicidade | Um `OPP-NNN` identifica **exatamente uma** oportunidade, para sempre |
| Reutilização | **Proibida**, inclusive após remoção de conteúdo |
| Lacunas | Permitidas (um identificador pode ter sido alocado e a oportunidade encerrada); **a ordem não define prioridade** |
| Estabilidade | Um identificador nunca muda de valor, mesmo que título, prioridade ou estado mudem |
| Histórico | **Append-only**: itens resolvidos ou aceitos como lacuna permanecem no documento, datados |

Isto resolve **CHK015** e é a condição que torna auditável a afirmação de que a dívida está caindo (R6).

---

## 8. Bloqueio de Ambiente e Evidência de Validação

### 8.1 Bloqueio de Ambiente

| Campo | Obrigatoriedade | Tipo | Regra de validação |
|---|---|---|---|
| `verificacao` | **Obrigatório** | texto | Qual verificação não pôde ser executada |
| `causa` | **Obrigatório** | texto | Natureza do bloqueio (ambiente, recurso ausente, terceiro) |
| `responsavel` | **Obrigatório** | papel ou pessoa | FR-015/FR-016. Sem responsável identificado, o bloqueio é inválido |
| `escopo_nao_verificado` | **Obrigatório** | texto | O que permanece sem verificação, declarado como lacuna — **nunca** como concluído |

### 8.2 Evidência de Validação

| Campo | Obrigatoriedade | Tipo | Regra de validação |
|---|---|---|---|
| `verificacao_associada` | **Obrigatório** | referência | Deve resolver para uma verificação exigida |
| `metodo` | **Obrigatório** | texto | Como foi verificado |
| `executor` | **Obrigatório** | identificação + **qualificação** | Deve declarar que o executor **não tem conhecimento prévio** do projeto (CHK026) |
| `data` | **Obrigatório** | data ISO | Sem data, a evidência não é auditável |
| `resultado` | **Obrigatório** | texto ou artefato | O resultado observado, não a conclusão desejada |

Forma completa em [contracts/evidence-record.md](./contracts/evidence-record.md). **Esta feature não grava instâncias** — apenas contrata a forma (R3).

---

## 9. Terminologia canônica

Fixada em português (R4), usada de forma idêntica em `spec.md`, `vision.md`, `plan.md` e contratos.

| Termo canônico | Definição | Termos evitados |
|---|---|---|
| *visão* | O Documento de Visão e Rumo, arquivo `vision.md` | "visão markdown", "documento de visão" solto |
| *medida* | Valor observado acompanhado de data | "número", "dado" isolado |
| *sentinela* | Arquivo cuja alteração invalida medidas | "arquivo-chave", "gatilho" |
| *bloqueante* | Indicador verificado por verificação executável da suíte | "obrigatório", "hard gate" |
| *consultivo* | Indicador dependente de ambiente local ou julgamento | "informativo", "soft" |
| *entregue* | Código na linha principal **e** referência no registro de mudanças (FR-024) | "pronto", "feito", "publicado" |
| *oportunidade* | Item de melhoria identificado (entidade 2) | "problema", "ticket", "issue" |
| *lacuna aceita* | Estado de oportunidade não tratada, com escopo não verificado declarado | "aceito", "won't fix" |
| *feature corretiva* | Feature que executa a correção de uma oportunidade | "correção", "fix" |

---

## 10. Rastreabilidade aos requisitos

| Entidade / regra | Requisitos que a originam |
|---|---|
| Oportunidade (campos obrigatórios) | FR-004, FR-005, FR-006 |
| Escala de prioridade | FR-006 |
| Transições de estado | FR-004, CHK036 |
| `feature_corretiva` obrigatória em P1 | FR-018, SC-011 |
| Fase e `resultado_verificavel` | FR-007, FR-008 |
| Indicador e `mecanismo` | FR-014, FR-020, FR-021 |
| `data_medicao` × sentinela | FR-022, FR-023, SC-013 |
| Arquivo-sentinela | FR-022 |
| Bloqueio de Ambiente | FR-015, FR-016 |
| Evidência de Validação | FR-019, CHK026 |
| Identidade `OPP-NNN` | CHK015, R6 |
| Terminologia canônica | R4, Constituição VII |
