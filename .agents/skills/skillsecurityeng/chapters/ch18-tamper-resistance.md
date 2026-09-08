# Capítulo 18 — Tamper Resistance

**Livro**: Security Engineering (Anderson) · `chapters/ch18-tamper-resistance.md`

## Core Idea
**Tamper resistance** é a arte de fazer hardware (HSMs, smartcards, chips de segurança) resistir a **ataques físicos ativos** — microprobing, remoção de camadas, análise de falhas, extração de chaves. Anderson mostra que nenhuma proteção física é absoluta: a questão é *custo e tempo* do ataque vs. valor protegido, e que o elo mais fraco costuma ser a **interface confiável** e o **ecossistema** (avaliação, mercado de "lemons", risco residual).

## Frameworks Introduced
- História da tamper resistance (de cofres a chips) e dos **HSMs (Hardware Security Modules)**.
- Arquitetura de **smartcards e security chips** (sensor mesh, camadas, RNGs, PUFs).
- **Regimes de avaliação** (FIPS 140, Common Criteria para hardware).
- Conceito de **risco residual** e o "trusted interface problem".

## Key Concepts
- **HSMs**: módulos de hardware que guardam chaves e fazem cripto, protegidos contra violação física; usados em bancos, CAs, nuvem. Se violados, extraem-se chaves que protegem bilhões.
- **Smartcards/security chips**:
  - *Arquitetura*: chip com camadas de proteção, sensores (luz, temperatura, tensão, malha), e lógica que apaga segredos sob ataque.
  - *Evolução da segurança*: a cada geração de ataque (microprobing, FIB — focused ion beam, glitching) uma nova geração de defesa.
  - *RNGs e PUFs*: geradores de números aleatórios (fonte clássica de fraqueza) e **PUFs** (funções físicas não clonáveis que derivam identidade de variações de fabricação).
  - *Chips maiores* (TPM, secure elements, enclaves).
- **O risco residual**:
  - **Trusted interface problem**: o HSM/chip pode ser perfeito, mas os dados entram/saem por uma interface (o computador hospedeiro) que o atacante controla — você confia na tela/teclado, que podem estar comprometidos.
  - **Conflitos**: requisitos conflitantes (avaliação vs. custo vs. tempo de mercado).
  - **Lemon market e risk dumping**: quando compradores não conseguem avaliar a qualidade da tamper resistance, produtos ruins competem com bons (informação assimétrica — cap. 8); e o risco é "despejado" no elo que não pode auditar.
  - **Security-by-obscurity**: esconder o design em vez de depender de avaliação aberta.
  - **Ambientes que mudam**: o que era seguro num contexto (chip bancário) torna-se alvo quando usado noutro (IoT com o mesmo chip).
- **O que se deve proteger de fato**: priorizar segredos de longa vida e alto valor; nem tudo merece tamper resistance cara.

## Mental Models
- **Nada é fisicamente inviolável — só mais caro de violar**: tamper resistance compra tempo e eleva custo; não é absoluta.
- **O adversário com acesso físico ao chip tem uma enorme vantagem**: o jogo é assimétrico (ele tem o hardware e tempo).
- **Proteja a interface, não só o chip**: o "trusted interface problem" mostra que o hospedeiro (tela/teclado/SO) costuma ser o elo fraco — mesmo com HSM perfeito.
- **Avaliação/mercado importam**: sem avaliação confiável, o comprador não sabe o que comprou (lemons).
- **Custo de violação deve exceder o valor protegido** — senão não faz sentido.

## Anti-patterns
- Assumir que "está num HSM/chip" = seguro, ignorando o **hospedeiro comprometido**.
- Depender de **obscuridade** do design.
- Segredos de **longa vida em chips de baixo custo** sem o nível certo de proteção.
- Não considerar **ataques físicos** no threat model (roubo de hardware, supply chain).
- Comprar tamper resistance **sem avaliação independente** (lemons market).

## Worked Example
**HSM de um provedor de nuvem (KMS)**: guarda chaves de clientes; faz assinatura/decifra sob demanda. Ameaça: atacante com acesso físico (funcionário, força-tarefa) tentando extrair chaves. Defesas: HSM certificado (FIPS 140-2/3) com sensores e auto-destruição de chaves, mais **controles de processo** (dual control para acesso, logs, supervisão) — porque o ataque mais barato não é furar o chip, é **subornar/enganar o operador** ou atacar a API do HSM (o software que o usa). Lição: tamper resistance precisa vir acompanhada de processo e de proteger a interface.

## Key Takeaways
1. Tamper resistance = **elevar custo/tempo** da violação física, não torná-la impossível.
2. O **elo fraco real** costuma ser a interface/hospedeiro e o processo, não o chip.
3. Avaliação independente evita o mercado de "lemons".
4. Proteja **o que vale a pena**; nem todo segredo justifica HSM.

## Connects To
- Cap. 19 (side channels) — ataques físicos não-invasivos complementares.
- Cap. 20 (HSMs em engenharia cripto avançada) — ataques a HSMs reais.
- Cap. 8 (economia/lemons) e 28 (avaliação/FIPS/CC).
