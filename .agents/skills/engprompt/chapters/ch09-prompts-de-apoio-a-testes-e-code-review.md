# Capítulo 9: Prompts de Apoio a Testes e Revisão de Código

## Core Idea
A IA é excepcionalmente competente em encontrar caminhos obscuros de execução e gerar suítes de testes unitários e de integração abrangentes, além de atuar como primeiro filtro rigoroso em revisões de código.

## Frameworks Introduced
- **Geração de Testes Orientada a Casos de Borda (Boundary-First Testing)**:
  - Quando usar: Ao escrever suítes de teste para funções críticas de negócio.
  - Como: Fornecer a função e exigir explicitamente testes cobrindo:
    1. Cenários de Sucesso (Happy Path).
    2. Valores Limites (0, -1, MAX_INT, strings vazias, null/undefined).
    3. Exceções e Erros Esperados.
    4. Concorrência ou Volume (se aplicável).
- **Checklist Automatizado de Code Review**:
  - Quando usar: Em PRs antes da revisão humana ou ao auditar módulos legados.
  - Como: Instruir a IA a avaliar o código sob uma matriz de análise: 1) Vulnerabilidades OWASP (SQL Injection, XSS); 2) Performance e complexidade temporal O(N); 3) Legibilidade e boas práticas; 4) Tratamento de erros.

## Key Concepts
- **Mocks & Stubs**: Objetos simulados usados em testes unitários para isolar dependências externas (banco, APIs).
- **Code Coverage**: Métrica percentual de linhas de código cobertas por testes automatizados.
- **OWASP Top 10**: As dez vulnerabilidades de segurança em aplicações mais críticas do setor.

## Mental Models
- **A IA como o Crítico Implacável**: Peça à IA para agir como o revisor de código mais exigente e detalhista que você conhece. Ela não tem constrangimento social de apontar falhas.
- **Testes São a Melhor Especificação**: Uma suíte de testes rica gerada pela IA serve tanto para garantir qualidade quanto para documentar como o código deve se comportar.

## Anti-patterns
- **Testes Viciados pelo Código Ruim**: Pedir para a IA gerar testes sem especificar os requisitos de negócio; se o código tiver um bug, a IA poderá gerar um teste que valida o comportamento errado como se fosse certo.
- **Mockar Tudo Excessivamente**: Gerar testes que mockam tantas coisas que não testam nenhum comportamento real da aplicação.

## Worked Example
```text
Atue como Especialista em QA e Segurança de Software.
Analise a função abaixo e gere:
1. Suíte de testes unitários completa usando Jest.
2. Identificação de qualquer vulnerabilidade de injeção ou race condition.
3. Testes específicos para 3 casos de borda extremos.

<funcao_alvo>
async function transferirSaldo(contaOrigemId, contaDestinoId, valor) {
    const origem = await db.conta.find(contaOrigemId);
    if (origem.saldo >= valor) {
        await db.conta.update(contaOrigemId, { saldo: origem.saldo - valor });
        await db.conta.update(contaDestinoId, { saldo: destino.saldo + valor });
    }
}
</funcao_alvo>
```

## Key Takeaways
1. A IA é a ferramenta ideal para descobrir casos de borda que desenvolvedores sobrecarregados costumam ignorar.
2. Use checklists estruturados de code review para auditar segurança e performance.
3. Sempre forneça a biblioteca de teste esperada (Jest, PyTest, JUnit) para evitar sintaxes incompatíveis.
