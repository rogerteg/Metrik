# Capítulo 5 — Operating and Observing

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch05-operating-and-observing.md`

## Core Idea
A resiliência se sustenta (ou se perde) na **operação**: como medimos sucesso, como observamos o sistema — e, crucialmente, se observamos **como o atacante enxerga** o sistema. O capítulo conecta **SRE e segurança**, propõe métricas (DORA, SLOs), **confidence-based security** e **attack observability**, e defende que **escalável é mais seguro**.

## Frameworks Introduced
- **O overlap entre SRE e segurança** (objetivos compartilhados de confiabilidade).
- **Medir sucesso operacional** e **criar métricas como atacantes**.
- **DORA metrics** e **SLOs/SLAs** com análise de performance com princípios.
- **Confidence-based security**.
- **Observability for resilience & security** e **thresholding** para revelar safety boundaries.
- **Attack observability**.
- **Scalable is safer** e automatizar toil.

## Key Concepts
- **O que operar/observar envolve**: sustentar a resiliência enquanto o sistema roda em produção — detecção, resposta inicial e aprendizado contínuo.
- **Overlap SRE–segurança**: SRE quer sistemas confiáveis; segurança quer sistemas seguros. Ambos dependem de *comportamento real sob condições adversas* — a mesma telemetria e os mesmos experimentos servem aos dois.
- **Medir sucesso operacional**:
  - **Crafting success metrics like attackers**: defina métricas que um atacante usaria para julgar o sucesso dele (ex.: quanto tempo até exfiltração? quantos hosts alcançados?) — se você não mede o que o atacante quer, não sabe se está ganhando.
  - **DORA metrics**: deployment frequency, lead time for changes, change failure rate, time to restore service — confiabilidade de entrega como base de segurança.
  - **SLOs/SLAs e principled performance analytics**: defina objetivos explícitos e analise performance com método (não por achismo).
- **Confidence-based security**: troque a tomada de decisão baseada em **medo** (FUD, "e se...") por decisão baseada em **confiança medida** — o quanto você *confia* que o sistema se comporta como esperado, com evidência. Segurança vira gestão de confiança.
- **Observabilidade**:
  - Para **resiliência e segurança**: saber o estado interno a partir de saídas (métricas, logs, traces).
  - **Thresholding**: defina limiares; quando cruzados, revelam onde estão os **safety boundaries** reais (o limite que você presumia no papel).
  - **Attack observability**: observar o sistema **pela perspectiva do atacante** — tentativas de auth falhas, varredura, movimento lateral, exfiltração — não apenas falhas de performance. Se você só monitora "está de pé?", não vê "está sendo invadido?".
- **Escalabilidade**: **scalable is safer** — sistemas que escalam bem (e automatizam) reduzem a necessidade de intervenção manual sob estresse, quando humanos erram mais. **Automatizar toil**: remover trabalho repetitivo libera atenção para o que exige julgamento (e reduz erro sob pressão).

## Mental Models
- **"O que você não observa, você não pode defender"**: sem telemetria do comportamento do atacante, você está voando cego.
- **Meça como o atacante mede**: a métrica de sucesso do adversário (tempo até o objetivo) é a sua métrica de alerta.
- **Confiança > medo**: decida com base em evidência do que o sistema faz, não em cenários hipotéticos não testados.
- **Thresholds revelam limites**: um alerta que dispara (ou não) ensina onde realmente está o safety boundary — use isso para calibrar modelos mentais.
- **Automatizar para sobreviver ao estresse**: sob ataque/pico, o que é manual falha; o que é automático aguenta.

## Anti-patterns
- Monitorar **só disponibilidade** ("ping") e nunca **comportamento de ataque**.
- Métricas de sucesso **centradas no defensor** (ex.: "nenhum alerta") em vez do que o atacante quer.
- **SLOs sem método**: metas arbitrárias sem análise de como alcançar/manter.
- Decisão de segurança por **medo** sem evidência (e sem experimento para obtê-la).
- **Toil não automatizado**: times exaustos em tarefas manuais repetitivas cometem erros sob pressão.

## Worked Example
**Detecção de movimento lateral**: a equipe monitorava CPU/erros (disponibilidade) mas não "quem acessa o quê". Adotando **attack observability**: métricas como *falhas de autenticação por host*, *primeiro acesso a um host novo*, *volumes de exfiltração*. Um **threshold** — ">3 hosts com auth failure vindas do mesmo host interno em 10 min" — revela um safety boundary real: o ponto em que o movimento lateral começa. Um alerta dispara em teste de caos (ch. 8) e a equipe calibra. Com **confidence-based security**, eles decidem investir em segmentação *porque a evidência* mostrou o movimento — não por medo genérico.

## Key Takeaways
1. **SRE e segurança são o mesmo jogo**: confiabilidade sob adversidade.
2. Use **DORA + SLOs** e **meça como o atacante mede**.
3. Adote **confidence-based security**: evidência > medo.
4. **Attack observability + thresholds** revelam safety boundaries e o ataque em andamento.
5. **Escalável é mais seguro**: automatize toil para sobrar atenção/julgamento.

## Connects To
- **Ch 1/2**: observabilidade sustenta modelos mentais e a avaliação.
- **Ch 6**: o que você observa alimenta a resposta.
- **Ch 8**: observabilidade é pré-requisito para coletar evidência de experimentos.
- **Conceitos**: SRE (Google), DORA/Accelerate, observability (logs/metrics/traces).
