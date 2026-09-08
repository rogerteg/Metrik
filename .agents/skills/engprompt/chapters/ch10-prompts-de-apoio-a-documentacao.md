# Capítulo 10: Prompts de Apoio à Documentação

## Core Idea
A documentação técnica, historicamente negligenciada devido ao atrito de escrita, pode ser mantida atualizada continuamente transformando código-fonte e especificações em docstrings, contratos OpenAPI e guias de arquitetura via IA.

## Frameworks Introduced
- **Geração de Especificação OpenAPI / Swagger**:
  - Quando usar: Ao documentar endpoints de APIs REST para integração com frontend ou terceiros.
  - Como: Fornecer o controller ou rotas do backend e solicitar a especificação correspondente em YAML OpenAPI 3.0 completo com schemas de request/response e códigos de status HTTP.
- **Padrão de Documentação Onboarding-First**:
  - Quando usar: Na elaboração de arquivos README e guias de contribuição de repositórios.
  - Como: Estruturar o prompt para cobrir: 1) O que o projeto faz; 2) Pré-requisitos mínimos; 3) Passo a passo para rodar localmente em menos de 5 minutos; 4) Estrutura de pastas; 5) Como testar.

## Key Concepts
- **Docstring**: Comentário formatado no código (JSDoc, Python Docstrings, JavaDoc) interpretável por ferramentas de documentação.
- **OpenAPI / Swagger**: Padrão agnóstico de linguagem para descrição formal de APIs RESTful.
- **Living Documentation**: Documentação mantida sincronizada com o código no controle de versão.

## Mental Models
- **Documentação para o Eu do Futuro**: Escreva prompts de documentação pensando em um desenvolvedor que nunca viu o projeto e precisa corrigir um bug às 2h da manhã.
- **Extrair das Fontes de Verdade**: Nunca escreva documentação do nada; forneça o código-fonte real e os arquivos de configuração para que a IA extraia descrições fiéis.

## Anti-patterns
- **Documentação Óbvia e Inútil**: Gerar comentários como `// Construtor da classe Usuario` em cima de `constructor()`. Exija que a documentação explique o *porquê* e os *efeitos colaterais*, não o óbvio sintático.
- **Exemplos Desatualizados**: Não fornecer payloads reais de teste, fazendo a IA inventar exemplos de requisição com campos inexistentes.

## Worked Example
```text
Com base no controller NestJS abaixo, gere a documentação completa dos endpoints em formato OpenAPI 3.0 (YAML).
Inclua:
- Descrição clara de cada operação e tags de agrupamento.
- Schemas de Request Body com validações e tipos.
- Respostas para status 200, 400 (Bad Request), 404 (Not Found) e 500.
- Exemplos práticos de payloads JSON para cada cenário.
```

## Key Takeaways
1. A IA elimina o atrito de produzir documentação técnica exaustiva e padronizada.
2. Priorize formatos estruturados que ferramentas podem consumir (OpenAPI, Docstrings, Mermaid).
3. Documentações de onboarding ricas reduzem drasticamente o tempo de ramp-up de novos desenvolvedores.
