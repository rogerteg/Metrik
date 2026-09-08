# Glossário — Test-Driven Development

## Núcleo (Prefácio/ch1)
- **TDD (Test-Driven Development)** — estilo de desenvolvimento guiado por testes automatizados; objetivo: *clean code that works*.
- **Red** — escrever um teste que falha (ou nem compila) antes do código de produção.
- **Green** — fazer o teste passar o mais rápido possível (cometendo os "pecados" necessários).
- **Refactor** — eliminar duplicação e melhorar o design com o teste verde como rede de segurança.
- **Test list** — lista de testes que você ainda precisa escrever (o "todo" que guia o progresso).
- **Duplication (duplicação)** — o único "pecado" que se deve eliminar; é ela que força generalização.
- **Clean code that works** — a meta do TDD (frase de Ron Jeffries).

## Estratégias para o verde (ch28)
- **Fake It ('til you make it)** — retornar uma constante para passar o teste; depois generalizar substituindo a constante por uma variável.
- **Obvious Implementation** — quando a implementação é óbvia, escreva direto.
- **Triangulate** — adicionar um segundo exemplo que force a generalização (quando a abstração certa não está óbvia).
- **One to Many** — operar sobre uma coleção; comece com um elemento e generalize para muitos.

## Padrões de red bar (ch26)
- **One Step Test** — qual o próximo teste mais informativo que você sabe escrever?
- **Starter Test** — primeiro teste: o mais simples que exercita a arquitetura básica.
- **Explanation Test** — teste que explica/ensina o comportamento (gera documentação viva).
- **Regression Test** — teste que reproduz um bug antes de corrigi-lo.
- **Another Test** — variação de um teste existente para forçar generalização.
- **Do Over** — quando a tentativa está confusa, jogue fora e recomece menor.

## Padrões de teste (ch27)
- **Child Test** — reduzir um teste grande a um caso pequeno que ainda falha.
- **Mock Object** — objeto falso com comportamento pré-programado para isolar a unidade.
- **Self Shunt** — o próprio objeto de teste implementa a interface da qual depende.
- **Log String** — registrar chamadas em uma string para verificar ordem.
- **Crash Test Dummy** — objeto que lança exceção quando usado indevidamente (testar tratamento de erro).
- **Broken Test** — deixar um teste quebrado conhecido (quando você sabe que vai falhar e por quê).
- **Clean Check-in** — nunca commitar com testes vermelhos; cada check-in deve estar verde.

## Padrões de teste/xUnit (ch29)
- **Assertion** — verificação que falha a menos que a condição seja verdadeira.
- **Fixture** — estado/objetos preparados para rodar os testes (setUp).
- **External Fixture** — recurso externo (arquivo, banco, conexão) criado/liberado pelo teste.
- **Test Method** — método de teste; cada teste é um método que roda isolado.
- **Exception Test** — teste que verifica que uma exceção específica é lançada.
- **All Tests** — suíte que roda todos os testes; um teste que não falha quando deveria é um problema.

## Frameworks de teste (xUnit) — construídos no livro
- **TestCase** — classe que representa um teste (método + resultado).
- **TestResult** — coleta o resultado da execução (contagem de testes, falhas, erros).
- **TestSuite** — composição de testes para rodar juntos.
- **setUp / tearDown** — hooks de preparação e limpeza por teste (fixture).
- **WasRun** — (no livro) classe de teste que registra se foi executada (para testar o framework).
- **run()** — método que executa o teste (invocando setUp, método, tearDown).

## Money example (Parte I) — conceitos de design que emergem
- **Value Object** — objeto imutável cuja igualdade é por valor (Dollar/Franc/Money).
- **Expression / Sum / Bank / reduce** — abstrações que surgem para somar moedas diferentes e reduzir (converter) para uma moeda.
- **times() / plus() / equals()** — operações guiadas por testes.
- **Currency** — atributo que distingue moedas (Dollar vs. Franc).

## Refatorações (ch31)
- **Reconcile Differences** — unificar duas implementações semelhantes.
- **Isolate Change** — isolar o que muda para mudar com segurança.
- **Migrate Data** — mudar representação de dados gradualmente.
- **Extract Method / Inline Method** — extrair lógica para método próprio / colapsar método trivial.
- **Extract Interface** — extrair interface para desacoplar.
- **Move Method** — mover método para a classe certa.
- **Method Object** — transformar método grande em objeto.
- **Add Parameter** — adicionar parâmetro quando necessário (com testes guiando).

## Design patterns com motivação de teste (ch30)
- **Command, Value Object, Null Object, Template Method, Pluggable Object, Pluggable Selector, Factory Method, Imposter, Composite, Collecting Parameter, Singleton** — ver `patterns.md`.

## Epistemologia / atitude (ch32, Afterword)
- **Courage** — coragem para mudar, sustentada pelos testes.
- **Mean Time Between Failures (MTBF)** — percepção de confiabilidade; TDD reduz surpresas.
- **Cost of change** — TDD achata a curva de custo de mudança ao longo do tempo.
