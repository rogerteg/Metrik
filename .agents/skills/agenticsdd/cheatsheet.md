# Cheatsheet: Agentic Spec-Driven Development (Anatoly Volkhover)

Guia de bolso com os 7 Modos de Prompt, o Quarteto de Bootstrap, o Checklist do Polígrafo e as Regras Anti-Rot.

---

## 1. Os 7 Modos de Prompt do Handler

| Modo | Objetivo | Exemplo de Prompt |
|---|---|---|
| **Command** | Ação imperativa direta | *"Execute os testes unitários e liste apenas os módulos que falharam."* |
| **Research** | Investigação exploratória em arquivos | *"Inspecione `specs/auth.md` e liste todas as regras de expiração de token JWT."* |
| **Suggest** | Brainstorming divergente | *"Proponha 3 alternativas de fluxo para recuperação de senha sem envio de link por e-mail."* |
| **Draft** | Síntese de especificação formal | *"Redija a especificação funcional completa para o webhook de estorno em `specs/refunds.md`."* |
| **Analyze** | Auditoria de lacunas e consistência | *"Analise a especificação de checkout contra as regras de concorrência do `glossary.md`."* |
| **Explain** | Desconstrução didática | *"Explique o impacto da regra RULE-SEC-004 sobre a latência da API de autenticação."* |
| **Critique** | Revisão crítica adversarial (Red-Team) | *"Faça uma revisão implacável desta spec: identifique 5 pontos de falha sob carga de rede."* |

---

## 2. O Quarteto de Bootstrap

1. **`AGENTS.md` / `CLAUDE.md`**: Ponto de entrada de regras duráveis, comandos de build e restrições comportamentais inegociáveis.
2. **`rule-analysis.md`**: Protocolo para o agente auditar suas próprias regras periodicamente e detectar inchaço (*Rule Bloat*).
3. **`rule-conflict-protocol.md`**: Procedimento obrigatório a ser seguido quando duas regras duráveis entrarem em contradição.
4. **`rule-conflict-log.md`**: Livro-razão (*ledger*) de auditoria onde conflitos e decisões humanas de arbitragem são gravados.

---

## 3. Checklist do Teste do Polígrafo (The Polygraph)

Em uma sessão limpa (`/reset`), submeta a especificação às seguintes 5 perguntas cruzadas:
- [ ] Quais suposições e premissas implícitas foram feitas nesta spec que NÃO estão explicitamente documentadas?
- [ ] Em quais 3 cenários específicos a implementação literal desta spec resultará em estado inconsistente ou falha de sistema?
- [ ] Quais são as restrições de concorrência, timeouts e falhas de rede que esta especificação ignorou?
- [ ] Quais termos utilizados nesta especificação não possuem definição formal no `glossary.md`?
- [ ] Quais perguntas um auditor de segurança e privacidade faria antes de homologar este documento?

---

## 4. Regras de Mitigação de Degradação de Contexto (Context Rot)

1. **Sessões Curtas e Focadas**: Nunca ultrapasse 30-40 turnos em uma mesma sessão de agente.
2. **Memória em Arquivo**: Todo avanço, decisão e regra deve ser persistido em arquivos Markdown antes do reset da sessão.
3. **Triangulação Tripla**: Ao reiniciar a sessão, alimente o agente com apenas 3 arquivos:
   - `glossary.md` (Vocabulário canônico)
   - `project-context.md` (Verdades fundamentais e premissas)
   - `specs/active-feature.md` (A especificação ativa)
4. **Zero Histórico Verbal**: Nunca confie que o agente "lembra" do que foi dito no chat anterior. Se não está no Git, não existe.
