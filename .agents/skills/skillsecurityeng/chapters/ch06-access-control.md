# Capítulo 6 — Access Control

**Livro**: Security Engineering (Anderson) · `chapters/ch06-access-control.md`

## Core Idea
Controle de acesso decide **quem pode fazer o quê em qual recurso** — é a camada que transforma política em mecanismo dentro de sistemas operacionais e aplicações. Anderson cobre os modelos (ACL, capabilities, DAC/MAC), como OS reais (Unix, Windows, macOS, Android, iOS) implementam, e a longa história de **o que dá errado** (do stack smashing a falhas de UI).

## Frameworks Introduced
- Modelos de autorização: **ACL (access control lists)** vs. **capabilities**; **grupos/roles**.
- **DAC (discretionary)** vs. **MAC (mandatory)**; e a evolução para **IFC (Information Flow Control)**.
- **Sandboxing** e **virtualização** como fronteiras modernas.
- **Proteção de hardware** (anéis de privilégio em Intel/ARM).

## Key Concepts
- **ACLs**: lista por objeto dizendo quem acessa; simples, mas problemas de escala e confirmação (confused deputy).
- **Capabilities**: token de acesso que o sujeito possui; flexível, mas difícil de revogar e controlar.
- **Unix**: usuário/grupo, permissões rwx, setuid — e os riscos clássicos de suid/root.
- **DAC**: o dono do recurso decide. **MAC**: política global com rótulos que nem o dono pode violar.
- **macOS**: sandboxing de apps, entitlements, TCC (permissões de privacidade).
- **Android**: permissões por app, sandbox por UID, modelo de runtime permissions.
- **Windows**: ACLs NTFS/registro, tokens, UAC, integrity levels.
- **Middleware**: servidores de aplicação e o problema de autorização no nível errado.
- **Sandboxing**: isolar código não confiável (contenção de dano).
- **Virtualização/hypervisors**: isolamento forte entre OS.
- **Hardware**: modos de anel em x86 e ARM (EL0–EL3, TrustZone) — base para OS e enclaves.
- **O que dá errado**: **smashing the stack** (buffer overflow clássico → execução arbitrária), ROP, **falhas de UI** (confused deputy, clickjacking), **environmental creep** (permissões que se acumulam).

## Mental Models
- **Autorização ≠ autenticação**: provar *quem é* é diferente de provar *o que pode fazer*.
- **Toda fronteira será atacada pelo caminho mais curto**: se a política é "só admin edita", o atacante procura um bug de escalonamento, um setuid, um confused deputy, ou simplesmente engana o admin (cap. 3).
- **Least privilege + separation of duties** como princípios reguladores.
- **O default é negar**: falhas quase sempre vêm de defaults permissivos.
- **Confinamento > detecção**: se você não pode impedir a exploração, **contê-la** (sandbox) limita o dano.

## Anti-patterns
- Rodar serviços como **root/admin**.
- Aplicações que pedem **todas as permissões** e as mantêm para sempre.
- Confiar que "está atrás do firewall / na rede interna".
- Ignorar **memória insegura** (C/C++ sem mitigação) — origem do stack smashing.
- Autorização feita só na UI, não no servidor/backend.

## Worked Example
**App Android com vazamento**: um app legítimo pede permissão de contatos; o usuário concede (default confortável). A falha real seria se o app tivesse acesso a dados de *outros apps* sem sandbox. O modelo Android (UID por app + permissões granulares + runtime prompt) existe justamente para impor a fronteira; o atacante tenta **confused deputy** (um app privilegiado enganado a agir em nome do atacante) ou escalonar via bug nativo. Defesa: manter permissões mínimas, atualizar, e tratar cada app como não confiável.

## Key Takeaways
1. Escolha o **modelo certo** (ACL/capability/DAC/MAC) para o domínio; entenda as trocas.
2. **Least privilege e deny-by-default** valem em todo sistema.
3. Conheça os mecanismos do seu OS (sandbox, anéis, permissões) e use-os.
4. **Buffer/memória** e **falhas de UI** continuam sendo vetores reais de escalonamento.

## Connects To
- Cap. 9 (MLS/IFC) — políticas obrigatórias e rótulos.
- Cap. 10 (boundaries) — onde desenhar as fronteiras.
- Cap. 7 (distributed systems) — autorização em sistemas distribuídos.
