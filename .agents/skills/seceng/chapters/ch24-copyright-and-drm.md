# Capítulo 24 — Copyright and DRM

**Livro**: Security Engineering (Anderson) · `chapters/ch24-copyright-and-drm.md`

## Core Idea
DRM (Digital Rights Management) é o **"crypto dream" que falhou** — e a falha é instrutiva. Anderson analisa por que sistemas de proteção de conteúdo (DVD, Windows Media, FairPlay, software) repetidamente quebram: o problema não é matemático, é que o **conteúdo precisa ser decifrado/executado num dispositivo que o atacante controla** ("the analog hole" / trusted interface problem) e os **incentivos econômicos são perversos**. Lições valem para qualquer sistema que tenta controlar o que o usuário faz com o próprio hardware.

## Frameworks Introduced
- História do **copyright** e sua aplicação a software, música, vídeo/pay-TV, DVD.
- **DRM em computadores de propósito geral** vs. hardware dedicado.
- **Information hiding** (watermarks, steganografia) e seus limites.
- **Política e economia do DRM** (lobby, quem se beneficia).
- **Accessory control** (controle de acessórios — impressoras, cartuchos).

## Key Concepts
- **Copyright**: o que protege e por quê; a tensão entre criadores, distribuidores e consumidores.
- **Software e DRM**: licenciamento, chaves de produto, ativação — e a luta entre proteção e usabilidade.
- **Free software / free culture**: o modelo alternativo que resolve incentivos sem DRM (open source, Creative Commons).
- **Livros, música e vídeo**: os ataques à distribuição digital e a resposta da indústria.
- **DVD/CSS**: exemplo clássico — o esquema de cripto do DVD foi quebrado (DeCSS) porque o *player* precisa decifrar no dispositivo do usuário; uma vez que o conteúdo sai como dados, é copiável (**analog hole**).
- **DRM em PCs**:
  - **Windows Media DRM**: tentativa de proteger áudio/vídeo no PC; quebrada porque o PC é do usuário.
  - **Fairplay, HTML5 (EME)**: DRM no navegador; pressões por interoperabilidade.
  - **Software obfuscation**: esconder a lógica — defesa fraca contra engenharia reversa determinada.
  - **Gaming, cheating e DRM**: a indústria de jogos lida com trapaça e pirataria; sempre uma corrida.
  - **Peer-to-peer**: a distribuição descentralizada que o DRM tenta (sem sucesso) conter.
  - **Gerenciando direitos de design de hardware**: proteger projetos (cadeia de suprimentos, clonagem).
- **Information hiding**: **watermarks** e *copy generation management* (marcar cópias) e **steganografia** (esconder informação em conteúdo); **ataques a esquemas de marcação** (remoção, distorção, collusion).
- **Política**: o **lobby da propriedade intelectual** e a pergunta **"quem se beneficia?"** — muitas vezes o DRM protege o *distribuidor*, não o *criador*, e custa caro ao consumidor.
- **Accessory control**: usar DRM/patentes para controlar **acessórios** (cartuchos de tinta, refis) — lock-in econômico (cap. 8).

## Mental Models
- **"O conteúdo tem que ser legível para ser visto"** → no momento em que é decifrado no dispositivo do usuário, o atacante pode capturá-lo (**analog hole**). Proteção absoluta de conteúdo em hardware do usuário é impossível.
- **DRM vence quando o "custo de quebrar" > "benefício de quebrar"** para o usuário típico — é economia, não matemática.
- **Quem controla a *chave/decodificação* controla o ecossistema** — por isso a luta por hardware dedicado (set-top boxes, consoles) e por padronização (CSS, AACS, HDCP).
- **Watermark ≠ DRM**: marcação detecta cópia (forense), não a impede.
- **O DRM mais eficaz não é técnico — é legal/econômico** (DMCA, termos de serviço, modelos de assinatura que tornam a pirataria desnecessária).

## Anti-patterns
- Tentar tornar **impossível** o que é fisicamente impossível (copiar conteúdo decifrado) → gasto infinito.
- **Prejudicar usuários legítimos** (usabilidade) para deter piratas → incentiva o contorno.
- Tratar **obfuscation** como segurança real.
- **Lock-in de acessórios** via DRM — antagoniza clientes e atrai regulação.
- Ignorar quem realmente se beneficia (distribuidor vs. criador vs. sociedade).

## Worked Example
**Proteger um serviço de streaming**: em vez de tentar impedir *toda* cópia (impossível — o usuário pode gravar a tela), o modelo eficaz combina: (a) **assinatura conveniente** (custo baixo, catálogo vasto — reduz o incentivo a piratear); (b) **HDCP/EME** para dificultar a captura casual; (c) **watermark forense** para rastrear vazamentos; (d) **termos legais**. A segurança vem de **incentivos + conveniência + forense**, não de cripto inquebrável no cliente.

## Key Takeaways
1. **DRM absoluto é impossível** (analog hole); o objetivo realista é elevar custo e reduzir incentivo.
2. **Incentivos e modelos de negócio** (assinatura, conveniência) protegem conteúdo melhor que cripto no cliente.
3. Watermarks são **forense**, não prevenção.
4. Desconfie de DRM que beneficia o **distribuidor** às custas do criador/consumidor — e que vira lock-in.

## Connects To
- Cap. 20 (crypto dreams que falharam) — DRM é o arquétipo.
- Cap. 8 (economia/lock-in) — accessory control e tying.
- Cap. 18 (trusted interface problem) — por que o cliente é o elo fraco.
