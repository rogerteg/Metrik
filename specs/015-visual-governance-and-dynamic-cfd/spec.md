# Feature 015: Governança Visual de Colunas, Fluxo Unidirecional Estrito, Estagnação Temporal e Dinâmica do CFD

## 1. Contexto & Motivação
Com o amadurecimento do **Metrik**, novas capacidades e regras de negócio essenciais de gestão Kanban e visualização foram solicitadas e implementadas diretamente na interface e nas camadas de domínio:
1. **Regras de Reordenação de Colunas**: Bloqueio estrito da primeira coluna (`To Do`) para manter a âncora de entrada de fluxo do sistema. A última coluna (`Completed`) agora possui reordenação permitida caso o time deseje adicionar colunas de pós-entrega.
2. **Fluxo Unidirecional Estrito com Alerta**: Tentativas de mover cartões da direita para a esquerda (regressão de fluxo) agora são firmemente bloqueadas, mantendo o cartão na coluna vigente e alertando o usuário com a advertência `"Cuidado!"`.
3. **Identidade Visual por Coluna**: Cada coluna possui uma paleta de cores configurável no cabeçalho. Os cartões alocados na coluna herdam automaticamente o estilo/borda da cor da coluna.
4. **Alerta de Estagnação Temporal (Card Marrom)**: Tarefas que permanecem sem movimentação no quadro mudam dinamicamente de cor para marrom escuro com badge visual de estagnação. Para habilitar essa rastreabilidade, foram adicionados explicitamente os campos `startedAt` (início) e `completedAt` (fim da tarefa) nos detalhes do cartão.
5. **Harmonização Clean e Sincronização Dinâmica do CFD**:
   - Gráficos de Throughput e Lead Time atualizados com paleta *clean* (tons suaves de *Sky Blue* e *Soft Indigo/Periwinkle*).
   - Modal dinâmico de expansão individual para cada gráfico analítico.
   - O gráfico de Fluxo Cumulativo (CFD) agora mapeia **todas as etapas reais do quadro** (não apenas 3 genéricas) e suas ondas coloridas herdam dinamicamente a mesma cor exata selecionada na coluna do quadro.
6. **Identidade Visual da Marca**: Logotipo oficial do Metrik integrado ao cabeçalho da aplicação e ao favicon.

Este documento consolida e converge as especificações e contratos vivos dessas capacidades no repositório de governança SDD.

---

## 2. Escopo & Requisitos

### 2.1 Reordenação de Colunas & Âncora de Entrada
- **FR-001**: A primeira coluna (`index === 0`, tipicamente `To Do`) é fixa e não pode ser reordenada para manter o ponto de partida do fluxo de valor.
- **FR-002**: Demais colunas podem ser movidas para a esquerda e para a direita através dos botões de movimentação ou drag-and-drop.

### 2.2 Bloqueio de Movimento Retrógrado (Fluxo Unidirecional)
- **FR-003**: Ao tentar arrastar ou mover um cartão para uma coluna localizada fisicamente à esquerda da coluna de origem (`targetColIndex < sourceColIndex`):
  - O sistema emite alerta `"Cuidado! O fluxo é estritamente unidirecional."`.
  - O movimento é imediatamente revertido, mantendo o cartão na coluna vigente.

### 2.3 Cores Customizáveis por Coluna e Herança nos Cards
- **FR-004**: O usuário pode selecionar a cor tema de cada coluna através de um seletor visual no cabeçalho da coluna (`ColumnHeader`).
- **FR-005**: Todo cartão exibido em uma coluna herda a cor configurada na coluna como cor primária de destaque (borda/fundo suave).

### 2.4 Monitoramento de Estagnação & Campos Temporais
- **FR-006**: Toda tarefa suporta campos de início de execução (`startedAt`) e fim de execução (`completedAt`), editáveis e visíveis no `TaskDetailsModal`.
- **FR-007**: Se uma tarefa não concluída permanece parada sem movimentação por período prolongado, o cartão adquire estilização marrom (`card-stagnant`) com badge indicativo de estagnação para atrair a atenção imediata da equipe.

### 2.5 Analytics Clean, Expansão e CFD Dinâmico
- **FR-008**: Os gráficos analíticos (Throughput e Lead Time) utilizam paleta de cores limpa, sem poluição visual.
- **FR-009**: Cada gráfico possui botão para expandir em tela cheia/modal individual focado.
- **FR-010**: As ondas e legendas do gráfico CFD refletem todas as etapas configuradas no quadro Kanban ativo e herdam dinamicamente a cor da coluna correspondente (`getDefaultColumnColor(col)`).

---

## 3. Critérios de Aceitação
1. A primeira coluna permanece desabilitada para movimentação à esquerda/direita.
2. Nenhuma tarefa pode ser movida para a esquerda; a ação dispara alerta "Cuidado" e mantém a tarefa no local original.
3. Alterar a cor de uma coluna atualiza instantaneamente a aparência dos cartões nela contidos e as ondas correspondentes no CFD.
4. Cartões estagnados exibem cor marrom e badge de aviso.
5. Gráficos expandem individualmente em modal e Throughput/Lead Time possuem estética *clean*.
6. 100% da suíte de testes unitários passa e o build de produção compila com sucesso.
