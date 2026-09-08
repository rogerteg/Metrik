# Cheatsheet — Security Chaos Engineering (regras de decisão)

## 1. Antes de agir em segurança
- [ ] Defina a **funcionalidade crítica** do sistema (o que não pode parar?)
- [ ] Liste **safety boundaries** presumidos (onde você acha que o sistema aguenta?)
- [ ] Quem é o adversário e qual o **ROI dele** (attacker math)? 
- [ ] Isto é **uncertainty** (estimável) ou **ambiguity** (nem as opções são claras)?
- [ ] Você está fazendo **prevenção** (controle) ou precisa de **resiliência** (absorver/adaptar)?

## 2. Regras de decisão rápidas
- **Robustez não é resiliência** → se você só endurece sem capacidade de adaptar, você não é resiliente.
- **"Prevenir toda falha" é mito** → gaste também em detecção, contenção e recuperação.
- **Segurança de componentes não soma** → a resiliência é propriedade do *todo* (interações).
- **"Cultura de segurança" não conserta erro humano** → mude as condições, não culpe a pessoa.
- **Se parece compliance sem evidência** → provavelmente é security theater.
- **Falha deve ser *safe-to-fail*** → contenha e aprenda, não apenas "falhe seguro".
- **Novidade = surpresa** → prefira tecnologia "chata" (boring) e madura.
- **Teste que sempre passa sem validar nada** → test theater; reavalie.
- **Acoplamento alto** → falha em cascata; desacople o que é crítico.
- **Complexidade acidental** → corte; complexidade essencial → gerencie (não dá para eliminar).
- **Num incidente, antes de agir** → pergunte: "o que sabemos? agir agora muda o quê?" (anti action bias).
- **"Human error" como causa** → pergunte "que condições levaram a isso?" (anti culpa).
- **Ao julgar uma decisão passada** → avalie pelo que se sabia *na época*, não pelo resultado (anti hindsight/outcome bias).
- **Ao criar um controle de segurança** → suba na Ice Cream Cone: eliminar perigo > substituir > guardas > avisos > treino.
- **Ao entregar segurança a devs** → RAVE: repetível, acessível, variável; guardrails em vez de gates.

## 3. Árvore: que tipo de experimento fazer?
```
Tem uma premissa crítica não verificada? ──não──▶ monitore/observe (ch.5)
        │ sim
        ▼
Pode testar em staging/CI? ──sim──▶ comece fora de produção (lição #1)
        │ não (só produção)
        ▼
Hipótese falsificável escrita? ──não──▶ refine a hipótese (o que refutaria?)
        │ sim
        ▼
Experiment design spec (método, métricas, riscos, rollback) 
        │
        ▼
Run EMPAK: Execute → Monitor → Plan → Analyze → Knowledge
        │
        ▼
Publique/aprenda e alimente o próximo ciclo (feedback flywheel)
```

## 4. E&E Resilience Assessment (ch. 2)
| Fase | O que fazer |
|------|-------------|
| **Tier 1 — Evaluation** | Mapear fluxos de dados/acesso → funcionalidade crítica; documentar premissas de safety boundaries; attacker math (árvores de decisão de ROI); criar decision trees |
| **Tier 2 — Experimentation** | Validar premissas com experimentos (fault injection, game days, caos); coletar evidência; girar o feedback flywheel |
| **Sustentar** | Repetir continuamente; usar incidentes passados como fonte de hipóteses |

## 5. Ice Cream Cone Hierarchy (ch. 7) — do melhor ao pior
1. **Eliminate hazard** no design (não crie o componente perigoso).
2. **Substitute** por método/material menos perigoso.
3. **Safety devices/guards** (limites técnicos, sandbox, least privilege).
4. **Warnings & awareness** (avisos, sinais).
5. **Administrative controls/training** (políticas, treino) — o mais fraco, use como último recurso.

## 6. DORA / métricas (ch. 5)
- **DORA**: deployment frequency, lead time for changes, change failure rate, time to restore service.
- **SLOs**: defina metas explícitas; use **thresholds** para revelar safety boundaries.
- **Attack observability**: monitore o que o atacante faria (auth failures, acesso anômalo, exfiltração) — não só falhas de performance.
- **Confidence-based security**: decida por evidência/confiança medida, não por medo.

## 7. Checklist de experimento de segurança (ch. 8)
- [ ] Baseado em premissa crítica ou incidente passado?
- [ ] Hipótese falsificável, com métrica de sucesso/refutação?
- [ ] Experiment design specification escrita (método, escopo, riscos, rollback)?
- [ ] Ambiente certo (staging primeiro)?
- [ ] Evidência coletada de forma confiável (observabilidade)?
- [ ] Resultado analisado e documentado (release notes do experimento)?
- [ ] Conhecimento realimenta o loop (EMPAK)?
- [ ] Resultado publicado/evangelizado?

## 8. Smells (tells de problema)
- **"Fazemos isso porque o auditor pede"** → security theater.
- **"O usuário errou / foi engano humano"** no postmortem → investigação encerrada cedo demais.
- **"Ninguém mexeu, mas quebrou"** → interações espaço-tempo não observadas; falta observabilidade.
- **"Testes passam, mas a feature quebra em produção"** → test theater / falta de realismo.
- **"Toda mudança exige reunião de segurança"** → controle virou gate; falta RAVE/guardrails.
- **"A gente só descobre falha quando o atacante acha"** → sem attack observability nem experimentação.
