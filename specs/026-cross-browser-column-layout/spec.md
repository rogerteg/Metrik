# Feature Specification: Paridade de Renderização do Quadro entre Navegadores

**Feature Branch**: `026-cross-browser-column-layout`

**Created**: 2026-09-14

**Status**: Draft

**Input**: User description: "Correção: porque com o browser microsoft Edge, aparece completo. E no browser crhome, aparece o sistema, com as colunas de forma erronea. Preciso que o sistema aparece em todos os browsers como aparece no microsoft Edge."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quadro idêntico em qualquer navegador (Priority: P1)

Como membro de uma squad, quero abrir o Metrik em qualquer navegador suportado e ver o quadro exatamente como ele aparece no Microsoft Edge, para não precisar trocar de navegador nem desconfiar do que estou vendo.

**Why this priority**: É o defeito relatado e o único requisito que precisa ser verdadeiro para a correção ter valor. A apresentação do quadro não pode depender do navegador escolhido pelo usuário.

**Independent Test**: Abrir o mesmo quadro no Microsoft Edge, Google Chrome, Mozilla Firefox e Apple Safari e comparar, lado a lado e em telas de mesma resolução e mesmo nível de ampliação, a quantidade, a ordem, a largura e o espaçamento das colunas, além de cabeçalhos, badges e cartões.

**Acceptance Scenarios**:

1. **Given** um quadro com várias colunas e cartões distribuídos, **When** o usuário abre o mesmo quadro no Edge e no Chrome na mesma resolução e ampliação, **Then** o quadro apresenta a mesma quantidade de colunas, na mesma ordem, com as mesmas larguras e o mesmo espaçamento, sem coluna cortada, sobreposta, colapsada ou deslocada.
2. **Given** um quadro aberto em qualquer navegador suportado, **When** o usuário compara a área do quadro com a referência do Edge, **Then** não há diferença visual perceptível além de arredondamentos de subpixel.
3. **Given** um quadro cuja soma das larguras excede a janela, **When** renderizado em qualquer navegador, **Then** a rolagem horizontal acontece dentro da área do quadro, sem empurrar, cortar ou desalinhar o cabeçalho, a barra de métricas e a barra de filtros.
4. **Given** um usuário no Chrome que hoje vê as colunas erradas, **When** ele recarrega a aplicação após a correção, **Then** o quadro aparece equivalente ao Edge sem nenhum ajuste manual de ampliação, fonte ou configuração do navegador.

---

### User Story 2 - Layout previsível em diferentes janelas, ampliação e densidade de tela (Priority: P2)

Como usuário, quero que o quadro continue alinhado e legível quando redimensiono a janela, altero a ampliação do navegador ou uso um monitor com outra densidade de pixels, para que meu trabalho não pare ao mudar de tela.

**Why this priority**: O sintoma de "colunas erradas" tende a aparecer justamente quando o navegador calcula dimensões de forma diferente (ampliação, barra de rolagem, fontes). Sem isso, a correção apenas esconderia o sintoma.

**Independent Test**: Em cada navegador suportado, abrir o mesmo quadro com ampliação de 50%, 100%, 150% e 200% e em janelas de 1280×720, 1920×1080 e 2560×1440, verificando alinhamento, ausência de corte e ausência de sobreposição.

**Acceptance Scenarios**:

1. **Given** o quadro aberto, **When** o usuário altera a ampliação do navegador entre 50% e 200%, **Then** as colunas permanecem alinhadas, sem sobreposição nem corte de conteúdo, em todos os navegadores suportados.
2. **Given** o quadro aberto, **When** a janela é reduzida até 1280 pixels de largura, **Then** todas as colunas permanecem acessíveis por rolagem horizontal contida, sem quebra de layout.
3. **Given** um quadro com a quantidade máxima de colunas permitida, **When** a janela é menor que a soma das larguras das colunas, **Then** nenhum conteúdo fica inacessível e nada é cortado fora da área rolável.
4. **Given** um monitor com densidade de pixels superior a 100%, **When** o quadro é aberto, **Then** bordas, espaçamentos e textos permanecem nítidos e alinhados.

---

### User Story 3 - Nenhum ajuste dependente de um navegador específico (Priority: P3)

Como mantenedor do produto, quero que a correção seja única e válida para todos os navegadores, para que o comportamento não volte a divergir a cada atualização de navegador.

**Why this priority**: Evita correções paliativas por navegador, que criam dívida técnica e novos defeitos, e garante que o layout não dependa de comportamentos exclusivos de um fabricante.

**Independent Test**: Verificar que o layout final é obtido sem qualquer regra exclusiva de navegador e que o quadro permanece correto quando recursos opcionais modernos não estão disponíveis.

**Acceptance Scenarios**:

1. **Given** qualquer navegador suportado, **When** o quadro é renderizado, **Then** o layout não depende da identificação do navegador nem de comportamentos exclusivos de um fabricante.
2. **Given** um navegador que não oferece determinado recurso de estilo opcional, **When** o quadro é renderizado, **Then** o layout degrada para uma variação funcional e alinhada, nunca para colunas erradas.
3. **Given** o mesmo quadro aberto em navegadores cujas barras de rolagem têm larguras diferentes, **When** comparados, **Then** a largura útil das colunas e o alinhamento permanecem equivalentes.

### Edge Cases

- Janela muito estreita (abaixo de 1280 pixels): o quadro mantém rolagem horizontal contida e não quebra cabeçalho, métricas e filtros.
- Ampliação extrema (50% e 200%): nenhuma coluna pode colapsar, sobrepor-se ou ser cortada.
- Barras de rolagem sobrepostas versus clássicas: a largura útil da coluna não pode variar de forma perceptível.
- Fontes ausentes ou diferentes no sistema: títulos, tags e badges quebram linha ou truncam dentro do cartão, sem estourar a coluna.
- Nomes de coluna e títulos de cartão muito longos: o cabeçalho da coluna não pode empurrar nem estreitar as colunas vizinhas.
- Quadros nos extremos permitidos (2 colunas e o máximo de 12): paridade mantida nos dois casos.
- Monitor com densidade de pixels elevada (150% e 200%): bordas e espaçamentos permanecem consistentes.
- Quadro recém-criado, sem larguras de coluna previamente salvas: a largura inicial não pode gerar rolagem horizontal desnecessária nem colunas apertadas.
- Larguras de coluna salvas inválidas ou fora da faixa permitida: o quadro deve ignorá-las e voltar a um layout íntegro em todos os navegadores.
- Alternância entre temas claro, escuro e neutro: a paridade de layout se mantém, variando apenas as cores.
- Visão de Analytics e painéis modais: as demais telas não podem divergir entre navegadores.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O quadro MUST renderizar todas as colunas com largura, ordem, espaçamento e alinhamento idênticos em todos os navegadores suportados, para o mesmo conteúdo, a mesma resolução e a mesma ampliação.
- **FR-002**: Nenhuma coluna MUST ser cortada, sobreposta, colapsada ou posicionada fora da área visível do quadro em qualquer navegador suportado.
- **FR-003**: Quando a soma das larguras das colunas exceder a largura disponível, o quadro MUST oferecer rolagem horizontal contida em sua própria área, sem deslocar ou quebrar cabeçalho, barra de métricas e barra de filtros.
- **FR-004**: A altura útil das colunas e das listas de cartões MUST ser estável e independente do estilo de barra de rolagem adotado pelo navegador.
- **FR-005**: Textos de cartões, tags, badges e cabeçalhos de coluna MUST quebrar linha ou truncar dentro dos seus contêineres, sem provocar estouro, sobreposição ou alteração da largura da coluna.
- **FR-006**: O sistema MUST NOT basear decisões de layout na identificação do navegador ou do sistema operacional do usuário.
- **FR-007**: Todo recurso de estilo sem suporte universal MUST possuir alternativa funcional, de modo que a ausência do recurso nunca resulte em layout incorreto.
- **FR-008**: O layout MUST permanecer íntegro com ampliação do navegador de 50% a 200% e com densidade de tela de 100% a 200%.
- **FR-009**: As larguras de coluna persistidas MUST ser aplicadas de forma consistente entre navegadores, e valores inválidos, corrompidos ou fora da faixa permitida MUST ser descartados em favor de um layout íntegro.
- **FR-010**: Na ausência de larguras persistidas, o quadro MUST calcular uma largura inicial que caiba na janela disponível sem gerar rolagem horizontal desnecessária, em qualquer navegador.
- **FR-011**: As interações de redimensionamento de coluna, arraste de cartão e arraste de coluna MUST permanecer operáveis em todos os navegadores suportados, com a mesma área de acionamento.
- **FR-012**: Os temas claro, escuro e neutro MUST manter o mesmo layout em todos os navegadores, variando apenas as cores.
- **FR-013**: A visão de Analytics e os painéis modais MUST manter a mesma paridade de renderização exigida para o quadro.
- **FR-014**: Quando uma coluna ou um cartão não puder ser renderizado como esperado, o sistema MUST apresentar um layout alternativo íntegro e registrar diagnóstico suficiente para identificar a causa.

### Requisitos Não-Funcionais

- **NFR-001 [Portabilidade]**: O layout MUST ser obtido apenas com recursos de estilo amplamente suportados pelos navegadores alvo, sem dependência de recursos exclusivos de um único fabricante.
- **NFR-002 [Tolerância de Paridade]**: A diferença de largura e de posição das colunas entre navegadores MUST NOT exceder 1 pixel; quantidade, ordem e visibilidade das colunas MUST ser exatamente iguais.
- **NFR-003 [Desempenho]**: A correção MUST NOT degradar a fluidez de rolagem e de arraste, mantendo a meta de 60 quadros por segundo.
- **NFR-004 [Acessibilidade]**: Foco visível, navegação por teclado e contraste MUST permanecer conformes com WCAG 2.1 AA em todos os navegadores suportados.
- **NFR-005 [Soberania Local-First]**: A correção MUST preservar o funcionamento local, sem introduzir dependência de serviços externos ou de recursos de servidor.
- **NFR-006 [Simplicidade]**: A correção MUST NOT introduzir bibliotecas adicionais de layout nem complexidade não exigida pelos requisitos acima.

### Key Entities *(include if feature involves data)*

- **Quadro (Board)**: conjunto ordenado de colunas e cartões exibido na tela; é a unidade cuja apresentação precisa ser equivalente entre navegadores.
- **Coluna (Column)**: faixa vertical do quadro com título, contador e lista de cartões; possui largura própria e posição definida dentro do quadro.
- **Largura de Coluna Persistida**: preferência numérica de largura associada a uma coluna de um quadro, com faixa mínima e máxima válida, reaproveitada entre sessões.
- **Cartão (Card)**: item de trabalho exibido dentro de uma coluna, com título, tags, badges e indicadores.
- **Navegador Suportado**: navegador declarado como alvo do produto, cuja apresentação do quadro deve ser equivalente às demais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cenários de verificação visual aprovados nos quatro navegadores suportados, com a mesma quantidade, ordem e visibilidade de colunas e diferença de largura e posição de até 1 pixel.
- **SC-002**: Zero defeitos de layout (corte, sobreposição, coluna colapsada ou deslocada) em quadros de 2 a 12 colunas nos quatro navegadores suportados.
- **SC-003**: Paridade de layout confirmada em ampliação de 50%, 100%, 150% e 200% e em densidade de tela de 100%, 150% e 200%, em todos os navegadores suportados.
- **SC-004**: Zero necessidade de ajuste manual de configurações do navegador (ampliação, fonte, tema) para o quadro aparecer corretamente.
- **SC-005**: 100% dos relatos de "colunas erradas no navegador X" encerrados e nenhum relato equivalente reaberto após a correção.
- **SC-006**: Nenhuma regressão nas suítes de verificação automatizadas existentes após a correção.

## Assumptions

- Navegadores suportados: Microsoft Edge, Google Chrome, Mozilla Firefox e Apple Safari em versões modernas — conjunto já registrado nos planos técnicos anteriores do produto, incluindo os dois navegadores citados no relato.
- A apresentação atual no Microsoft Edge é a referência de "layout correto" para os critérios de paridade.
- A paridade exigida é de **layout e renderização do mesmo conteúdo**. Como cada navegador mantém seu próprio armazenamento local, quadros com dados ou preferências diferentes entre navegadores não configuram divergência de layout.
- O sintoma exato observado no Chrome não foi detalhado no relato; a correção é definida pelos critérios mensuráveis acima, tendo o Edge como referência.
- As larguras de coluna continuam persistentes por quadro e continuam limitadas entre a largura mínima e a máxima já vigentes no produto.
- O usuário opera com ampliação e configurações de acessibilidade padrão; o sistema não altera configurações do navegador do usuário.
- A correção é de layout e consistência de renderização: nenhuma métrica de fluxo, regra de negócio ou funcionalidade existente é alterada.
- Navegadores legados, sem suporte a recursos modernos de layout, estão fora do escopo desta correção.

## Fora de Escopo

- Redesenho visual do quadro, das colunas ou dos cartões.
- Novas funcionalidades, novas métricas ou alteração das métricas existentes.
- Alteração do modelo de persistência local, do esquema de dados ou das regras de bloqueio de cartões.
- Suporte a navegadores legados, aplicativos nativos ou versões móveis dedicadas.
- Correções específicas por navegador obtidas por identificação de navegador.

## Dependências

- Feature 016 — layout limpo do quadro (estrutura visual das colunas e dos cartões).
- Feature 022 — configuração de tema (tokens visuais aplicados ao quadro).
- Feature 005 — gestão de colunas (largura, ordem e criação de colunas).
- Feature 008 — dashboard analítico (paridade de renderização das telas analíticas).
