# Capítulo 5 — Franc-ly Speaking

**Livro**: TDD by Example (Beck) · `chapters/ch05-franc-ly-speaking.md`

## Core Idea
O exemplo agora exige uma segunda moeda: **Franc**. O capítulo introduz a classe `Franc` **copiando** `Dollar` e adaptando — mostrando que a duplicação deliberada é aceitável como passo intermediário (será removida em refactors futuros). Testes novos para `Franc` (multiplicação e igualdade) são escritos e passam com a classe duplicada.

## Frameworks Introduced
- **Duplicação temporária como estratégia** (criar uma classe parecida copiando) para depois **reconciliar diferenças** (ch. 11/31).
- Teste de multiplicação e igualdade para a nova classe.

## Key Concepts
- Testes para Franc:
```java
public void testFrancMultiplication() {
    Franc five = new Franc(5);
    assertEquals(new Franc(10), five.times(2));
    assertEquals(new Franc(15), five.times(3));
}
```
- Criar `class Franc` (cópia de Dollar) com `amount`, `times` retornando `new Franc(...)`, e `equals` comparando `amount`.
- A duplicação entre Dollar e Franc é **grande e intencional** — o autor a aceita agora para depois unificar (o "root of all evil" do ch. 11 é justamente o `times` duplicado).

## Mental Models
- **Não force abstração cedo**: primeiro deixe o comportamento funcionar (mesmo duplicado); a abstração (superclasse) virá quando os testes pedirem.
- **Duplicação é um "pecado" a pagar temporariamente** quando o próximo passo é mais claro copiando.
- **Teste por moeda**: cada classe nova ganha seus próprios testes de comportamento.

## Anti-patterns
- Criar hierarquia/abstração **antes** de ter duas classes concretas reais.
- Refatorar a duplicação **no mesmo passo** em que cria a classe nova (mexer em duas frentes).

## Code Example
```java
class Franc {
    private int amount;
    Franc(int amount) { this.amount = amount; }
    Franc times(int multiplier) { return new Franc(amount * multiplier); }
    public boolean equals(Object o) { return amount == ((Franc) o).amount; }
}
```
- **O que demonstra**: a cópia "ingênua" de Dollar com o tipo trocado.

## Worked Example
Com `$5+10CHF` no horizonte, o autor escreve testes de Franc. Como Franc se comporta como Dollar, ele **copia** a classe e ajusta o tipo no `times`/`equals`. Os testes de Franc passam. Há agora **duplicação maciça** entre Dollar e Franc — registrada mentalmente para ser removida. (A igualdade Dollar-vs-Franc ainda não é tratada; será no ch. 7.)

## Key Takeaways
1. Nova variação → às vezes o caminho mais rápido é **copiar e ajustar**.
2. **Aceite duplicação temporária**; ela indica onde abstrair depois.
3. Cada classe concreta nova merece seus próprios testes.
4. A abstração (superclasse) virá **quando os testes pedirem**, não antes.

## Connects To
- **Ch 7** (comparar moedas diferentes), **Ch 11** (remover o `times` duplicado), **Ch 31** (Reconcile Differences).
