# Capítulo 2 — Who Is the Opponent?

**Livro**: Security Engineering (Anderson) · `chapters/ch02-who-is-the-opponent.md`

## Core Idea
Boa engenharia de segurança exige **conhecer o adversário**: recursos, objetivos, paciência e limitações. Anderson organiza o espaço de atacantes em **quatro grandes classes** — spooks (serviços de inteligência), crooks (criminosos), geeks (curiosos) e "the swamp" (o pântano: conflitos pessoais/emocionais) — e mostra como cada um molda o que você precisa defender e como.

## Frameworks Introduced
- **Taxonomia de adversários** com base em *recursos × motivação × persistência*.
- Noção de **ecossistemas criminais** (crime como indústria com divisão de trabalho).
- Distinção crucial: ameaça de **inteligência estatal** vs. **crime organizado** vs. **abuso pessoal** — cada uma exige defesas diferentes.

## Key Concepts
- **Spooks (inteligência)**: adversários com orçamentos gigantescos e objetivos de longo prazo. **Five Eyes** (EUA/UK/Canadá/Austrália/NZ) e suas agências (NSA, GCHQ); **China** (MSS/PLA, "criminals com diplomas" — roubo de propriedade intelectual + vigilância), **Rússia** (GRU/SVR, guerra cibernética, desinformação). Atacam em massa, interceptam infraestrutura, buscam acesso persistente.
- **Atribuição**: difícil e cara; em muitos casos só a inteligência estatal consegue atribuir com confiança — o que afeta defesa e resposta.
- **Crooks (criminosos)**: motivados por dinheiro, seguem o dinheiro. **Infraestrutura criminal** (botnets, malware-as-a-service), ataques a bancos e pagamentos, **ecossistemas setoriais** (fraude em cartões, ransomware), **ataques internos** (insiders), **crimes de CEO** (fraude corporativa vinda de cima), **whistleblowers**.
- **Geeks**: curiosidade, reputação, desafio intelectual. Capacidade técnica alta, mas motivação limitada e intermitente.
- **The Swamp**: a categoria mais negligenciada e mais próxima do cidadão comum — **hacktivismo e campanhas de ódio**, **material de abuso sexual infantil**, **bullying escolar e no trabalho**, **abuso em relacionamentos íntimos** (stalking digital, controle por apps). Adversário com motivação emocional forte e persistência alta, mesmo com poucos recursos.

## Mental Models
- **"Follow the money"** para crime; **"follow the secrets"** para espionagem; **"follow the emotion"** para o pântano.
- **Modelo de capacidade**: espiões podem quebrar defesas de propósito geral; criminosos atacam o caminho de menor resistência *em escala*; geeks atacam o que é interessante; o pântano ataca a pessoa.
- **Insider como adversário**: muitas das maiores perdas vêm de dentro — funcionários, executivos ou pessoas com acesso legítimo.
- **Adversários se adaptam**: a defesa de ontem gera a evolução do ataque de amanhã (co-evolução).

## Anti-patterns
- Modelar apenas o "hacker externo solitário" e ignorar insider, estado e abuso pessoal.
- Subestimar adversários com poucos recursos mas **muita persistência e motivação** (stalking, bullying).
- Achar que criptografia resolve tudo sem considerar que o adversário pode ser o **operador do sistema** ou um **estado** com poderes legais.

## Worked Example
**Fraude em banco varejo** pode vir de: (a) criminosos usando malware e phishing em massa (ecossistema: writer → botnet → casher); (b) um **funcionário** do call center vendendo dados ou aprovando transações; (c) **grupos estatais** usando a infraestrutura do banco para espionagem; (d) um **ex-parceiro** fazendo stalking/chantagem contra um cliente. Cada ameaça exige controles diferentes: análise de anomalias e limites (a), segregação de deveres + monitoramento de acesso (b), segmentação e monitoramento de rede (c), suporte e educação do usuário (d).

## Key Takeaways
1. **Nunca** projete contra um adversário genérico — defina a classe específica.
2. Estado, crime, geeks e abuso pessoal exigem **estratégias diferentes**.
3. Insiders e o "pântano" são **mais comuns** do que a mídia sugere.
4. Adversários **evoluem**; revise o modelo de ameaça continuamente.

## Connects To
- Cap. 1 (framework) — adversário alimenta o threat model.
- Cap. 8 (economia) — por que criminosos seguem o dinheiro e como reduzir o ROI do ataque.
- Cap. 26 (vigilância) — papel dos serviços de inteligência na sociedade.
