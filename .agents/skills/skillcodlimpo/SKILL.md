---
name: skillcodlimpo
description: Código Limpo (Clean Code) — O guia definitivo de habilidades práticas do artesão de software ágil com base na obra seminal de Robert C. Martin (Uncle Bob). Abrange a filosofia do código limpo, a Regra do Escoteiro, nomenclatura significativa, funções pequenas com responsabilidade única e regra decrescente, comentários honestos, formatação vertical/horizontal, assimetria entre objetos e estruturas de dados, Lei de Deméter, tratamento de erros sem nulos, testes de unidade limpos com F.I.R.S.T., design emergente de Kent Beck, concorrência segura, refatoração cirúrgica e o catálogo completo de odores e heurísticas (smells).
compatibility: Works across all IDEs and AI agents supporting Agent Skills
metadata:
  author: Robert C. Martin (Uncle Bob)
  version: '1.0'
---

# Código Limpo (skillcodlimpo)

Base de conhecimento estruturada e manual prático derivado da obra máxima de **Robert C. Martin (Uncle Bob)** (*Código Limpo: Habilidades Práticas do Agile Software*, Alta Books).

A premissa fundamental do livro é que **a leitura de código consome mais de 90% do tempo dos desenvolvedores** em comparação à escrita de código novo. Logo, escrever código limpo, expressivo e legível é a única maneira viável de manter alta velocidade de entrega e sustentabilidade técnica ao longo dos anos.

## How to Use This Skill

1. **Princípios de Base e Nomenclatura (Capítulos 1 e 2)**:
   - `chapters/01-codigo-limpo.md`: A Lei de LeBlanc (*Mais tarde é igual a nunca*), a Regra do Escoteiro e a definição de código limpo pelos pioneiros da computação.
   - `chapters/02-nomes-significativos.md`: Revelar intenção, evitar desinformação, nomes pronunciáveis, distinções significativas e substantivos para classes vs verbos para métodos.
2. **Design de Funções e Apresentação (Capítulos 3 a 5)**:
   - `chapters/03-funcoes.md`: Regra Decrescente (Stepdown Rule), funções pequenas de responsabilidade única, contagem de argumentos (0 a 2), Separação Comando-Consulta (CQS), eliminação de efeitos colaterais e DRY.
   - `chapters/04-comentarios.md`: O código limpo se explica sozinho; quando comentários são legítimos (intenção, alertas, regex) e quando são ruído e código morto.
   - `chapters/05-formatacao.md`: A metáfora do artigo de jornal, densidade vertical, ordenação descendente e convenções de equipe.
3. **Estruturas, Erros e Fronteiras (Capítulos 6 a 8)**:
   - `chapters/06-objetos-e-estruturas-de-dados.md`: A assimetria entre objetos e estruturas de dados, a Lei de Deméter, prevenção de acidentes de trem e DTOs.
   - `chapters/07-tratamento-de-erro.md`: Exceções em vez de códigos de retorno, Special Case Pattern (Null Object), **nunca retorne null** e **nunca passe null**.
   - `chapters/08-limites.md`: Isolamento de bibliotecas de terceiros via Adapters e Testes de Aprendizado.
4. **Qualidade de Teste, Classes e Sistemas (Capítulos 9 a 13)**:
   - `chapters/09-testes-de-unidade.md`: As 3 Leis do TDD, Arrange-Act-Assert, um conceito por teste e os critérios F.I.R.S.T. (Fast, Independent, Repeatable, Self-validating, Timely).
   - `chapters/10-classes.md`: Classes pequenas com alta coesão, organização interna e isolamento para mudanças.
   - `chapters/11-sistemas.md`: Separação entre construção (Composition Root / DI) e uso; escalabilidade via POJOs.
   - `chapters/12-emergencia.md`: As 4 Regras de Design Simples de Kent Beck.
   - `chapters/13-concorrencia.md`: Defesa de concorrência, imutabilidade, isolamento de threads e modelos clássicos de execução.
5. **Estudos de Caso e Catálogo de Odores (Capítulos 14 a 17)**:
   - `chapters/14-refinamento-sucessivo.md` a `chapters/16-refatorando-serialdate.md`: Desconstrução de código real (`Args`, `ComparisonCompactor`, `SerialDate`).
   - `chapters/17-odores-e-heuristicas.md`: O catálogo definitivo dos 66 smells e heurísticas de Uncle Bob classificados em Comentários (C), Ambiente (E), Funções (F), Gerais (G), Java (J), Nomes (N) e Testes (T).
6. **Consultas Rápidas e Blueprints**:
   - `cheatsheet.md`: Checklist prático de code review, regras F.I.R.S.T., tabela de odores e regras de ouro de refatoração.
   - `patterns.md`: Padrões de refatoração: Stepdown Hierarchy, Command Query Separation, Special Case Pattern e Boundary Adapter.
   - `glossary.md`: Glossário técnico bilíngue de Clean Code.

---

## Core Frameworks & Mental Models

- **A Regra do Escoteiro (The Boy Scout Rule)**:
  > *"Deixe sempre a área de acampamento mais limpa do que como você a encontrou."*
  A cada commit, melhore um nome de variável, quebre uma função grande ou elimine um comentário obsoleto. A qualidade do código aumenta continuamente de forma orgânica.
- **A Lei de LeBlanc**:
  > *"Mais tarde é igual a nunca (Later equals never)."*
  Nunca deixe código sujo para trás prometendo que voltará para limpá-lo depois; o momento de deixar limpo é agora.
- **A Regra Decrescente (The Stepdown Rule)**:
  O código deve ser lido de cima para baixo como uma narrativa jornalística: cada função deve ser imediatamente sucedida pelas funções do nível de abstração seguinte, permitindo entender o fluxo geral antes de mergulhar nos detalhes microscópicos.
- **Separação Comando-Consulta (Command Query Separation - CQS)**:
  Uma função deve fazer algo (mudar o estado do sistema) **ou** responder algo (retornar dados), mas nunca ambos simultaneamente.
- **A Lei de Deméter (Princípio do Mínimo Conhecimento)**:
  Um método $M$ de um objeto $O$ só deve chamar métodos de: $O$ próprio, parâmetros passados para $M$, objetos criados por $M$, ou componentes diretos de $O$. *Não converse com estranhos; evite o encadeamento de acidentes de trem (`a.getB().getC().doSomething()`)*.
- **As 4 Regras de Design Simples de Kent Beck**:
  1. Executa todos os testes.
  2. Não contém duplicação (DRY).
  3. Expressa a intenção do desenvolvedor com clareza.
  4. Minimiza o número de classes e métodos.

---

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | Código Limpo | `chapters/01-codigo-limpo.md` |
| 2 | Nomes Significativos | `chapters/02-nomes-significativos.md` |
| 3 | Funções | `chapters/03-funcoes.md` |
| 4 | Comentários | `chapters/04-comentarios.md` |
| 5 | Formatação | `chapters/05-formatacao.md` |
| 6 | Objetos e Estruturas de Dados | `chapters/06-objetos-e-estruturas-de-dados.md` |
| 7 | Tratamento de Erro | `chapters/07-tratamento-de-erro.md` |
| 8 | Limites | `chapters/08-limites.md` |
| 9 | Testes de Unidade | `chapters/09-testes-de-unidade.md` |
| 10 | Classes | `chapters/10-classes.md` |
| 11 | Sistemas | `chapters/11-sistemas.md` |
| 12 | Emergência | `chapters/12-emergencia.md` |
| 13 | Concorrência | `chapters/13-concorrencia.md` |
| 14 | Refinamento Sucessivo | `chapters/14-refinamento-sucessivo.md` |
| 15 | Características Internas do JUnit | `chapters/15-caracteristicas-internas-do-junit.md` |
| 16 | Refatorando o SerialDate | `chapters/16-refatorando-serialdate.md` |
| 17 | Odores e Heurísticas | `chapters/17-odores-e-heuristicas.md` |
