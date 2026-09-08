# Capítulo 11: Modelos de Linguagem de Código (Code LLMs)

## Core Idea
Modelos especializados em programação (Code LLMs) são treinados intensivamente em repositórios de código aberto e documentações técnicas, oferecendo capacidades superiores de autocompletar, preenchimento intermediário (FIM) e compreensão de sintaxe.

## Frameworks Introduced
- **Fill-in-the-Middle (FIM) e Contexto Bidirecional**:
  - Quando usar: Em ferramentas de autocomplete e refatorações no meio de um arquivo de código.
  - Como: Entender que modelos de código modernos analisam o prefixo (o que vem antes) e o sufixo (o que vem depois) para preencher a lacuna lógica central.
- **Avaliação por Benchmarks de Código (HumanEval e MBPP)**:
  - Quando usar: Ao escolher qual modelo de fundação adotar na infraestrutura da sua empresa.
  - Como: Analisar métricas de Pass@1 em benchmarks de programação funcional em vez de confiar apenas em benchmarks de conversação geral.

## Key Concepts
- **Code LLM**: Modelo especializado em sintaxes de programação, linguagens de marcação e consultas (SQL).
- **Fill-in-the-Middle (FIM)**: Técnica de treinamento e inferência onde o modelo prevê o código intermediário entre duas partes já existentes.
- **HumanEval**: Benchmark de avaliação de código criado pela OpenAI medindo a capacidade do modelo de resolver problemas funcionais com testes unitários.

## Mental Models
- **O Compilador no Espaço Latente**: Code LLMs possuem representações internas da gramática formal e da árvore sintática abstrata (AST) das linguagens de programação mais populares.
- **Tamanho vs Latência**: Para autocompletar em tempo real na IDE, modelos menores e rápidos (3B a 7B parâmetros) superam modelos gigantes com alta latência.

## Anti-patterns
- **Usar Modelos sem FIM para Edição Local**: Usar modelos de chat genéricos que reescrevem o arquivo todo quando você só precisa do preenchimento de uma função no meio do código.
- **Confiar Cegamente no Benchmark Pass@1**: Achar que pontuação alta em problemas de algoritmos simples significa que o modelo arquitetará bem sistemas empresariais complexos.

## Worked Example
```text
Uso de Fill-in-the-Middle em ferramentas de desenvolvimento:
Prefixo: "function calcularTotal(itens: Item[]): number {"
Sufixo: "} // fim da função"
Preenchimento da IA (FIM):
"  return itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);"
```

## Key Takeaways
1. Code LLMs são otimizados para gramáticas formais, indentação e dependências sintáticas.
2. A técnica Fill-in-the-Middle é o motor que torna assistentes de IDE rápidos e contextuais.
3. Escolha o modelo certo com base no equilíbrio entre latência de resposta e capacidade de raciocínio arquitetural.
