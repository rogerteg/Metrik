# Capítulo 3: Elaboração de Prompts

## Core Idea
O domínio de técnicas consagradas — Zero-Shot, Few-Shot, Chain-of-Thought e Delimitação Estruturada — permite extrair raciocínio analítico profundo de modelos de código.

## Frameworks Introduced
- **Few-Shot Learning Estruturado para Código**:
  - Quando usar: Para ensinar à IA um padrão de código específico do seu projeto (ex: padrão de Repository, formato de DTO ou estilo de teste).
  - Como: Fornecer 1 a 3 exemplos de 'Entrada -> Saída Desejada' antes de passar o caso real.
- **Chain-of-Thought (Cadeia de Pensamento) para Algoritmos**:
  - Quando usar: Ao resolver problemas complexos de lógica de programação ou refatorações intrincadas.
  - Como: Instruir a IA a pensar passo a passo: 'Primeiro liste as condições de borda, depois proponha o pseudocódigo, e por fim gere a implementação final'.
- **Delimitação Explícita por Tags**:
  - Quando usar: Ao misturar código-fonte, dados e instruções no mesmo prompt.
  - Como: Usar blocos markdown nomeados ou tags XML (ex: `<codigo_origem>`, `<requisitos>`).

## Key Concepts
- **Zero-Shot**: Enviar a instrução sem nenhum exemplo prévio de resposta.
- **Few-Shot**: Incluir exemplos concretos no prompt para guiar a estrutura e convenção.
- **Chain-of-Thought (CoT)**: Forçar o modelo a verbalizar etapas intermediárias de raciocínio antes da resposta final.
- **Delimitadores**: Caracteres especiais (triplas aspas, tags XML) que isolam seções de dados.

## Mental Models
- **O Poder do Exemplo (Show, Don't Tell)**: Mostrar um exemplo real do padrão de código da sua empresa é dez vezes mais eficiente do que descrever o padrão em três parágrafos de prosa.
- **Pensar Alto Previne Bugs**: Exigir que a IA explique as premissas lógicas antes de cuspir o código diminui drasticamente erros de lógica e casos de borda não tratados.

## Anti-patterns
- **Misturar Instruções com Código sem Delimitadores**: Colar código e instruções em um bloco único de texto, fazendo o modelo confundir comentários do código com novas regras.
- **Exemplos Few-Shot com Más Práticas**: Fornecer exemplos que contêm código mal estruturado; o modelo reproduzirá fielmente os maus hábitos do exemplo.

## Worked Example
```text
Converta as entidades de domínio abaixo para o padrão de Value Objects imutáveis.

Exemplo de Entrada:
class Dinheiro { public valor: number; public moeda: string; }

Exemplo de Saída:
class Dinheiro {
  private constructor(readonly valor: number, readonly moeda: string) {}
  static criar(valor: number, moeda: string): Dinheiro {
    if (valor < 0) throw new Error("Valor não pode ser negativo");
    return new Dinheiro(valor, moeda);
  }
}

Agora converta a seguinte classe:
<classe_alvo>
class Endereco { public rua: string; public cep: string; }
</classe_alvo>
```

## Key Takeaways
1. Few-shot garante aderência estrita aos padrões arquiteturais locais do seu repositório.
2. Chain-of-Thought é indispensável para algoritmos de alta complexidade ciclomática.
3. Delimitadores previnem confusão de contexto e injeções de prompt acidentais.
