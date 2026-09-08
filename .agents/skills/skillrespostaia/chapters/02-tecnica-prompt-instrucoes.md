# Capítulo 2: Técnica de Prompt de Instruções (Instruction Prompting)

## Core Idea
A técnica de prompt de instruções orienta a saída do ChatGPT fornecendo diretrizes explícitas, imperativas e não-ambíguas que o modelo deve acatar estritamente durante a geração.

## Frameworks Introduced
- **Fórmula de Prompt de Instruções**:
  `Gere [tarefa] seguindo estas instruções: [instruções detalhadas]`
- **Os Quatro Vetores de Instrução**:
  1. **Critérios de Qualidade**: Precisão técnica, profundidade argumentativa e nível de formalidade.
  2. **Regras de Negócio e Conformidade**: Leis, regulamentações, políticas corporativas ou diretrizes da marca.
  3. **Restrições de Estrutura**: Limites de parágrafos, listas numeradas, tabelas ou código puro.
  4. **Tom de Voz**: Neutro, persuasivo, didático ou corporativo.

## Key Concepts
- **Instrução Negativa**: Especificar expressamente o que o modelo *não* deve incluir ou fazer (ex: "não use jargões sem explicá-los").
- **Conformidade Regulatória**: Fornecer marcos legais (ex: LGPD, GDPR, normas ISO) para calibrar a saída.
- **Composição com Função e Palavra-Semente**: Instruções ganham precisão máxima quando associadas a um papel e a âncoras temáticas.

## Mental Models
- **O Checklist do Revisor**: Formular as instruções como se fossem o checklist que um auditor humano usará para aprovar ou rejeitar o texto gerado.

## Anti-patterns
- **Instruções Abstratas**: Usar termos vagos como "faça algo bom" ou "deixe interessante" sem critérios mensuráveis.
- **Sobrecarga Não Hierarquizada**: Misturar 20 instruções desconexas em um único parágrafo contínuo em vez de enumerá-las.

## Worked Example
**Prompt de Atendimento ao Cliente**:
```text
Gere respostas profissionais para dúvidas de clientes de um e-commerce de tecnologia seguindo estas instruções:
1. O tom deve ser cordial, empático e resolutivo.
2. Inicie com um agradecimento pelo contato e reconhecimento do problema relatado.
3. Apresente os passos de resolução em tópicos numerados de fácil leitura.
4. Nunca admita culpa legal antes de uma perícia interna, mas garanta suporte prioritário.
5. Conclua com canal direto para dúvidas adicionais (WhatsApp e e-mail de suporte).

Pergunta do Cliente: "Comprei um monitor gamer há 3 dias e ele veio com a tela trincada. Quero meu dinheiro de volta imediatamente!"
```
