# Capítulo 3 — Architecting and Designing

**Livro**: Security Chaos Engineering (Shortridge & Rinehart) · `chapters/ch03-architecting-and-designing.md`

## Core Idea
Na fase de arquitetura/design, as decisões mais baratas e mais importantes de resiliência são tomadas. O capítulo orienta a **alocar esforço de segurança pelo contexto local** (effort investment portfolio) e a desenhar em torno dos **dois eixos** que determinam como o sistema falha: **coupling** (acoplamento) e **complexity** (complexidade) — reduzindo ambos e introduzindo **linearidade** onde possível.

## Frameworks Introduced
- **Effort Investment Portfolio**: alocar esforço de segurança como um portfólio, ponderado por contexto local.
- **Os quatro failure modes resultantes do design**.
- **Os dois eixos do design resiliente**: coupling e complexity.
- **Designing to preserve possibilities** (preservar opções futuras).
- **Introduzindo linearidade** nos sistemas.

## Key Concepts
- **Effort investment portfolio**: em vez de aplicar o mesmo nível de segurança em tudo (ou o que o fornecedor vende), **alocar** esforço onde o contexto local indica maior risco/retorno. Contextos diferentes (startup vs. banco; serviço interno vs. exposto) merecem portfólios diferentes.
- **Quatro failure modes de design**: decisões de arquitetura criam padrões previsíveis de falha (acoplamento rígido, dependências ocultas, estados compartilhados, falta de limites claros). Conhecê-los permite desenhar contra eles.
- **Eixos de design resiliente**:
  - **Coupling**: o quanto os componentes dependem uns dos outros.
    - **Tight coupling**: eficiente, mas uma falha se propaga (efeito dominó). Ex.: chamada síncrona direta com timeout curto.
    - **Loose coupling**: componentes conversam por interfaces estáveis/assíncronas (filas, contratos, eventos); falhas ficam contidas.
    - **Trade-off do tight coupling**: latência/consistência vs. contenção de falha.
    - **"Chaos experiments expose coupling"**: experimentos de caos revelam onde o acoplamento escondido transforma falha local em falha global.
  - **Complexity**:
    - **Essential** (inerente ao problema — não dá para eliminar) vs. **accidental** (criada pela solução — dá para cortar).
    - Complexidade demais → modelos mentais erram mais → mais surpresas.
  - **Linearity**: relações causa-efeito previsíveis e proporcionais. Sistemas mais lineares são mais fáceis de entender, modelar e proteger. Reduza não-linearidades (estados implícitos, feedback escondido, interações não óbvias).
- **Preserving possibilities**: escolha designs que mantenham opções abertas (evite abstrações prematuras, lock-in, acoplamento a detalhes que você pode precisar trocar).
- **Designing for interactivity (IAM)**: identidade e acesso são *interativos* — o design do controle de acesso afeta a interação humana e a operação; modelos mentais falhos aqui (ex.: "roles resolvem tudo") causam falhas reais.
- **Navigating flawed mental models**: no design, assuma que o modelo mental de quem opera é incompleto — desenhe affordances e feedback que ajudem a corrigi-lo.

## Mental Models
- **"O design é onde a resiliência nasce ou morre"**: refatorar acoplamento depois é caro; decidir bem agora é barato.
- **Pense em como a falha viaja**: ao desenhar uma conexão, pergunte "se este componente cair, o que mais cai?" (teste mental de propagação).
- **Complexidade acidental é imposto que você paga todo dia**: cada framework/indireção extra aumenta a chance de modelo mental errado.
- **Acoplamento é uma escolha de trade-off, não um defeito**: desacoplar custa (latência, consistência eventual); acoplar custa (cascata). Escolha consciente por ponto crítico.
- **Preserve possibilidades**: decisão que "pinta num canto" hoje vira dívida de resiliência amanhã.

## Anti-patterns
- Segurança **uniforme** ("mesma régua para tudo") ignorando contexto local.
- **Tight coupling síncrono** em caminhos críticos sem circuit breaker/fila.
- **Abstrações prematuras** que escondem comportamento (e viram caixa-preta que ninguém entende).
- Ignorar **complexidade acidental** (stack gigante, muitas indireções).
- Desenhar **IAM/controle de acesso** sem pensar na interação/operação real (roles que ninguém sabe gerenciar).
- Sem **experimentação para expor acoplamento** (só descobre na crise).

## Worked Example
**Dois serviços — pagamento e faturamento**: o design original faz o faturamento chamar pagamento **sincronamente** (tight coupling) para validar o cartão a cada fatura. Quando o pagamento degrada, o faturamento falha em cascata (e o contrário também). Redesenho resiliente: (a) faturamento consome um **evento** "pagamento_aprovado" via fila (loose coupling) — se o pagamento cai, a fila segura e o faturamento continua; (b) contrato de evento estável (versão explícita) reduz complexidade acidental; (c) um **experimento de caos** (ch. 8) derruba o pagamento em staging e mede: o faturamento ficou de pé? A fila acumulou quanto? Isso expõe o acoplamento restante e valida o redesign (linearidade + contenção).

## Key Takeaways
1. Aloque esforço por **contexto local** (portfólio), não uniformemente.
2. Desenhe contra os **eixos**: reduza **coupling** (contenha falhas) e **complexidade acidental**; aumente **linearidade**.
3. **Preserve possibilidades** e desconfie de abstrações prematuras.
4. Use **experimentos para expor acoplamento** antes que a produção o faça.
5. **IAM é interativo**: desenhe controle de acesso pensando em quem opera.

## Connects To
- **Ch 2**: attacker math e avaliação alimentam onde alocar esforço.
- **Ch 7**: a plataforma materializa decisões de design (guardrails, golden paths).
- **Ch 8**: experimentos validam (ou refutam) as premissas de design.
- **Conceitos**: *Normal Accidents* (Perrow) — acoplamento e interação como causas de acidentes.
