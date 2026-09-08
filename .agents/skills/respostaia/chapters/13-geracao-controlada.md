# Capítulo 13: Prompts de Geração Controlada (Controlled Generation Prompting)

## Core Idea
A geração controlada impõe limites formais rígidos sobre a saída do modelo: teto e piso de palavras, formatos estruturados inegociáveis (JSON, YAML, CSV), proibições terminológicas estritas e regras sintáticas gramaticais.

## Frameworks Introduced
- **Fórmula de Geração Controlada**:
  ```text
  Gere [tarefa] em estrita conformidade com as seguintes restrições:
  - Formato de saída: [JSON puro sem blocos markdown extras]
  - Tamanho: Exatamente entre [X] e [Y] palavras/caracteres.
  - Vocabulário proibido: [lista de termos vetados].
  - Elementos obrigatórios: [campos ou tópicos indispensáveis].
  ```
- **Os Quatro Mecanismos de Controle**:
  1. *Controle de Extensão*: Limite máximo/mínimo rigoroso.
  2. *Controle Sintático/Formato*: JSON schema estrito, markdown table com colunas fixas.
  3. *Controle Lexical*: Dicionário permitido vs dicionário proibido.
  4. *Controle de Público*: Nível de leitura (ex: Flesch-Kincaid nível 6º ano escolar).

## Key Concepts
- **Restrição Dura (Hard Constraint)**: Regras cuja violação invalida a resposta (ex: retorno não-JSON que quebra um parser downstream).
- **Purismo de Saída**: Garantir que o modelo não adicione comentários introdutórios como "Com certeza, aqui está o seu JSON:".

## Mental Models
- **A Máquina de Estamparia Industrial**: A matéria-prima entra e deve sair exatamente com as dimensões e tolerâncias da matriz, sem rebarbas.

## Anti-patterns
- **Confiar em 'Seja Breve'**: Dizer apenas "seja curto" em vez de fixar "em exatamente 3 tópicos de no máximo 20 palavras cada".

## Worked Example
**Extração de Definições em Formato Controlado**:
```text
Tarefa: Definir o termo técnico "Idempotência em APIs REST".
Restrições de Geração Controlada:
1. Saída estritamente no formato JSON com as chaves: "termo", "definicao_executiva", "exemplo_pratico_http", "impacto_falha".
2. Não utilize palavras em inglês não traduzidas exceto métodos HTTP (POST, GET, PUT, DELETE).
3. A "definicao_executiva" deve ter no máximo 40 palavras.
4. Responda apenas o JSON puro, sem crases markdown e sem introduções ou cumprimentos.
```
