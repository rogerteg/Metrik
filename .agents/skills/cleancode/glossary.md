# Glossário Técnico do Código Limpo (Uncle Bob)

Terminologia técnica e conceitos fundamentais de Clean Code em formato bilíngue (Português - Inglês).

| Termo em Português | Termo em Inglês | Definição e Aplicação Prática |
|---|---|---|
| **Regra do Escoteiro** | *The Boy Scout Rule* | Prática de deixar o código sempre um pouco mais limpo a cada commit do que quando foi aberto. |
| **Lei de LeBlanc** | *LeBlanc's Law* | Princípio de que "mais tarde é igual a nunca" (*later equals never*); código sujo deixado para depois nunca é limpo. |
| **Regra Decrescente** | *The Stepdown Rule* | Organização do código de forma que cada função seja sucedida pelo próximo nível de abstração imediatamente abaixo dela. |
| **Separação Comando-Consulta** | *Command Query Separation (CQS)* | Regra que dita que uma função deve alterar estado OU responder uma consulta, mas nunca ambos. |
| **Lei de Deméter** | *Law of Demeter (LoD)* | Princípio do Mínimo Conhecimento: um objeto só deve conversar com seus amigos imediatos, evitando acidentes de trem. |
| **Acidente de Trem** | *Train Wreck* | Cadeia longa de invocações transitivas de métodos (`a.getB().getC().getD().executar()`) que viola a Lei de Deméter. |
| **Padrão de Caso Especial** | *Special Case Pattern / Null Object* | Criação de um objeto polimórfico com comportamento padrão neutro para eliminar a necessidade de retornar ou checar `null`. |
| **Inveja de Recursos** | *Feature Envy* | Odor de código em que um método de uma classe passa mais tempo acessando os dados de outra classe do que os seus próprios. |
| **Argumento Sinalizador** | *Flag Argument* | Parâmetro booleano passado para uma função indicando que ela faz mais de uma coisa dependendo do valor da flag. |
| **F.I.R.S.T.** | *F.I.R.S.T. Rules* | Critérios de excelência para testes de unidade: Fast, Independent, Repeatable, Self-Validating, Timely. |
| **Objeto de Transferência de Dados** | *Data Transfer Object (DTO)* | Estrutura de dados pura (sem regras de negócio) usada exclusivamente para transporte de dados entre camadas. |
| **Design Emergente** | *Emergent Design* | Design de alta qualidade que surge gradualmente da aplicação das 4 regras simples de Kent Beck e refatoração contínua. |
| **Condição de Corrida** | *Race Condition* | Falha de concorrência onde o resultado depende da ordem temporal imprevisível em que múltiplas threads acessam dados compartilhados. |
| **Morte por Mil Cortes** | *Code Rot* | Degradação lenta e gradual da base de código causada pelo acúmulo de pequenas concessões de qualidade diárias. |
