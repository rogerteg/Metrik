# Padrões (Patterns) — Security Chaos Engineering

Padrões e técnicas recorrentes do livro. Use como vocabulário de design, não como receita.

## Mentalidade / estratégia
- **Resilience over prevention**: aceite que a falha acontece e projete para recuperar/adaptar, em vez de tentar prevenir tudo.
- **Outcome-driven security**: meça por resultado (resiliência real, redução de dano), não por atividade (checklists cumpridos).
- **Empiricism over ritual**: prefira evidência de experimentos a "security theater" e folk wisdom.
- **Systems perspective**: analise o sistema inteiro (sociotécnico), não componentes isolados.
- **Invest effort by local context**: aloque o esforço de segurança onde o risco/contexto local justifica (effort investment portfolio), não uniformemente.

## Avaliação (ch. 2)
- **E&E Resilience Assessment**: (1) *Evaluate* — mapeie fluxos → funcionalidade crítica; documente premissas de safety boundaries; faça "attacker math" (árvores de decisão com ROI do atacante); (2) *Experiment* — valide as premissas com experimentos.
- **Feedback flywheel**: mantenha o ciclo avaliar→experimentar→aprender→adaptar rodando continuamente.
- **Fail-safe → safe-to-fail**: quando não dá para prevenir, projete para que a falha seja contida e *ensine*.
- **RAVE** ao entregar segurança a engenheiros: *Repeatable* (dá para repetir/automatizar), *Accessible* (fácil de usar), *Variable* (suporta evolução).

## Design (ch. 3)
- **Reduce coupling**: desacople (filas, contratos estáveis, boundaries explícitas) para que falhas não em cascata.
- **Reduce accidental complexity**: distinga complexidade essencial da acidental; corte a acidental.
- **Increase linearity**: torne causa-efeito previsível (menos estados implícitos, mais explícitos).
- **Preserve possibilities**: evite decisões que eliminam opções futuras (abstrações prematuras, lock-in).
- **Map critical functionality**: identifique o que não pode cair; proteja isso primeiro.

## Build & deliver (ch. 4)
- **Boring technology**: prefira tecnologia madura/conhecida; novidade = surpresa.
- **Standardize raw materials**: padronize dependências/componentes (menos variedade = menos surpresa).
- **Security checks in CI/CD**: automatize verificações de segurança no pipeline (não num time no fim).
- **Configuration as code**: versione e revise configuração (elimina drift e "funciona na minha máquina").
- **Fault injection during development**: injete falhas cedo (build), não espere produção.
- **Test ≠ theater**: desenhe testes que validam comportamento real; desconfie de cobertura sem valor.
- **Feature flags / dark launches**: libere mudanças reversível e gradualmente.
- **Strangler fig**: migre/refatore por substituição incremental.
- **Document the "why"**: registre decisões e contexto (não só o "como").
- **Distributed tracing & logging**: instrumente para conseguir ver interações espaço-tempo.

## Operar & observar (ch. 5)
- **Measure like an attacker (attack observability)**: monitore o que um atacante faria (falhas de auth, movimentos laterais), não só falhas de performance.
- **DORA + SLOs**: use métricas de entrega e SLOs explícitos para guiar trade-offs.
- **Confidence-based security**: decida com base em confiança medida (evidência), não em medo/FUD.
- **Thresholding**: defina limiares de alerta para revelar onde estão os safety boundaries.
- **Automate toil away**: automatize trabalho repetitivo para liberar humanos para o que exige julgamento.

## Incidente & recuperação (ch. 6)
- **Rehearse response**: pratique resposta (game days, simulações) antes do incidente real.
- **Fight action bias**: antes de agir, pergunte "o que sabemos? o que agir muda?" — agir cedo demais pode piorar.
- **Blameless investigation**: investigue com perguntas neutras; foco em condições do sistema, não em culpados.
- **Eradicate "human error" as root cause**: pergunte "que condições levaram o humano a errar?".
- **Learn from surprises**: trate todo incidente como dado para o próximo experimento/hipótese.

## Plataforma (ch. 7)
- **Security as a product**: trate soluções internas de segurança como produto (visão, usuário, personas, métricas).
- **Ice Cream Cone Hierarchy**: ao desenhar um controle, prefira o topo da hierarquia (eliminar perigo) sobre a base (treino/política).
- **Guardrails over gates**: dê defaults seguros e limites que guiam, em vez de bloqueios que paralisam.
- **Golden paths**: forneça caminhos seguros e fáceis que os devs seguem por padrão.
- **Balance control & resilience strategies**: nem tudo dá para controlar; onde não der, aumente capacidade de absorver/adaptar.

## Experimentação (ch. 8)
- **Start in nonproduction**: comece em staging/CI; produção depois com segurança.
- **Mine past incidents**: use incidentes reais como fonte de hipóteses/experimentos.
- **Publish findings**: evangelize resultados (reduz medo, espalha aprendizado).
- **Design falsifiable hypotheses**: hipótese que pode ser refutada pela evidência.
- **Write experiment design specs**: documente hipótese, método, métricas, riscos, rollback.
- **Run the EMPAK loop**: Execute → Monitor → Plan → Analyze → Knowledge.
- **Game days**: ensaie cenários (forma gradual de entrar no caos).
- **Automate experiments**: rode continuamente, não como evento único.

## Trade-offs
- **Fail-safe vs. safe-to-fail**: falha contida e segura (desejável) vs. falha que derruba tudo (a evitar) — e a diferença entre *uncertainty* (dá para estimar) e *ambiguity* (não dá nem para estimar) muda a estratégia.
- **Control vs. resilience**: controle reduz probabilidade de falha; resiliência reduz impacto quando falha — os dois juntos.
- **Coupling**: desacoplar custa (latência, consistência); acoplar demais custa (cascata). Escolha consciente.
