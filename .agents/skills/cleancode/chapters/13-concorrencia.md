# Capítulo 13: Concorrência

## Core Idea
A concorrência é uma estratégia de desacoplamento: ela separa **o que** é feito **de quando** é feito. Escrever código concorrente limpo é difícil porque erros de sincronização raramente são repetíveis em testes simples e podem permanecer ocultos por meses até causarem falhas catastróficas em produção.

## Frameworks Introduced
- **Mitos e Realidades da Concorrência**:
  - *Mito*: Concorrência sempre melhora o desempenho. (Fato: Ela só melhora quando há tempo de espera ocioso compartilhado ou múltiplos processadores para tarefas independentes).
  - *Mito*: O design do sistema não muda com a concorrência. (Fato: O design concorrente costuma ser radicalmente diferente do design síncrono).
  - *Fato*: A concorrência introduz sobrecarga operacional de troca de contexto e gerenciamento de travas.
- **Princípios de Defesa de Concorrência**:
  1. *Princípio da Responsabilidade Única (SRP)*: Separe o código que cuida de concorrência do código que cuida das regras de negócio.
  2. *Limite o Escopo dos Dados (Encapsulamento Estrito)*: Proteja com zelo absoluto seções críticas de dados mutáveis compartilhados.
  3. *Use Cópias Imutáveis dos Dados*: Trate os dados como imutáveis ou envie cópias completas entre threads para eliminar a necessidade de locks.
  4. *Threads Devem Ser Tão Independentes Quanto Possível*: Cada thread deve processar sua requisição no seu próprio mundo isolado sem compartilhar memória com outras.
- **Modelos Clássicos de Execução**:
  - *Produtor-Consumidor*: Filas bloqueantes delimitadas.
  - *Leitores-Escritores*: Evitar starvation de escritores sem penalizar a leitura massiva.
  - *Jantar dos Filósofos*: Prevenção ativa de deadlocks e livelocks.
- **Estratégias de Teste para Concorrência**:
  - Trate falhas esporádicas como bugs reais de concorrência, e não como "flukes" ou anomalias passageiras.
  - Execute testes com mais threads do que o número de núcleos físicos para forçar chaveamento massivo de contexto.
  - Teste em diferentes plataformas de hardware e use instrumentação (como jiggle de threads com `sleep` e `yield` aleatórios).

## Key Concepts
- **Condição de Corrida (Race Condition)**: Quando duas ou mais threads acessam e alteram dados compartilhados simultaneamente sem sincronização.
- **Deadlock**: Situação onde duas threads ficam bloqueadas para sempre, cada uma esperando pela liberação do recurso retido pela outra.

## Mental Models
- **A Cozinha do Restaurante com Múltiplos Cozinheiros**: Se dois cozinheiros tentarem usar a mesma faca e a mesma frigideira sem comunicação (dados compartilhados mutáveis), haverá acidentes; se cada um tiver sua própria bancada e ingredientes (isolamento/imutabilidade), a produção voa.

## Anti-patterns
- **Ignorar Erros Não Repetíveis**: Dizer "ah, esse teste só falha uma vez a cada 100 execuções, deve ser instabilidade do servidor" e ignorar o aviso de uma condição de corrida mortal.
