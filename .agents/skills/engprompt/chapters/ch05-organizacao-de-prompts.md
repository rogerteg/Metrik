# Capítulo 5: Organização de Prompts

## Core Idea
O ganho de escala com IA no desenvolvimento depende de transformar prompts individuais em ativos de equipe: bibliotecas versionadas, componentes modulares reutilizáveis e documentados.

## Frameworks Introduced
- **Repositório de Prompts como Código (Prompts-as-Code)**:
  - Quando usar: Para compartilhar e padronizar o uso de IA entre todos os desenvolvedores do time.
  - Como:
    1. Criar pasta no repositório (ex: `.prompts/` ou `.agents/skills/`).
    2. Armazenar prompts em Markdown com metadados (variáveis, versão, modelo recomendado).
    3. Integrar com linters e scripts de automação.
- **Arquitetura Modular de Prompts**:
  - Quando usar: Ao compor prompts longos que compartilham componentes comuns.
  - Como: Separar em blocos: `[Regras_Gerais]` + `[Padrao_Arquitetural]` + `[Tarefa_Especifica]`.

## Key Concepts
- **Prompt Library**: Coleção curada de prompts homologados para tarefas rotineiras da equipe.
- **Templating de Prompts**: Uso de placeholders (ex: `{{linguagem}}`, `{{codigo_fonte}}`) para injeção dinâmica de contexto.
- **Versionamento de Prompts**: Histórico de alterações e changelog de prompts via Git.

## Mental Models
- **Prompts como Bibliotecas de Software**: Prompts devem ser versionados, testados, documentados e reutilizados da mesma forma que pacotes NPM, NuGet ou PyPI.
- **Modularização Elimina Duplicação**: Não reescreva as regras de arquitetura do seu projeto em cada prompt; mantenha um arquivo único de convenções que é anexado a todos os prompts.

## Anti-patterns
- **Prompts Perdidos em Históricos Pessoais de Chat**: Cada desenvolvedor usa seus próprios prompts improvisados, gerando código com estilos e padrões divergentes no mesmo projeto.
- **Hardcoding de Contexto Estático**: Criar prompts engessados que exigem retrabalho manual para pequenas variações de entidades.

## Worked Example
```markdown
# Template: Gerador de Camada de Repositório
Versão: 2.1 | Autor: Equipe Backend
Variáveis: {{entidade}}, {{tabela}}, {{dialeto}}

[INSTRUÇÃO]:
Crie a classe de repositório para a entidade {{entidade}} usando a tabela {{tabela}}.
Adote os padrões da nossa arquitetura:
{{include: .prompts/partials/regras-arquitetura.md}}
```

## Key Takeaways
1. Centralize os prompts da equipe no controle de versão (Git).
2. Use modularidade e inclusão de parciais para evitar duplicação de regras arquiteturais.
3. Documente o modelo recomendado e as variáveis necessárias para cada prompt.
