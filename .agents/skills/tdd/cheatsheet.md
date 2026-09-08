# Cheatsheet — Test-Driven Development (regras de decisão)

## 1. As duas regras
1. Escreva código novo **só** com um teste automatizado falhando.
2. **Elimine duplicação**.
→ Ciclo: **Red → Green → Refactor** (repita).

## 2. Fluxo de decisão — o que fazer agora?
```
Quer adicionar comportamento?
   │
   ▼
Tem teste na test list cobrindo isso?
   ├─ não → escreva o próximo teste (One Step Test):
   │        o mais informativo que falha por uma razão NOVA
   │        (varie o passo: pequeno=seguro, grande=rápido)
   └─ sim → rode: falha do jeito esperado? (Red)
              ├─ não falhou → teste não testa nada (outro teste/regression)
              ├─ falhou por razão errada → pare e entenda (Do Over se confuso)
              └─ falhou certo → passe para Green:
                    • confiante/óbvio?  → Obvious Implementation
                    • inseguro?         → Fake It (constante → generaliza)
                    • abstração dúbia?  → Triangulate (2º exemplo)
                    • coleção?          → One to Many (1 → N)
              ▼
        Green (teste passou) → Refactor:
              • elimine duplicação
              • rode a suíte toda (All Tests) — deve continuar verde
              • Clean Check-in: nunca commite vermelho
```

## 3. Quando aparece um bug
```
Bug reportado → Regression Test: escreva teste que reproduz
→ veja falhar (Red) → conserte → verde → refatore.
```

## 4. Como escrever o teste (dicas rápidas)
- **Assert First**: escreva a asserção primeiro; depois o arranjo (o que precisa existir).
- **Teste pequeno e isolado**: um comportamento por teste (Test Method).
- **Estado comum?** → setUp (Fixture); **limpe?** → tearDown (mesmo em falha).
- **Dependência lenta/instável?** → Mock Object, Self Shunt, ou Crash Test Dummy.
- **Verificar ordem de chamadas?** → Log String.
- **Teste grande demais?** → Child Test (reduza até um caso pequeno que ainda falhe).
- **Testar erro?** → Exception Test + Crash Test Dummy.
- **Valor/lógica pura?** → Value Object (imutável, igualdade por valor) — fácil de testar.

## 5. Como refatorar com segurança
- Passos **pequenos**, sempre com a suíte **verde** entre um passo e outro.
- **Extract Method/Interface**, **Move Method**, **Method Object**, **Migrate Data**, **Reconcile Differences** (una classes gêmeas), **Isolate Change**.
- Depois de cada refatoração: rode **All Tests**.

## 6. Escolha de design orientada a teste
- Prefira o padrão que **facilita o próximo teste** e **reduz acoplamento**:
  - evitar `null` → **Null Object**
  - evitar `if/switch` por tipo → **Pluggable Object/Selector**, **Command**
  - variação de algoritmo → **Template Method** / **Strategy via Pluggable**
  - criar dependências → **Factory Method** (permite mock)
  - grupo + elemento iguais → **Composite**
  - estado global problemático → **evite Singleton** (dificulta teste)
- Motivação: componentes **coesos e fracamente acoplados** para facilitar o teste.

## 7. Tamanho do passo — heurísticas
- **Passo pequeno demais?** (tédio, muitos micro-testes) → pule alguns; teste no nível de comportamento.
- **Passo grande demais?** (teste que não consegue escrever) → divida (Child Test); ache um ângulo menor.
- **Teste que nunca fica vermelho por razão nova** → você está apenas validando; procure o próximo risco.
- **Suíte lenta** → separe testes rápidos (unidade) dos lentos (integração); rode os rápidos sempre.

## 8. Smells (tells de problema)
- **Teste que passa sem testar nada** (sem asserção, ou sempre-verdadeiro).
- **Teste que depende da ordem dos outros** → falta isolamento (fixture/tearDown).
- **Código de produção escrito antes do teste falhar** → você não está fazendo TDD.
- **Duplicação "resolvida" copiando em vez de generalizando** → refatore de verdade.
- **Testes frágeis** (quebram com mudança irrelevante) → acoplados demais à implementação (mock em excesso).
- **"Funciona, mas não sei por quê"** → falta um Explanation Test / teste de regressão.
- **Medo de mudar** → falta cobertura; escreva o teste que protege a mudança.
