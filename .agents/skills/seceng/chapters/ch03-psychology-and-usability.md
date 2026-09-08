# Capítulo 3 — Psychology and Usability

**Livro**: Security Engineering (Anderson) · `chapters/ch03-psychology-and-usability.md`

## Core Idea
O **elo mais fraco** da maioria dos sistemas é o ser humano — e isso não é defeito a ser eliminado, é **fato de design**. Engenharia de segurança que ignora psicologia e usabilidade produz sistemas que os usuários contornam. Compreender como as pessoas percebem risco, tomam decisões e são enganadas é pré-requisito para defesas eficazes.

## Frameworks Introduced
- Aplicação de **psicologia cognitiva, social e comportamental** à segurança (segurança centrada no ser humano).
- **Deception research**: estudo sistemático de como a enganação funciona (vendedores, golpistas, social engineering, phishing).
- Visão pragmática de **senhas** como o caso mais estudado de interação humano-sistema.

## Key Concepts
- **Psicologia cognitiva**: limitações de memória e atenção; humanos são ruins em guardar segredos de alta entropia.
- **Gênero, diversidade e variação interpessoal**: não existe "o usuário"; diferenças afetam risco e design.
- **Psicologia social & a teoria do cérebro social da decepção**: evoluímos para confiar e cooperar — exatamente o que golpistas exploram.
- **Heurísticas e vieses (economia comportamental)**: pessoas superestimam riscos vívidos e subestimam os comuns; desconto hiperbólico (preferem o agora); aversão a perda.
- **Social engineering**: explorar confiança, autoridade, urgência e medo para obter ações/segredos.
- **Phishing**: escala via e-mail/SMS; cada vez mais sofisticado e contextual.
- **OPSEC (segurança operacional)**: o que você divulga (redes sociais, padrões) reduz o esforço do atacante para te enganar.
- **CAPTCHAs**: distinguir humano de máquina; custo real em usabilidade e acessibilidade.

## Mental Models
- **"Seguro se for fácil; inseguro se for difícil"**: se o caminho seguro exige esforço, o usuário escolhe o inseguro.
- **A senha perfeita é impossível de lembrar** — o trade-off memória × segurança é estrutural; o caminho é **password managers** e autenticação sem senha.
- **O atacante não invade o sistema: convence o usuário a abrir a porta**.
- **Segurança percebida ≠ segurança real**: indicadores que ninguém entende não protegem ninguém.

## Anti-patterns
- Políticas de senha que forçam entropia impraticável e levam a anotações/reuso (troca forçada frequente piora).
- Ignorar **recuperação de senha** (o verdadeiro backdoor: perguntas de segurança fáceis de adivinhar).
- Alertas de segurança **incompreensíveis** que ensinam o usuário a clicar "OK" sem ler.
- Tratar o usuário como inimigo (culpá-lo) em vez de desenhar para o erro humano.
- CAPTCHA que exclui pessoas (acessibilidade) sem ganho real de segurança.

## Worked Example
**Phishing de um executivo**: o atacante estuda LinkedIn e e-mails vazados (OPSEC), envia mensagem com urgência ("transferência pendente"), imitando o CFO. Defesas eficazes não são só filtros de spam: (a) **treino e simulação** de phishing; (b) **canais de verificação secundários** fora do e-mail (confirmar por telefone/chat); (c) limites de valor + aprovação dupla (separation of duties); (d) tornar a checagem *fácil* — um botão "verificar remetente". A melhor defesa combina psicologia (tornar a dúvida barata) e processo.

## Key Takeaways
1. Segurança que **luta contra a natureza humana** perde.
2. Entenda **como a enganação funciona** para se defender dela.
3. Senhas: use **gerenciadores**; planeje recuperação segura.
4. Meça usabilidade tanto quanto criptografia — os dois são controles.

## Connects To
- Cap. 2 (o pântano/abuso, insider) — quem explora o humano.
- Cap. 12 (phishing em bancos, fraude APP) — casos reais.
- Cap. 27 (desenvolvimento seguro) — o humano entra no threat model e no design de UX.
