# Padrões Operacionais do Agentic SDD (Anatoly Volkhover)

Blueprints práticos e templates de execução para implementar o método Agentic SDD no dia a dia.

---

## Padrão 1: O Protocolo de Resolução de Conflitos de Regras (Rule Conflict Protocol)
- **Quando usar**: Quando o agente detectar que uma regra do projeto entra em contradição com outra diretriz ativa.
- **Procedimento**:
  1. O agente suspende imediatamente a geração de código ou especificações.
  2. O agente formula a colisão no formato padronizado:
     ```markdown
     ## Conflito de Regras Detectado
     - **Regra A**: [ID e texto da regra A] (Origem: file.md#L10)
     - **Regra B**: [ID e texto da regra B] (Origem: file.md#L45)
     - **Cenário de Colisão**: [Descrever por que ambas não podem ser cumpridas juntas]
     - **Opção 1**: [Favorecer Regra A com trade-offs]
     - **Opção 2**: [Favorecer Regra B com trade-offs]
     - **Opção 3 (Reconciliação)**: [Nova redação harmonizada]
     ```
  3. O Handler arbitra a decisão.
  4. O agente registra o evento no `rule-conflict-log.md` e harmoniza os arquivos antes de prosseguir.

---

## Padrão 2: O Protocolo de Desambiguação de Glossário (Disambiguation Protocol)
- **Quando usar**: Sempre que surgir um termo com mais de uma interpretação possível no domínio.
- **Template de Prompt**:
  ```text
  MODO: Research & Suggest
  Contexto: Estamos elaborando a especificação do módulo [Módulo].
  Termo sob análise: "[Termo]"

  Ações requeridas:
  1. Verifique se o termo já consta no `glossary.md`.
  2. Identifique todos os significados concorrentes que este termo pode ter entre Produto, Engenharia e Operações.
  3. Proponha uma Definição Canônica única para o projeto.
  4. Liste sinônimos depreciados que NÃO devem ser utilizados na documentação.
  5. Apresente o bloco pronto para adição ao `glossary.md`.
  ```

---

## Padrão 3: A Execução Simulada (The Dry Run Simulator)
- **Quando usar**: Para testar a especificação como se fosse um compilador de regras de negócio antes de implementar.
- **Template de Prompt**:
  ```text
  MODO: Command (Simulação Estrita)
  Contexto de Arquivos: Apenas `specs/checkout.md` e `glossary.md`.
  
  Cenário de Teste:
  - Usuário com carrinho de R$ 450,00 tenta finalizar compra com cupom de desconto "PRIMEIRA10" vencido há 2 horas e cartão de crédito recusado por falta de limite.

  Instruções de Simulação:
  1. Execute o fluxo passo a passo atuando como o interpretador estrito da especificação.
  2. Para cada decisão, cite expressamente a Seção e Linha da especificação que determinou a ação.
  3. Se a especificação não definir o que acontece em alguma das etapas (ex: ordem de validação do cupom vs chamada da adquirente), PARE e declare explicitamente: "ESTADO NÃO DEFINIDO NA ESPECIFICAÇÃO".
  ```

---

## Padrão 4: A Disciplina de Artefatos Derivados
- **Quando usar**: Para gerar diagramas Mermaid, telas HTML interativas e documentação executiva a partir de especificações.
- **Regra**:
  - `specs/feature.md` é a única fonte da verdade.
  - Script de compilação gera `artifacts/feature.html` de forma determinística.
  - Nunca commite edições manuais no arquivo HTML derivado.
