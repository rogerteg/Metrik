# Padrões (Patterns) — Test-Driven Development

Catálogo dos padrões de TDD de Kent Beck. Para cada um: **quando usar**, **como**, **trade-offs**.

## Ciclo central
- **Red/Green/Refactor**
  - **Quando**: sempre que for escrever código novo.
  - **Como**: escreva um teste que falha → faça passar do jeito mais rápido → refatore eliminando duplicação.
  - **Trade-off**: parece mais lento no começo; paga em menos bugs e mais confiança para mudar.

## Red Bar Patterns (escolher o próximo passo)
- **One Step Test**
  - **Quando**: você precisa decidir o próximo teste.
  - **Como**: escolha o próximo teste mais informativo que você sabe que vai falhar por uma razão nova.
  - **Trade-off**: passos pequenos são mais seguros, passos grandes são mais rápidos — varie conscientemente.
- **Starter Test** — primeiro teste do sistema: o mais simples que exercita a arquitetura (ex.: "0 = 0").
- **Explanation Test** — teste que documenta/ensina; **quando** alguém pergunta "como funciona isso?".
- **Regression Test** — **quando** um bug aparece: escreva o teste que reproduz o bug, veja falhar, então conserte.
- **Another Test** — **quando** quer forçar generalização: adicione uma variação que o código atual não cobre.
- **Do Over** — **quando** o código/teste está confuso: descarte e recomece de um ângulo menor.

## Testing Patterns (como testar)
- **Child Test** — teste grande demais? Reduza a um caso pequeno que ainda falhe, resolva, e suba de volta.
- **Mock Object** — **quando** a unidade depende de algo lento/instável (banco, rede): injete um falso com comportamento pré-programado. Trade-off: mock acoplado à implementação.
- **Self Shunt** — **quando** o objeto de teste pode ele mesmo prover a dependência: implemente a interface no próprio teste.
- **Log String** — **quando** precisa verificar ordem de chamadas: acumule chamadas numa string e compare.
- **Crash Test Dummy** — **quando** quer testar tratamento de erro: objeto que lança exceção ao ser usado.
- **Broken Test** — deixar um teste conhecidamente quebrado **temporariamente** (sinalizado); trade-off: risco de virar ruído.
- **Clean Check-in** — **regra**: só commitar com suíte verde; teste vermelho no repo corrói confiança de todos.

## Green Bar Patterns (chegar ao verde)
- **Fake It ('til you make it)** — retorne uma constante; depois troque a constante por uma variável/expressão real.
  - **Por que funciona**: separa "fazer o teste passar" de "implementar"; o refactor seguinte faz a generalização.
- **Obvious Implementation** — implementação clara? Escreva direto (sem fake). Use quando a confiança é alta.
- **Triangulate** — **quando** a abstração certa não está óbvia: adicione um 2º exemplo; só generalize quando dois testes exigirem.
- **One to Many** — **quando** quer operar em coleções: implemente para 1 elemento, depois generalize para N.

## xUnit Patterns
- **Assertion** — o teste verifica uma condição; sem asserção, não é teste.
- **Fixture (setUp/tearDown)** — prepare estado comum em setUp e limpe em tearDown para testes isolados e rápidos.
- **External Fixture** — recursos externos: crie/libere explicitamente (com try/finally) para não vazar estado entre testes.
- **Test Method** — um teste = um método que roda isolado, com resultado coletado.
- **Exception Test** — teste que falha a menos que a exceção esperada seja lançada.
- **All Tests** — tenha uma suíte que rode tudo; rodar tudo deve ser rápido e frequente.

## Design Patterns (com motivação de testabilidade)
- **Command** — encapsular uma ação como objeto (testável isoladamente).
- **Value Object** — imutável, igualdade por valor (Dollar); natural de testar.
- **Null Object** — objeto que faz "nada" em vez de null (evita ifs; fácil de testar).
- **Template Method** — esqueleto com passos que subclasses preenchem (o TestCase do xUnit).
- **Pluggable Object / Pluggable Selector** — variar comportamento plugando objeto/método (evita if/switch).
- **Factory Method** — criar objetos por método (permite injetar/substituir em teste).
- **Imposter** — objeto que se passa por outro para simplificar (parente de Mock/Null).
- **Composite** — tratar grupo e elemento uniformemente (TestSuite como Composite de TestCase).
- **Collecting Parameter** — passar um objeto que coleta resultados ao longo de chamadas.
- **Singleton** — cuidado: dificulta teste (estado global); use com moderação.
- **Como escolher**: prefira o padrão que **facilita o próximo teste** e reduz acoplamento.

## Refatorações orientadas por teste
- **Reconcile Differences** — duas classes quase iguais (Dollar/Franc): una gradualmente.
- **Isolate Change** — isole a parte que varia para mudá-la sem efeito colateral.
- **Migrate Data** — mude a representação de dados por passos pequenos, com testes.
- **Extract Method / Inline Method** — extraia para dar nome/clareza; infle quando trivial.
- **Extract Interface** — desacople cliente de implementação concreta.
- **Move Method** — coloque o método na classe que tem os dados que ele usa.
- **Method Object** — método longo demais → vire objeto com estado próprio.
- **Add Parameter** — adicione dependência explicitamente quando o teste precisar injetar.
- **Regra de ouro**: cada refatoração é pequena e mantém os testes verdes entre passos.

## Trade-offs mestres
- **Tamanho do passo**: pequeno (seguro, devagar) vs. grande (rápido, arriscado) — a *test list* ajuda a calibrar.
- **Teste de unidade vs. integração**: isole o que você está aprendendo; Mock Object para fronteiras lentas.
- **Fake It vs. Obvious Implementation**: fake quando inseguro/obscuro; óbvio quando confiante.
- **Cobertura**: teste o que pode quebrar e o que você não quer que quebre — não persiga 100% cego.
