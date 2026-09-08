# Capítulo 17 — Money Retrospective

**Livro**: TDD by Example (Beck) · `chapters/ch17-money-retrospective.md`

## Core Idea
Retrospectiva do exemplo Money: o que o exercício ensina sobre **como decidir o que testar** e **como os testes moldam o design**. Beck revisa as perguntas-chave — "o que testar?", "testar demais ou de menos?" — e os padrões de design que emergiram naturalmente.

## Frameworks Introduced
- **Critérios para decidir o que testar**.
- Reflexão sobre **testes como especificação viva** e o custo dos testes.

## Key Concepts
- **O que testar?** Heurísticas do autor:
  - Teste **condições de contorno** (0, negativo, extremos).
  - Teste o que **pode quebrar** e o que **você não quer que quebre**.
  - "Se você não consegue pensar num teste que falharia sem código novo, não escreva código novo."
- **Risco**: testes protegem contra *medo de mudar*. Onde há medo, há necessidade de teste.
- **Qualidade do teste**: um bom teste é aquele que você **confiaria**; testes que dão falso positivo (passam sem testar) corroem a confiança.
- **O que emergiu no design**: Value Object (Money imutável), igualdade por valor, Factory Methods, Expression/Composite (Sum), separação soma (Expression) × conversão (Bank). Tudo isso foi **puxado por testes**, não planejado.

## Mental Models
- **Testes guiam o design**: as abstrações (Money, Expression, Bank) apareceram porque os testes as exigiram — design orgânico.
- **Teste por risco, não por cobertura**: concentre onde a mudança é provável e cara.
- **A dúvida "testo demais ou de menos?"** se resolve pelo medo: teste o que te deixa nervoso mudar.
- **O teste é um documento executável** de intenção de design.

## Anti-patterns
- Buscar **100% de cobertura** cegamente (teste o que importa/arrisca).
- Testes **acoplados à implementação** (quebram com qualquer refactor inocente).
- Testes que **nunca falham** (não protegem nada).
- Ignorar **condições de contorno**.

## Worked Example (reconstrução)
O autor lista lições do exemplo: (a) escrever a *test list* e seguir um teste por vez funcionou; (b) quando um teste parecia grande, **decompô-lo** (Child Test) ajudou; (c) a duplicação (Dollar/Franc) foi o sinal para abstrair; (d) as decisões de design (Expression, Bank) vieram de testes que não conseguiam passar sem elas. Revisitar o exemplo mostra que **TDD não é "testar primeiro" apenas — é deixar os testes informarem o design passo a passo**.

## Key Takeaways
1. Teste por **risco/medo de mudar**, com atenção a **condições de contorno**.
2. Testes são **especificação viva** e guiam o design (que emerge, não é pré-planejado).
3. Duplicação sinaliza onde abstrair; Child Test ajuda em testes grandes.
4. Boa pergunta: *"que teste me faria avançar agora?"*.

## Connects To
- **Ch 25–28** (os padrões agora formalizados), **Ch 30** (design patterns que emergiram).
- **Conceito**: Value Object, Composite, Factory Method.
