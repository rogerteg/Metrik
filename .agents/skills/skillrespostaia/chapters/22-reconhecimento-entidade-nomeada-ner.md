# Capítulo 22: Solicitações de Reconhecimento de Entidade Nomeada (NER Prompts)

## Core Idea
Prompts de NER (Named Entity Recognition) extraem automaticamente e categorizam termos específicos dentro de textos não estruturados, identificando Pessoas, Organizações, Locais, Datas, Valores Monetários e Códigos Técnicos.

## Frameworks Introduced
- **Fórmula de Extração de Entidades Nomeadas**:
  ```text
  Documento de Entrada:
  """
  [inserir documento legal, relatório ou notícia]
  """

  Tarefa: Identifique e extraia todas as entidades nomeadas presentes no texto acima.
  Instruções:
  - Organize o resultado nas seguintes categorias:
    * PESSOA: Nomes de indivíduos mencionados.
    * ORGANIZACAO: Empresas, instituições governamentais e ONGs.
    * LOCALIZACAO: Cidades, estados, países e endereços.
    * DATA / PERIODO: Datas pontuais e intervalos temporais.
    * VALOR_MONETARIO: Quantias financeiras e moedas.
    * DISPOSITIVO_LEGAL: Leis, artigos e contratos citados.
  - Apresente a saída em uma tabela contendo: Entidade | Categoria | Contexto da Menção.
  ```

## Key Concepts
- **Desambiguação de Entidades**: Diferenciar quando uma palavra representa um local ou uma empresa (ex: "Amazon" como floresta vs empresa de tecnologia).
- **Extração Sem Ruído**: Não capturar adjetivos ou termos comuns como se fossem nomes próprios.

## Mental Models
- **O Marca-Texto de Múltiplas Cores**: Ler um contrato longo grifando de amarelo as pessoas, de verde as quantias em dinheiro, de azul as datas e de rosa as leis aplicáveis.

## Anti-patterns
- **Entidades Fracionadas**: Capturar "Silva" em vez de "Dr. Marcos da Silva", perdendo o nome completo e o título identificador.

## Worked Example
**Extração em Contrato de Prestação de Serviços**:
```text
Trecho Contratual:
"Em 15 de março de 2026, a TechGlobal Soluções Ltda, com sede em Curitiba/PR, representada por Carlos Alberto Souza, celebrou contrato de consultoria com a InovaMedics Brasil S.A., em São Paulo/SP, no valor total de R$ 480.000,00, regido pelas cláusulas da Lei 10.406/2002."

Execute a extração estruturada de entidades nomeadas e retorne em formato JSON categorizado.
```
