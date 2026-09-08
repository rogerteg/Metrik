# Capítulo 10 — Boundaries

**Livro**: Security Engineering (Anderson) · `chapters/ch10-boundaries.md`

## Core Idea
Muitos sistemas precisam impor **fronteiras entre domínios de confiança** que não são simples hierarquias de classificação — são *compartimentação* (lattice), conflitos de interesse ou **dados pessoais sensíveis** (saúde). Anderson usa a **privacidade de registros de saúde** como o estudo de caso central: como definir e impor quem pode ver o quê num mundo em que muitos profissionais legítimos precisam de acesso parcial.

## Frameworks Introduced
- **Compartimentação e o modelo de lattice** (generalização de hierarquia para múltiplas dimensões).
- Política de segurança da **BMA** (British Medical Association) para prontuários — exemplo de política centrada no paciente.
- **Chinese Wall** como política de conflito de interesse.
- Aplicação: "Privacy for Tigers" (privacidade como compartimentação na prática).

## Key Concepts
- **Compartimentação/lattice**: em vez de uma linha (nível), múltiplas dimensões — ex.: acesso por *papel* E *projeto* E *sensibilidade*. O dado é protegido pela combinação.
- **Privacidade de saúde — o modelo de ameaça**: quem quer ver o quê? (seguradoras, empregadores, curiosos, governo, família). O paciente é o sujeito, não o objeto.
- **Política BMA**: prontuário acessível a quem *presta cuidado* àquele paciente, com base em "need to know", alertas de acesso, e o direito do paciente de saber quem viu seu registro.
- **Primeiros passos práticos**: acesso baseado em equipe de cuidado, auditoria de acesso, e a dificuldade de definir "equipe".
- **O que realmente dá errado**: acesso excessivo por curiosidade, venda de dados, ausência de auditoria efetiva, dados "desidentificados" que são reidentificáveis (postcode + data de nascimento + sexo).
- **Confidencialidade no futuro**: compartilhamento para pesquisa vs. privacidade (precisa de consentimento/anonimização séria).
- **Social care e educação**: múltiplas partes (escola, assistência social) com interesses legítimos — fronteiras complexas.
- **Chinese Wall**: impede que uma empresa/consultor use informação de um cliente para beneficiar outro concorrente — a "muralha" é dinâmica (uma vez que você viu dados do cliente A, não pode ver do concorrente B).

## Mental Models
- **Fronteira ≠ hierarquia**: em saúde, o problema não é "secreto ou não", é *quem, para qual finalidade, em qual contexto*.
- **O paciente como dono, o profissional como convidado**: acesso por necessidade, não por cargo.
- **Dados "anônimos" raramente são anônimos**: combinação de poucos atributos reidentifica.
- **Chinese Wall**: a *história de acesso* cria a fronteira — não é estática.
- **Auditoria só funciona se alguém olha**: sem revisão e consequência, o log é ficção.

## Anti-patterns
- "Tudo ou nada": ou acesso total ao prontuário ou nenhum — sem granularidade por papel/finalidade.
- Acreditar que **remoção de nome** = anonimização.
- **Paciente sem direito de saber** quem acessou seu dado.
- Vender/ceder dados para terceiros "para pesquisa" sem consentimento real e anonimização robusta.
- Chinese Wall implementada só como "política de negócio" sem enforcement técnico.

## Worked Example
**Prontuário eletrônico hospitalar**: um médico de plantão precisa ver o prontuário do paciente que está atendendo; um pesquisador precisa de dados agregados; a seguradora *não* deve ver detalhes clínicos. Política BMA-like: acesso ao médico vinculado à relação de cuidado (time de cuidado), trilha de auditoria visível ao paciente, dados de pesquisa com anonimização/consentimento. Quando a política é violada (ex.: celebridade internada e funcionário curioso olha o registro), a auditoria + consequência é o controle que fecha o ciclo.

## Key Takeaways
1. **Compartimentação/lattice** expressa fronteiras multidimensionais melhor que hierarquia.
2. Em dados pessoais, o titular é o **sujeito** do design, não o objeto.
3. Anonimização real é difícil — trate "desidentificado" com ceticismo.
4. **Chinese Wall** resolve conflito de interesse dinâmico; auditoria com consequência é indispensável.

## Connects To
- Cap. 9 (MLS/lattice) — base formal.
- Cap. 11 (inference control) — reidentificação e inferência estatística.
- Cap. 26 (privacidade/GDPR) — regulação.
