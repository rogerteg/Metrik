# Capítulo 8 — Economics

**Livro**: Security Engineering (Anderson) · `chapters/ch08-economics.md`

## Core Idea
Muitos problemas de segurança **não são técnicos — são econômicos**. Sistemas ficam inseguros quando **quem decide sobre segurança não é quem sofre as consequências** (externalidades), quando há **lock-in**, informação assimétrica e incentivos perversos. Anderson estabelece a economia da segurança como disciplina: entender incentivos explica por que Windows foi tão inseguro, por que patching atrasa e por que o crime cibernético prospera.

## Frameworks Introduced
- **Economia clássica** (mercados, monopólio) aplicada a software.
- **Economia da informação**: por que mercados de informação são diferentes — bens de informação, lock-in, **informação assimétrica**, **public goods**.
- **Teoria dos jogos**: dilema do prisioneiro, jogos repetidos/evolutivos.
- **Teoria de leilões** (contexto: alocação de recursos e defesa).
- **Economia da segurança e confiabilidade**: o coração do capítulo.

## Key Concepts
- **Externalidades**: se o custo do fracasso recai sobre terceiros, não há incentivo para investir em segurança. Ex.: software com vulnerabilidades afeta toda a internet.
- **Lock-in e custos de troca**: clientes presos reduzem pressão competitiva por segurança; **tying** e DRM como ferramentas de lock-in.
- **Informação assimétrica**: o vendedor sabe mais sobre a segurança do produto do que o comprador → mercado de "lemons" (produtos ruins expulsam bons).
- **Public goods**: segurança muitas vezes é um bem público (ex.: o esforço de patching beneficia a todos) → subinvestimento; daí a importância de *disclosure coordenado* e infraestrutura compartilhada.
- **Por que o Windows (historicamente) era tão inseguro**: dominância de mercado + foco em compatibilidade/features + externalidades (quem paga o prejuízo de malware não é a Microsoft) + atraso estrutural em patching.
- **Gerenciamento do ciclo de patching**: o custo de aplicar patch (tempo de inatividade, quebras) vs. risco; incentivos de quem decide.
- **Modelos estruturais de ataque e defesa**: gasto marginal de atacante vs. defensor (arms race econômica).
- **Guards perversamente motivados**: o "guarda" (intermediário) pode ter incentivo a deixar passar (ex.: provedor que lucra com tráfego fraudulento).
- **Economia da privacidade**: por que empresas coletam dados além do necessário (valor do dado, externalidades).
- **Organizações e comportamento humano**: incentivos internos, bônus, cultura.
- **Economia do cybercrime**: crime como indústria; reduzir o **ROI do atacante** e aumentar o **custo** e o **risco de punição**.

## Mental Models
- **"Quem paga? Quem sofre? Quem decide?"** — as três perguntas que explicam quase toda insegurança.
- **O mercado sozinho não conserta segurança** (externalidades, informação assimétrica) → papel de regulação, padrões e responsabilidade.
- **Patching é um dilema do prisioneiro**: todos esperam o outro aplicar primeiro.
- **Defesa segue o dinheiro**: o criminoso ataca onde o ROI é maior e o risco menor.
- **Segurança como arms race com retornos decrescentes**: o defensor gasta para elevar o custo do atacante, não para torná-lo zero.

## Anti-patterns
- Responsabilizar **o usuário final** por riscos criados por quem vende/decide (risk dumping).
- **Security by obscurity** como estratégia econômica (esconder falha em vez de corrigir incentivo).
- Medir segurança só por **gasto** (o que importa é alinhamento de incentivos e redução de perda).
- Punir disclosure em vez de recompensar (bugs escondidos = mais dano).
- Ignorar o **guarda com incentivo perverso** (intermediário que se beneficia do problema).

## Worked Example
**Fraude em pagamentos online**: historicamente, quando o **emissor do cartão** (não o lojista) arcava com fraude online, os lojistas tinham pouco incentivo para adotar 3-D Secure/autenticação forte — o prejuízo era de outro. Quando a **responsabilidade (liability) mudou** para o lado que *pode* implementar a defesa, a adoção de controles acelerou. Lição central: **mova a responsabilidade para quem decide** (ou dê a quem decide a skin in the game) e o comportamento melhora.

## Key Takeaways
1. Insegurança persistente geralmente é **falha de incentivo**, não de tecnologia.
2. **Externalidades e informação assimétrica** explicam mercados de segurança falhos.
3. Responsabilize **quem decide**; reduza o ROI do atacante.
4. Segurança é frequentemente um **bem público** — exige coordenação e regulação.

## Connects To
- Cap. 1 e 2 — incentivos explicam escolhas de controles e o comportamento dos criminosos.
- Cap. 12 (pagamentos) e 24 (DRM) — casos ricos em economia.
- Cap. 27 (desenvolvimento) — como incentivos moldam organizações e processos.
