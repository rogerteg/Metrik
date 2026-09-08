# Padrões Arquiteturais de Composição de Prompts (Ibrahim John)

Padrões de engenharia para combinar múltiplas técnicas de prompt em soluções robustas para produção.

---

## Padrão 1: A Fortaleza Corporativa (Role + Strict Instruction + Negative Constraint)
- **Quando usar**: Na geração de documentos regulatórios, relatórios para clientes ou comunicações sensíveis de RH/Jurídico.
- **Estrutura**:
  ```text
  [PAPEL]: Como Consultor Jurídico Sênior em Direito Digital,
  [TAREFA]: Redija a cláusula de limitação de responsabilidade para um contrato SaaS B2B.
  [INSTRUÇÕES POSITIVAS]:
  - Limite a responsabilidade indenizatória ao valor total pago pelo cliente nos últimos 12 meses.
  - Exclua expressamente lucros cessantes, perda de dados e danos indiretos.
  [RESTRIÇÕES NEGATIVAS]:
  - Não utilize terminologias em língua estrangeira sem equivalência no vernáculo jurídico nacional.
  - Não deixe lacunas ou colchetes vazios; utilize dados de um contrato fictício realista.
  ```

---

## Padrão 2: O Raciocínio Auditável (Knowledge Generation + CoT + Self-Consistency)
- **Quando usar**: Decisões de arquitetura técnica, investimentos financeiros ou análise de incidentes de segurança.
- **Estrutura**:
  ```text
  [FASE 1 - GERAÇÃO DE CONHECIMENTO]:
  Liste os 4 princípios fundamentais do Teorema CAP e as características de bancos de dados baseados em Raft.
  
  [FASE 2 - CADEIA DE RACIOCÍNIO]:
  Diante do requisito de consistência estrita para transferências bancárias em ambiente distribuído multi-região, avalie passo a passo se o DynamoDB com transações atende aos requisitos ou se o CockroachDB é mandatório.
  
  [FASE 3 - AUTOCONSISTÊNCIA]:
  Gere 3 análises considerando:
  - Análise A: Custo e complexidade operacional em escala.
  - Análise B: Latência de escrita entre continentes.
  - Análise C: Facilidade de recuperação em caso de particionamento de rede.
  Conclua indicando a arquitetura consensual recomendada.
  ```

---

## Padrão 3: O Funil de Triagem Industrial (NER + Classification + Controlled JSON)
- **Quando usar**: Ingestão automática de e-mails, processamento de tickets de suporte ou auditoria de contratos.
- **Estrutura**:
  ```text
  Entrada: """[inserir e-mail ou ticket de cliente]"""
  
  Execute o pipeline de processamento em uma única passada estruturada:
  1. Extraia entidades nomeadas: Nome do Cliente, Número do Pedido, Valor Envolvido e Data da Compra.
  2. Classifique o sentimento da mensagem: [Muito Insatisfeito / Frustrado / Neutro / Elogio].
  3. Classifique a urgência: [P1 - Crítica / P2 - Alta / P3 - Normal / P4 - Baixa].
  4. Formate a saída estritamente como JSON válido:
  {
    "cliente": "...",
    "pedido": "...",
    "valor": 0.0,
    "sentimento": "...",
    "urgencia": "...",
    "fila_roteamento": "..."
  }
  ```

---

## Padrão 4: O Treinamento Pedagógico (Curriculum Learning + Reinforcement Iteration)
- **Quando usar**: Onboarding de novos desenvolvedores, explicação de tópicos matemáticos ou aculturamento de equipe em novas metodologias.
- **Estrutura**:
  ```text
  [PROGRESSÃO CURRICULAR]:
  Apresente o conceito de 'Princípio Aberto-Fechado (OCP do SOLID)' em 3 etapas progressivas:
  Etapa 1: Analogia do dia a dia para quem nunca programou.
  Etapa 2: Código com anti-padrão comum (ifs aninhados crescendo indefinidamente).
  Etapa 3: Refatoração profissional usando polimorfismo e injeção de dependência.
  
  [REFORÇO CORRETIVO]:
  Após a explicação, avalie o entendimento propondo um pequeno exercício prático.
  ```
