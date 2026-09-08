# Capítulo 8: Prompts de Apoio à Codificação

## Core Idea
A codificação assistida por IA atinge seu potencial máximo quando o desenvolvedor fornece especificações estritas de design, padrões arquiteturais estabelecidos (SOLID, Clean Architecture) e limites claros de escopo por prompt.

## Frameworks Introduced
- **Geração Modular por Camadas**:
  - Quando usar: Ao construir novas funcionalidades de ponta a ponta.
  - Como: Não peça a feature inteira de uma vez. Gere em etapas: 1) Entidades e Interfaces; 2) Regras de Domínio/Service; 3) Repositórios/Acesso a dados; 4) Controllers/Endpoints.
- **Prompt de Refatoração Orientada a SOLID**:
  - Quando usar: Ao limpar código legado com alta complexidade ciclomática ou violação de responsabilidade única.
  - Como: Fornecer o código original delimitado e instruir a IA a identificar violações específicas (ex: acoplamento rígido) antes de reescrever.

## Key Concepts
- **Clean Code**: Código legível, com nomes expressivos de variáveis e funções pequenas com responsabilidade única.
- **SOLID**: Conjunto de 5 princípios de design orientado a objetos para software sustentável.
- **Code Porting**: Tradução de rotinas de uma linguagem ou framework para outro preservando contratos e comportamentos.

## Mental Models
- **Cirurgia em Vez de Demolição**: Ao pedir refatoração, instrua a IA a manter as assinaturas públicas de métodos existentes para não quebrar consumidores externos.
- **Peça Justificativa das Decisões**: Solicite que a IA adicione um breve comentário explicando por que escolheu determinada estrutura de dados ou algoritmo.

## Anti-patterns
- **Geração 'Bíblica' de Mil Linhas**: Pedir arquivos inteiros de código em um único prompt; a IA perderá o contexto no meio e alucinará dependências.
- **Copiar e Colar sem Compreensão**: Inserir código gerado na base do projeto sem ler cada linha e entender suas implicações de memória e concorrência.

## Worked Example
```text
Atue como Desenvolvedor Java Sênior.
Refatore o método abaixo aplicando o princípio Open-Closed (OCP) e Strategy Pattern.
Código atual:
<codigo>
public double calcularDesconto(String tipoCliente, double valor) {
    if (tipoCliente.equals("VIP")) return valor * 0.8;
    else if (tipoCliente.equals("REGULAR")) return valor * 0.95;
    else return valor;
}
</codigo>

Requisitos:
- Criar interface CalculadoraDesconto e implementações concretas para cada tipo.
- Retornar o código refatorado pronto para injeção de dependência.
- Manter o cálculo 100% equivalente.
```

## Key Takeaways
1. Divida o desenvolvimento em passos atômicos por camada arquitetural.
2. Force a aderência a Clean Code e SOLID através de restrições explícitas no prompt.
3. A refatoração assistida por IA é ideal para eliminar código duplicado e acoplamento desnecessário.
