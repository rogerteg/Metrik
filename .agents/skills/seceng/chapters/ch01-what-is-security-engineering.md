# Capítulo 1 — What Is Security Engineering?

**Livro**: Security Engineering (Anderson) · **Arquivo fonte**: `chapters/ch01-what-is-security-engineering.md`

## Core Idea
Segurança **não é uma feature** que se adiciona no fim: é uma propriedade sistêmica de um sistema que opera sob a ação de um **adversário inteligente e adaptativo**. Engenharia de segurança é a disciplina de especificar uma política, modelar quem ataca, escolher mecanismos e obter **garantia** de que a política se sustenta.

## Frameworks Introduced
- O **framework central do livro**: *policy → threat model → mechanisms → assurance* (política → modelo de ameaça → mecanismos → garantia).
- A noção de **dependability** (confiabilidade) como guarda-chuva: disponibilidade, confiabilidade, segurança (safety), integridade, confidencialidade.
- Segurança como **caso especial de design sob adversário** — diferente de tolerância a falhas acidentais.

## Key Concepts
- **Política de segurança**: declaração do que o sistema deve (ou não deve) permitir — *antes* dos mecanismos. Ex.: "apenas médicos autorizados leem o prontuário".
- **Modelo de ameaça**: não existe sistema "seguro" em abstrato — seguro *contra quem*, com quais recursos, por quanto tempo?
- **Mecanismo**: criptografia, controle de acesso, auditoria, etc. — meios para impor a política.
- **Garantia (assurance)**: evidência de que os mecanismos funcionam mesmo sob ataque; o que distingue engenharia de "esperança".
- **Adversário**: ao contrário de falhas aleatórias, o atacante *escolhe* onde atacar e aprende com cada tentativa.

## Mental Models
- **Os 4 exemplos do capítulo** como teste mental para qualquer sistema — o mesmo método (framework) aplicado a mundos muito diferentes:
  1. **Banco** (dinheiro/registros) — fraude interna e externa;
  2. **Base militar** (vidas/segredos) — adversário com recursos quase ilimitados;
  3. **Hospital** (prontuários/equipamentos) — privacidade + segurança de pacientes;
  4. **Casa/smartphone** (dados pessoais, conveniência) — usuário comum como elo mais fraco.
- **"Computação não é só matemática"**: os limites do mundo real (pessoas, física, economia, política) importam tanto quanto os algoritmos.
- **Segurança relativa, não absoluta**: "seguro o suficiente" depende do valor do ativo, do custo do controle e da persistência do adversário.

## Anti-patterns
- Tratar segurança como checklist de ferramentas (firewall + antivírus) sem modelo de ameaça.
- Confiar em **obscuridade** como controle principal.
- Desenhar primeiro e "endurecer" depois.
- Ignorar o **elemento humano** (usuários, operadores, insiders).

## Worked Example
**Banco simples**: a política é "somente o titular e seus autorizados movimentam a conta, e toda movimentação fica registrada". O modelo de ameaça inclui: ladrão externo (malware, phishing), **funcionário desonesto** (insider — muitas vezes a maior ameaça em finanças), e fraude em massa. Mecanismos: autenticação de cliente, double-entry bookkeeping com logs, segregação de funções, detecção de anomalias. Garantia: auditoria, testes de penetração, revisão independente. Perceba que o **mesmo framework** orienta o banco, o hospital e a casa — só mudam ameaças e pesos.

## Key Takeaways
1. Comece pela **política**, não pela ferramenta.
2. Defina **contra quem** você se protege e com que consequências.
3. Segurança é **multidisciplinar**: pessoas, economia, física e processos.
4. Sem **garantia**, você tem esperança, não segurança.

## Connects To
- Cap. 2 (quem é o adversário) — aprofunda o modelo de ameaça.
- Cap. 27 (desenvolvimento seguro) — como operacionalizar na prática.
- Cap. 8 (economia) — por que a escolha de controles é uma decisão econômica.
