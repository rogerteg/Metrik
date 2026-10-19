# Feature Specification: Confiabilidade do Pipeline e Verificação Automatizada (Ciclo 1)

**Feature Branch**: `044-pipeline-reliability`

**Created**: 2026-10-15

**Status**: Implemented

**Input**: User description: "/speckit-specify Ciclo 1: Confiabilidade do Pipeline (P1)"

---

## Contexto e Escopo

Esta especificação formaliza o **Ciclo 1 de Confiabilidade do Pipeline**, concebido para restaurar o sinal de integridade contínua e confiança automatizada do repositório Metrik, em cumprimento direto ao **Princípio III da Constituição do Projeto (Automated Verification & Testing)**.

Atualmente, o sistema possui 701 casos de teste automatizados distribuídos em 113 arquivos, mas a suíte apresenta falhas determinísticas decorrentes do acoplamento dos testes à data corrente do sistema. Quando o tempo avança além das janelas temporais de amostragem de dados históricos, os testes deixam de encontrar os elementos visuais esperados e falham. Além disso, a instrumentação de medição de cobertura de código anunciada na esteira de integração não tem persistido seus relatórios comprobatórios em disco.

O escopo desta entrega é restabelecer a confiabilidade dos gates de validação e assegurar que qualquer modificação no produto possa ser aprovada ou rejeitada com base em sinais objetivos e repetíveis, e nunca em inspeção manual.

---

## Clarifications

### Session 2026-10-15

- Q: Qual abordagem deve ser adotada para eliminar a dependência temporal nas suítes de testes que utilizam janelas móveis? → A: Congelamento do Relógio via Mock de Timers (`vi.useFakeTimers` / `vi.setSystemTime`) fixando a data de avaliação no início de cada suíte temporal com restauração limpa após os testes.
- Q: Quais formatos de relatório devem ser obrigatoriamente produzidos e persistidos pelo gate de cobertura (`coverage/`)? → A: Matriz Completa (`text-summary`, `html`, `lcov`) gravada em disco no diretório `coverage/`, atendendo simultaneamente desenvolvedores e esteiras de CI.


---

## User Scenarios & Testing *(mandatory)*


### User Story 1 - Confiança Absoluta na Suíte de Testes sem Dependência Temporal (Priority: P1)

Como engenheiro mantenedor ou auditor de qualidade do Metrik,  
quero que a suíte completa de verificações automatizadas execute com 100% de sucesso independente do dia, mês, ano ou fuso horário em que for executada,  
para que eu tenha certeza imediata de que nenhuma funcionalidade de cálculo de fluxo ou exibição analítica regrediu.

**Why this priority**: A Constituição do Metrik estipula que nenhuma entrega é considerada completa enquanto houver falhas na suíte de testes. Restabelecer o sinal verde é o pré-requisito mandatório para destravar todas as demais melhorias e evoluções do sistema.

**Independent Test**: Executar a suíte completa de testes automatizados com simulação de datas presentes e futuras (por exemplo, 30 dias à frente e 1 ano à frente). A suíte deve retornar 100% de casos aprovados (zero falhas e zero erros).

**Acceptance Scenarios**:

1. **Given** o repositório em seu estado atual, **When** a suíte de testes automatizados for disparada, **Then** todos os 113 arquivos de teste e todos os casos de teste devem ser concluídos com sucesso (zero falhas).
2. **Given** os testes das visualizações analíticas de Tempo de Ciclo e Simulação de Monte Carlo, **When** executados sob qualquer instante temporal, **Then** as janelas móveis de amostragem devem processar os dados históricos de forma determinística sem renderizar estados vazios acidentais.
3. **Given** a suíte de testes executando em ambientes com fusos horários distintos (UTC, GMT-3, etc.), **When** os cálculos de métricas e limites de tempo forem avaliados, **Then** os resultados devem manter paridade e consistência estrita.

---

### User Story 2 - Comprovação de Cobertura de Código com Persistência de Relatório (Priority: P1)

Como líder técnico ou responsável pelo produto,  
quero que a execução da verificação de cobertura gere e persista arquivos de evidência auditáveis em disco,  
para que o percentual de cobertura do código seja mensurado com precisão e atenda aos limiares de segurança estabelecidos.

**Why this priority**: Princípio Constitucional III.4 ("Gates Must Prove Themselves"): um gate que se anuncia mas não gera evidência concreta é considerado inerte. A evidência de cobertura é mandatória para certificar que novas funcionalidades não degradam os patamares de teste.

**Independent Test**: Disparar o comando de verificação com cobertura e verificar se os relatórios estruturados e visualizáveis são gerados no diretório de saída com métricas válidas e legíveis.

**Acceptance Scenarios**:

1. **Given** o comando de teste com cobertura em execução, **When** a execução finalizar com sucesso, **Then** o relatório de cobertura detalhado deve estar fisicamente presente no diretório designado.
2. **Given** o relatório de cobertura gerado, **When** inspecionado por ferramentas ou humanos, **Then** deve apresentar os percentuais exatos de instruções, ramificações, linhas e funções auditadas.
3. **Given** um patamar de cobertura abaixo do limite mínimo configurado para o projeto, **When** o processo for avaliado pelo pipeline, **Then** o sinal de saída deve alertar explicitamente a violação do limiar.

---

### User Story 3 - Ratchet Estrito de Qualidade e Teto de Avisos Estáticos (Priority: P2)

Como desenvolvedor contribuindo com o código,  
quero que o processo de análise estática garanta que nenhum novo aviso de qualidade seja introduzido,  
para que a dívida técnica convirja progressivamente para zero sem acréscimos silenciosos.

**Why this priority**: Evita a degradação silenciosa da base de código e formaliza o controle de dívida técnica conforme o Princípio III.2 da Constituição.

**Independent Test**: Executar a análise estática do projeto e validar que a contagem de avisos não ultrapassa a barreira histórica documentada e que zero erros impeditivos são encontrados.

**Acceptance Scenarios**:

1. **Given** a base de código do projeto, **When** a análise estática for executada, **Then** deve concluir com código de saída 0 e zero erros críticos.
2. **Given** a contagem de avisos existentes, **When** uma alteração for submetida, **Then** a quantidade de avisos reportados deve ser igual ou menor que o patamar de referência anterior (ratchet não-crescente).

---

## Edge Cases

- **Viradas de Mês e Ano Bissexto**: O cálculo de janelas móveis (14, 30, 60, 90 dias) não deve romper ao cruzar meses com quantidades diferentes de dias (ex: 28, 29, 30 ou 31 dias) nem anos bissextos.
- **Diferenças de Fuso Horário entre Local e CI**: Testes executados em servidores de integração contínua configurados em UTC não devem divergir de execuções em máquinas locais operando em UTC-3.
- **Histórico Parcial ou Vazio Intencional**: Casos de teste que validam especificamente o estado de "histórico insuficiente" devem continuar garantindo a exibição das orientações ao usuário quando os dados forem deliberadamente omitidos.
- **Execução Paralela e Concorrência**: A geração de relatórios de cobertura não deve corromper arquivos intermediários quando múltiplos testes forem executados em paralelo.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema de verificação MUST garantir que 100% dos testes unitários e de integração passem com sucesso sem depender da data atual do relógio físico do ambiente.
- **FR-002**: As fixtures e conjuntos de dados mockados para testes de gráficos de fluxo (Dispersão de Tempo de Ciclo, Simulação de Monte Carlo, Envelhecimento de WIP e Linha do Tempo) MUST ser temporalmente autônomos ou calibrados via congelamento controlado do tempo.
- **FR-003**: A verificação automatizada MUST proibir expressamente o afrouxamento, exclusão ou omissão de asserções como forma de obter resultado verde (Constituição III.3).
- **FR-004**: O gate de medição de cobertura MUST produzir e salvar arquivos de relatório auditáveis na matriz completa (`text-summary`, `html` e `lcov`) no caminho padronizado `coverage/` do projeto.
- **FR-005**: A execução de verificação de tipos e empacotamento de produção MUST manter zero erros e zero falhas de compilação.
- **FR-006**: A rotina de análise estática MUST reportar de forma transparente o total de avisos monitorados, garantindo que nenhum aviso adicional seja tolerado.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos testes da suíte automatizada (todos os 113 arquivos e mais de 700 casos de teste) passam com zero falhas e zero erros em execuções locais e no pipeline de CI.
- **SC-002**: A suíte de testes permanece integralmente verde ao ser executada em múltiplas datas arbitrárias simuladas (passado, presente e futuro).
- **SC-003**: O relatório de cobertura de código é gerado e comprovadamente gravado em disco a cada execução da suíte de cobertura, disponibilizando a árvore `coverage/index.html` para inspeção visual e `coverage/lcov.info` para integrações.
- **SC-004**: O tempo total de execução da suíte completa de testes no ambiente local permanece inferior a 45 segundos.
- **SC-005**: O processo de compilação e validação de tipos conclui com código de saída 0 sem emissão de mensagens de erro.

---

## Assumptions

- A causa raiz das 7 falhas atuais reside exclusivamente nas fixtures de datas estáticas em relação à data corrente do sistema nos testes de Monte Carlo e Dispersão de Tempo de Ciclo, não havendo regressão lógica no código de produção.
- O motor de testes do projeto oferece suporte nativo e estável a congelamento/manipulação temporal determinística (`vi.useFakeTimers`).
- O ambiente de execução possui permissão padrão de escrita no diretório do projeto para gravação dos artefatos de cobertura.
- A correção dos testes manterá intactas todas as regras de negócio de fluxo, limites de WIP, percentis probabilísticos e governança kanban.
