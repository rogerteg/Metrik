# Capítulo 22 — Phones

**Livro**: Security Engineering (Anderson) · `chapters/ch22-phones.md`

## Core Idea
O telefone — primeiro fixo, depois **smartphone** — é um estudo de segurança em duas eras. A **rede telefônica** tradicional foi atacada por fraude de tarifação e sinalização (phreaking, SS7). O **smartphone** virou o computador pessoal dominante: a segurança agora é sobre o **ecossistema de apps** (Android/iOS), a plataforma e os dados que ela concentra. Anderson mostra como plataforma, sinalização e economia moldam a segurança móvel.

## Frameworks Introduced
- Ataques à **rede telefônica** (tarifação, sinalização, switching, feature interaction).
- **Segurança da plataforma móvel**: sandbox, permissões, ecossistemas de apps (Android vs. iOS).
- **Economia da segurança em telecom**.
- Modelos de **2FA por telefone** e seus riscos.

## Key Concepts
- **Ataques à rede fixa**:
  - **Ataques à tarifação** (call metering) — fraudar a conta.
  - **Ataques à sinalização** — o sistema de controle (SS7/IN) é separado da voz e foi historicamente pouco protegido; permite redirecionar, escutar e **interceptar SMS/2FA**.
  - **Ataques ao switching/configuração**; **feature interaction** (recursos que se combinam em comportamentos inseguros).
  - **Insecure end systems** e **VOIP** (nova superfície: chamadas pela internet).
  - **Fraudes pelas próprias operadoras** (overcharging, práticas abusivas).
  - **Economia das telecom**: incentivos que levaram a subinvestimento em segurança da sinalização.
- **Indo para o móvel — GSM**: a segurança celular de 2G (crypto fraca, **interceptação**, **fake base stations / IMSI catchers**), evolução 3G/4G/5G (melhor autenticação), mas **falhas gerais das operadoras (MNO)**: SS7/Signaling vulnerabilities que permitem sequestrar números — o que quebra **SMS 2FA**.
- **Segurança da plataforma**:
  - **Ecossistema de apps Android**: código aberto, sideloading, permissões, malware em lojas alternativas; modelo de sandbox por UID + permissões.
  - **Ecossistema de apps Apple (iOS)**: loja curada, sandbox rígido, mas **apps abusivos** e privacidade (rastreamento).
  - **Questões transversais**: permissões excessivas, apps que coletam dados, **malware bancário móvel**, adware, e o telefone como **repositório de tudo** (fotos, 2FA, e-mail, banco) = alvo único valioso.

## Mental Models
- **O telefone é o cofre que carrega a chave do cofre**: contém e-mail, SMS de 2FA, apps de banco, fotos — comprometer o telefone compromete tudo.
- **SMS 2FA é fraco**: a sinalização (SS7) e o porting/sequestro de número permitem interceptar SMS — use **app authenticator/chaves** para alto valor.
- **Plataforma ≠ rede**: a segurança móvel moderna é decidida no **SO/apps**, não na rede celular.
- **Ecossistema de apps define o risco**: loja curada + sandbox + permissões granulares (iOS/Android moderno) reduzem malware, mas apps legítimos abusivos continuam sendo vetor.
- **Feature interaction e sinalização**: sistemas de controle separados e legados são o calcanhar de Aquiles das telecom.

## Anti-patterns
- Confiar em **SMS como segundo fator** para contas de alto valor.
- Conceder **permissões excessivas** a apps (contatos, localização, SMS) sem necessidade.
- **Sideloading** de apps fora da loja em plataforma que não foi feita para isso.
- Operadoras/empresas ignorando **segurança da sinalização** (SS7/Diameter) e porting.
- Tratar o smartphone como "só um telefone" no threat model — é um computador com tudo.

## Worked Example
**Sequestro de número para roubar conta**: atacante faz *porting* (transfere o número para um SIM dele) ou explora SS7, recebe o SMS de 2FA do banco, e redefine a senha. Defesa do usuário: usar **app autenticador/chave de segurança** em vez de SMS, e PIN extra na operadora (anti-porting). Defesa do provedor: **detecção de porting anômalo** e não depender de SMS para resetar contas sensíveis. Lição: o "segundo fator" só é forte se estiver **fora do canal que o atacante controla**.

## Key Takeaways
1. A **sinalização telefônica legada (SS7)** e o **porting** quebram o SMS 2FA — prefira autenticadores/chaves.
2. **Plataforma móvel + ecossistema de apps** é onde a segurança do smartphone é decidida.
3. O smartphone é o **ativo mais valioso** do usuário — trate-o como tal no threat model.
4. **Permissões mínimas** e lojas/instalação controladas reduzem a maior parte do risco.

## Connects To
- Cap. 4 (protocolos/2FA) — o que torna um segundo fator forte.
- Cap. 12 (pagamentos móveis, M-Pesa) — dinheiro no telefone.
- Cap. 26 (vigilância) — celular como dispositivo de rastreamento.
