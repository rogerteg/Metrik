# Planning-Readiness Checklist: Saúde do Sistema, Oportunidades de Melhoria e Próximos Passos

**Purpose**: Revisar a qualidade dos requisitos de `spec.md` como insumo de `/speckit-plan` — testabilidade, rastreabilidade, fronteira de escopo (MECE) e protocolos de verificação. Este checklist testa se os requisitos estão bem escritos, **não** se a implementação funciona.
**Created**: 2026-10-07
**Feature**: [spec.md](../spec.md) · [vision.md](../vision.md)

**Note**: Checklist de requisitos gerado por `/speckit-checklist` a partir do contexto e dos requisitos da feature.
**Review Ownership**: Artefato de revisão pertencente ao revisor. Marque um item `[x]` somente quando o revisor determinar que o critério de qualidade de requisito foi satisfeito.
**Marker Semantics**: `[x]` significa que o critério foi revisado e satisfeito quanto à qualidade do requisito. **Não** significa que o trabalho de implementação está concluído.

---

## Testabilidade e Critérios de Aceite

- [ ] CHK001 Os critérios de aceite estão definidos para todo requisito de prioridade mais alta, ou algum depende apenas da narrativa da visão? [Completeness, Spec §FR-009..FR-011]
- [ ] CHK002 O estado "conforme" de uma verificação automatizada está quantificado, ou permanece qualitativo? [Ambiguity, Spec §FR-009]
- [ ] CHK003 O critério de zero arquivos alterados fora do conjunto de artefatos pode ser verificado objetivamente, sem depender da intenção do autor? [Measurability, Spec §SC-012]
- [ ] CHK004 O conjunto de artefatos restrito está enumerado de forma exaustiva, e o critério de aceite referencia a mesma enumeração? [Consistency, Spec §FR-017 vs §SC-012]
- [ ] CHK005 "Prioridade mais alta" está definida por uma escala fixa, ou pode ser satisfeita por qualquer rótulo que o autor escolha? [Ambiguity, Spec §FR-018]
- [ ] CHK006 As duas condições da definição de "entregue" são ambas determináveis objetivamente, sem julgamento? [Measurability, Spec §FR-024]
- [ ] CHK007 O "registro de mudanças do repositório" está identificado como um artefato específico, ou fica à interpretação? [Clarity, Spec §FR-024]
- [ ] CHK008 A proibição de publicar medida invalidada por sentinela pode ser verificada mecanicamente a partir da lista declarada? [Measurability, Spec §SC-013]

## Rastreabilidade e Designação de Corretivas

- [ ] CHK009 Todo requisito funcional rastreia para ao menos um critério de sucesso ou cenário de aceite? [Traceability]
- [ ] CHK010 Todas as oportunidades de prioridade mais alta estão atribuídas a um identificador de feature corretiva? [Completeness, Spec §FR-018]
- [ ] CHK011 "Feature corretiva designada" está definida no nível de detalhe necessário para autorizá-la — escopo, evidência e critério de encerramento? [Clarity, Spec §FR-018]
- [ ] CHK012 A origem do defeito está registrada para os itens de prioridade mais alta, de modo que a feature corretiva herde escopo inequívoco? [Completeness, Spec §FR-009]
- [ ] CHK013 Existe requisito estabelecendo onde uma oportunidade resolvida é registrada, para que o histórico de resolução seja auditável? [Gap, Spec §FR-011 vs vision §4.3]
- [ ] CHK014 O atributo de custo relativo de uma oportunidade é populado por algum requisito, ou está declarado e sem uso? [Gap, Spec §Key Entities]
- [ ] CHK015 Estão declaradas regras de identidade e unicidade para a convenção de identificador das oportunidades? [Gap, Spec §Key Entities]
- [ ] CHK016 O esquema de identificador usado pelas features corretivas está declarado, de modo que a designação seja resolvível? [Clarity, Spec §FR-018 vs vision §4.4]

## Fronteira de Escopo e MECE

- [ ] CHK017 Os resultados das quatro fases são mutuamente exclusivos, sem ação corretiva aparecendo sob duas fases? [Consistency, vision §5]
- [ ] CHK018 O conjunto de oportunidades é coletivamente exaustivo em relação aos indicadores declarados — todo indicador fora da meta tem oportunidade associada? [Completeness, vision §3.4 vs §4]
- [ ] CHK019 A fronteira de execução da feature está declarada em um único lugar canônico, ou repetida em formas que possam divergir? [Consistency, Spec §"Fronteira de execução" vs §FR-017]
- [ ] CHK020 Os domínios explicitamente fora de escopo estão declarados como exclusão intencional, e não apenas ausentes? [Coverage, Spec §Assumptions]
- [ ] CHK021 A afirmação de que a feature "não introduz comportamento novo" está reconciliada com a exigência de declarar e atribuir correções? [Consistency, Spec §Contexto vs §FR-009]
- [ ] CHK022 As ações dependentes de terceiros estão distinguidas do trabalho executável dentro do repositório? [Clarity, Spec §FR-016]
- [ ] CHK023 A contagem de funcionalidades com estado divergente é reproduzível apenas a partir da definição de "entregue"? [Measurability, Spec §FR-024]

## Protocolos de Verificação, Evidência e Validade das Medidas

- [ ] CHK024 As duas partes do protocolo de verificação documental são ambas obrigatórias, sem caminho para aceitar apenas uma? [Clarity, Spec §FR-019]
- [ ] CHK025 A parte executável do protocolo está definida com precisão suficiente para falhar de forma determinística? [Measurability, Spec §FR-019]
- [ ] CHK026 Estão definidos os critérios de qualificação do leitor independente que executa o walkthrough? [Gap, Spec §FR-019]
- [ ] CHK027 Os atributos exigidos de uma evidência de validação são suficientes para reproduzir o julgamento registrado? [Completeness, Spec §Key Entities]
- [ ] CHK028 A classificação bloqueante ou consultiva de cada indicador é inequívoca, sem indicador não classificado? [Completeness, Spec §FR-020 vs vision §7]
- [ ] CHK029 A regra de transição de consultivo para bloqueante está declarada como requisito e é consistente com a política de gate? [Consistency, Spec §FR-020 vs vision §7]
- [ ] CHK030 A lista de arquivos-sentinela está declarada de forma exaustiva, incluindo qual sentinela invalida qual indicador? [Completeness, Spec §FR-022 vs vision §3.6]
- [ ] CHK031 A vedação de revalidação por prazo fixo é consistente com a obrigação de remedir uma medida invalidada? [Consistency, Spec §FR-023]
- [ ] CHK032 Estão definidas as condições sob as quais uma medida pode ser legitimamente reutilizada sem remedição? [Gap, Spec §FR-022]
- [ ] CHK033 A data de origem das medições de cobertura está reconciliada com a regra de validade das medidas? [Conflict, vision Anexo vs §3.6]
- [ ] CHK034 A exigência de determinismo da verificação automatizada está atribuída à feature corretiva, dado que a feature atual não pode alterar testes? [Gap, Spec §FR-009 vs §FR-017]
- [ ] CHK035 Cada obrigação constitucional aplicável está mapeada para ao menos um requisito ou critério de sucesso? [Traceability]
- [ ] CHK036 O que acontece quando uma oportunidade é encerrada sem que a feature corretiva designada conclua está definido? [Gap, Exception Flow]

## Notes

### Regras de revisão

- Marque `[x]` somente após a revisão confirmar que o critério de **qualidade do requisito** foi satisfeito — não que o trabalho foi executado.
- Mantenha sem marcação os itens que ainda exigem esclarecimento, correção ou avaliação do revisor.
- `/speckit-implement` lê o estado das marcações como gate e **não** deve modificar marcadores.
- `checklists/requirements.md` tem ciclo de vida próprio, mantido por `/speckit-specify` e `/speckit-clarify`; ele **não** é atualizado por este artefato.

### Contexto desta geração

| Dimensão | Decisão registrada |
|---|---|
| Propósito | Prontidão para planejar — habilitar `/speckit-plan` sem construir plano sobre ambiguidade |
| Dimensões cobertas | Testabilidade e critérios de aceite · rastreabilidade e designação de corretivas · fronteira de escopo e MECE · protocolos de verificação, evidência e validade |
| Domínios excluídos | Comportamento de runtime, UX, desempenho de execução e superfícies de persistência — a feature não introduz nenhum deles (`spec.md` §Assumptions) |
| Amplitude | 36 itens, 4 categorias |

### Exceção registrada ao gate de pré-requisitos

O script de pré-requisitos do projeto recusa execução sem `plan.md` no diretório da feature. Esta geração foi autorizada explicitamente pelo mantenedor a **pular esse gate**, porque a feature ainda não foi planejada e a skill trata o plano como opcional ("if exists"). Consequência aceita: os itens não puderam ser cruzados com decisões técnicas de um plano — o que é irrelevante para uma feature documental, mas deve ser revisitado se `/speckit-plan` introduzir decisões que redefinam a fronteira de escopo.

### Observações do gerador

- CHK033 registra uma inconsistência real e não resolvida: as medições de cobertura têm data de origem **2026-09-28**, anterior à data de referência 2026-10-07 das demais medidas. A visão sinaliza isso no Anexo, mas nenhum requisito determina se essa medida é válida sob a regra de sentinelas.
- CHK034 registra uma lacuna de atribuição: a obrigação de determinismo da suíte é descrita como oportunidade (`FR-009`), enquanto `FR-017` proíbe esta feature de alterar testes. A responsabilidade pela remediação fica implícita na feature corretiva designada.
- CHK006 depende de `FR-024`, cuja definição de "entregue" foi fixada na sessão de esclarecimento de 2026-10-07; a contagem de 32 funcionalidades divergentes só é reproduzível sob essa definição.
