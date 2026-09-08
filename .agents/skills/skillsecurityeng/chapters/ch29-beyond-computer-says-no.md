# Capítulo 29 — Beyond "Computer Says No"

**Livro**: Security Engineering (Anderson) · `chapters/ch29-beyond-computer-says-no.md`

## Core Idea
Conclusão do livro: a engenharia de segurança evoluiu de "ilhas" (criptógrafos, especialistas em SO, alarmes, química de tintas de dinheiro) para uma **disciplina de sistemas** que abraça pessoas, economia e política. Anderson aponta os três grandes desafios do futuro — **complexidade social, sustentabilidade e política/poder** — e o que "computer says no" (negar por padrão, sem nuance) ensina sobre sistemas que lidam com humanos.

## Frameworks Introduced
- Visão de **segurança como relação e exercício de poder**, não como propriedade escalar.
- Os três próximos desafios: **complexidade**, **sustentabilidade**, **política**.
- A disciplina como convergência de ciência da computação, economia, psicologia e **ciência política**.
- **Democracia e governança** como mecanismos de aprendizado social.

## Key Concepts
- **Do arquipélago à disciplina**: a integração de especialidades (o químico de tintas, o criptógrafo, o especialista em alarmes) foi necessária porque os sistemas reais cruzam todas as fronteiras.
- **Ataques migram da tecnologia para as pessoas**: sistemas precisam ser resilientes a erro, acaso e **coerção** — não só a malware. Entender funcionários, clientes, usuários e **bystanders** (terceiros afetados) é essencial.
- **Metas de proteção sutis e conflitantes**: accountability vs. deniability, privacidade do usuário vs. acesso do anunciante — "agradar a ambos" costuma ser impossível.
- **Falhas persistentes são falhas de incentivo**: "se Alice protege o sistema e Bob paga o custo do fracasso, espere problemas" (o mote da *security economics*, catalisada pela 1ª edição). A 2ª edição somou **usabilidade/psicologia**.
- **Os três desafios**:
  1. **Complexidade (social)**: 70 anos de ferramentas para complexidade *técnica*; agora o limite é a *social* — carros autônomos funcionam na estrada, mas não em ruas cheias de gente imprevisível; cripto não impede que a "estrutura social apareça" (grafos, metadados); "computer says no" afasta clientes. Não basta interagir com *um* humano — é preciso funcionar com *muitos* humanos interagindo.
  2. **Sustentabilidade**: software em tudo, conectado a tudo → é preciso **patch e manutenção por 20–40 anos** (carros, pacemakers, subestações). Não sabemos fazer isso; sem resolver, a automação será ruim para o planeta. "Smart" muitas vezes = "será descartado mais cedo, quando o computer disser no".
  3. **Política/poder**: segurança é **relação**, não pó mágico — é sobre *como os sistemas exercem poder*. Quem perde e quem ganha quando "computer says no"? Quem decide o discurso político (Facebook), o rastreio de contatos (Apple/Google), o reconhecimento facial (Amazon/Microsoft/Google fora da China)? Os problemas mais intráveis da próxima década serão de **governança**.
- **Estabilidade do cybercrime** apesar da mudança tecnológica total → não é fundamentalmente sobre tecnologia; é sobre **incentivos e governança**.
- **Democracia como aprendizado social**: assim como indivíduos aprendem com a experiência, sociedades aprendem e se adaptam — a democracia é o mecanismo-chave; engenheiros devem se alfabetizar em ciência política, além de economia e psicologia.

## Mental Models
- **"Computer says no" como anti-padrão**: sistemas que negam sem explicação, contexto ou recurso perdem confiança e afastam pessoas — e, para usuários sob coerção/erro, a rigidez vira dano.
- **Segurança não é escalar, é relacional**: "seguro" depende de *para quem* e *contra quem*; cada decisão de design distribui poder.
- **Incentivos > tecnologia**: falhas que persistem por uma década com tecnologia totalmente nova são falhas de incentivo e governança.
- **Humanos em rede, não humanos isolados**: o objeto do design é o sistema sociotécnico inteiro.
- **Sustentabilidade = segurança no tempo**: o que não pode ser mantido por décadas se torna vulnerável.
- **A profissão precisa de ciência política**: quem controla infraestrutura define políticas públicas de facto.

## Anti-patterns
- Tratar segurança como **feature técnica isolada** ("sprinkle fairy dust").
- **"Computer says no"** inflexível: negar sem contexto, explicação ou caminho de recurso.
- Ignorar **terceiros afetados (bystanders)** e a estrutura social nos dados.
- Construir "smart devices" **descartáveis** sem plano de manutenção de décadas.
- Especialistas que só falam de confidencialidade (ou só de uma ilha) sem visão de sistemas.

## Worked Example
**Um serviço que nega acesso a um usuário sob suspeita de fraude**: se o sistema simplesmente diz "não" (computer says no), o usuário legítimo fica preso sem recurso — e o fraudador segue em frente. Um design maduro combina: (a) **detecção** com baixo falso positivo; (b) **explicação e caminho de recurso humano** (apelação); (c) **avaliação de incentivos** (quem arca com o erro?); (d) **governança** (regras claras, supervisão, accountability). A lição do capítulo: segurança eficaz negocia com humanos — não apenas nega.

## Key Takeaways
1. Segurança moderna é **sistemas + pessoas + incentivos + poder** — não só tecnologia.
2. Três frentes futuras: **complexidade social, sustentabilidade (manutenção de décadas) e política/governança**.
3. **Falhas persistentes são de incentivo** — "Alice protege, Bob paga".
4. Engenheiros de segurança devem aprender **economia, psicologia e ciência política**; a democracia é o mecanismo de adaptação social.

## Connects To
- Cap. 1 e 8 — o fio condutor (framework + incentivos) fechando o ciclo.
- Cap. 27/28 — como construir e garantir sistemas, agora num contexto social/político.
- Cap. 25/26 — automação, ML, vigilância e governança.
