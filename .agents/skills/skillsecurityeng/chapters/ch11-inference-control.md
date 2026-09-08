# Capítulo 11 — Inference Control

**Livro**: Security Engineering (Anderson) · `chapters/ch11-inference-control.md`

## Core Idea
Mesmo com controle de acesso perfeito, **dados estatísticos agregados podem revelar segredos individuais** — é o problema da *inferência*. Anderson traça a história do controle de inferência: de censos e tabelas estatísticas (waves clássicas) até o mundo moderno de preferências, busca, localização e redes sociais — onde a reidentificação se tornou trivial. O capítulo culmina em **differential privacy** e nas limitações práticas da anonimização tática.

## Frameworks Introduced
- História e teoria do **controle de inferência estatística** (databases estatísticas, cell suppression).
- **Differential privacy** como o padrão moderno com garantia formal.
- As "waves" de dados ricos: médicos detalhados, preferências/busca, localização/social.
- Anonimização tática e seus limites ("mind the gap").

## Key Concepts
- **Teoria básica do controle de inferência**: publicar estatísticas sobre um banco de dados sem revelar indivíduos. Técnicas clássicas: **query restriction, cell suppression, perturbação, amostragem**.
- **Limites da segurança estatística clássica**: com poucas queries bem escolhidas, ou com dados correlacionados, dá para inferir indivíduos (ex.: diferença de duas queries revela um registro).
- **Dados médicos ricos**: genoma + demografia + datas raras → reidentificação quase garantida (o famoso caso do governador de Massachusetts identificado por "zip + data de nascimento + sexo").
- **Terceira wave — preferências e busca**: quem você é pode ser inferido pelo que você procura/clica.
- **Quarta wave — localização e social**: trajetórias de GPS e grafos sociais são **quase-identificadores universais** (poucos pontos de localização identificam uma pessoa; a estrutura do grafo social identifica mesmo "anônimo").
- **Differential privacy**: uma query é ε-diferencialmente privada se a presença/ausência de um indivíduo muda pouco a distribuição do resultado → proteção formal contra *qualquer* atacante com informação auxiliar. **Aplicação a censos** (o censo dos EUA de 2020 usou DP).
- **Mind the gap / tática**: **anonimização tática** (remover nomes, adicionar ruído ad hoc) raramente funciona; *incentivos* errados; alternativas (consentimento, minimização, DP); e o **lado sombrio** (vigilância usa as mesmas técnicas para *identificar*, não para proteger).

## Mental Models
- **"Anônimo" é um espectro, não um botão**: depende do que mais o adversário sabe (background knowledge).
- **Quatro pontos de localização bastam** para identificar a maioria das pessoas.
- **O grafo social é uma impressão digital**: quem você conhece te identifica.
- **Differential privacy protege contra inferência mesmo com conhecimento auxiliar** — mas tem custo de utilidade e exige cuidado com composição.
- **A mesma ciência serve para privacidade e para vigilância**: a diferença é o propósito.

## Anti-patterns
- Publicar microdados "desidentificados" sem análise de reidentificação.
- Achar que **remover PII** (nome, CPF) resolve.
- Usar **k-anonymity/l-diversity** como garantia (falham com dados correlacionados e conhecimento auxiliar) sem entender limites.
- Perturbação ad hoc (ruído "na mão") sem garantia formal.
- Ignorar o custo de utilidade — DP mal aplicada destrói os dados.

## Worked Example
**Liberar dados de saúde para pesquisa**: em vez de publicar o CSV "anônimo" (que seria reidentificável por combinação de atributos), o instituto disponibiliza um **mecanismo de queries com differential privacy** (ε controlado), limitando quantas queries e o orçamento de privacidade gasto. Pesquisadores obtêm estatísticas úteis com erro calibrado; o instituto monitora o *privacy budget* total. Trade-off explícito: mais queries/precisão → menos privacidade garantida.

## Key Takeaways
1. **Agregados vazam indivíduos**; a inferência é inevitável sem controle explícito.
2. Dados de localização e grafos sociais são **reidentificadores poderosos**.
3. **Differential privacy** dá garantia formal (com custo); anonimização tática não.
4. Design para minimização: colete menos, proteja mais, e meça o orçamento de privacidade.

## Connects To
- Cap. 10 (boundaries/health) — privacidade de prontuários.
- Cap. 26 (privacidade/GDPR, vigilância) — regulação e o "lado sombrio".
- Cap. 25 (ML) — ataques a ML incluem extração de dados de treino.
