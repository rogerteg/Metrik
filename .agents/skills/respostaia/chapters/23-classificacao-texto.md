# Capítulo 23: Solicitações de Classificação de Texto (Text Classification Prompts)

## Core Idea
A classificação de texto categoriza documentos, e-mails ou mensagens em classes funcionais predefinidas, habilitando automação de triagem, roteamento inteligente e filtros de segurança.

## Frameworks Introduced
- **Fórmula de Classificação com Roteamento**:
  ```text
  Mensagem Recebida: [inserir texto]
  Classifique a mensagem em exatamente uma das categorias abaixo:
  - [SPAM]: Propaganda não solicitada ou tentativa de phishing.
  - [URGENTE]: Problema de sistema fora do ar ou risco imediato de perda.
  - [FINANCEIRO]: Dúvidas de faturas, reembolsos e boletos.
  - [SUPORTE_TECNICO]: Dificuldade no uso do produto.
  - [GERAL]: Outras dúvidas institucionais.

  Saída requerida: Categoria, Nível de Confiança (Alto/Médio/Baixo) e Departamento de Encaminhamento.
  ```

## Key Concepts
- **Diferença entre Classificação e Análise de Sentimento**: Classificação foca na *função/tema* da mensagem; análise de sentimento foca na *emoção* expressa.
- **Roteamento Automático**: Uso da categoria como gatilho de webhook para direcionar a mensagem ao atendente correto.

## Mental Models
- **A Caixa de Correspondência Central**: O carteiro olha o envelope e despacha para a mesa de Contabilidade, Jurídico ou Lixeira sem precisar ler cada detalhe do conteúdo.

## Anti-patterns
- **Categorias Ambíguas ou Conflitantes**: Criar categorias como "Problemas de Software" e "Erros no Computador" sem fronteiras claras de separação.

## Worked Example
**Triagem Automática de Caixa de Entrada Compartilhada**:
```text
E-mail Recebido:
"Prezados, estamos tentando rodar o fechamento da folha de pagamento de agosto mas a chave de integração com a Receita Federal expirou e não conseguimos gerar as guias. A multa por atraso incidirá hoje às 18h."

Classifique este e-mail quanto a:
1. Categoria Temática: [FINANCEIRO / SUPORTE / RH]
2. Nível de Prioridade: [BAIXA / MEDIA / ALTA / CRITICA]
3. Ação Imediata Recomendada: [Resumo da ação em 1 frase]
```
