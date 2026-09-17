# Domain Review Checklist: Gerenciamento Premium de Quadros (Feature 031)

**Purpose**: Validar a qualidade, clareza, completude e conformidade dos requisitos da nova tela de Gerenciamento de Quadros (Aba Gerenciar) antes do planejamento técnico e implementação.  
**Created**: 2026-09-17  
**Feature**: [spec.md](../spec.md) | [checklists/requirements.md](requirements.md)

**Note**: Este checklist customizado foi gerado pelo comando `/speckit-checklist` com base no contexto da feature e nos requisitos funcionais.  
**Review Ownership**: Este checklist é um artefato de revisão de qualidade de requisitos pertencente ao revisor. Marque um item com `[x]` apenas quando a revisão confirmar que o critério de qualidade de especificação foi satisfeito.  
**Marker Semantics**: `[x]` significa que o critério de especificação foi revisado e aprovado. NÃO significa que a implementação do código está concluída.

---

## 1. Navegação & Ponto de Entrada da Aba Gerenciar

- [ ] CHK001 Está especificada a sincronização bidirecional entre o botão "Gerenciar" do seletor de quadros e a nova aba ativa "Gerenciar" no cabeçalho superior? [Consistência, Spec §FR-002]
- [ ] CHK002 Os estados visuais (ativo, inativo, hover) da nova aba "Gerenciar" no cabeçalho estão alinhados com o padrão de navegação existente das abas Espaços, Quadro e Analytics? [Clareza, Spec §FR-002, §FR-012]
- [ ] CHK003 O comportamento de alternância imediata para a tela de Kanban (`view = 'board'`) ao selecionar qualquer quadro na tela Gerenciar está explicitamente documentado? [Completude, Spec §FR-004]

## 2. Apresentação em Grade e Tabela (Layout & Telemetria)

- [ ] CHK004 Os atributos quantitativos de fluxo exibidos em cada cartão (total de tarefas, contagem de colunas, itens em WIP) estão precisamente definidos sem ambiguidades? [Completude, Spec §FR-003, §Key Entities]
- [ ] CHK005 A diferenciação visual do "Quadro Ativo" (borda acentuada, badge e glow temático) possui critérios objetivos mensuráveis no tema claro e no tema escuro? [Clareza, Spec §US1 Cenário 3, §FR-012]
- [ ] CHK006 As colunas da Tabela Compacta de alta densidade (Nome, Squad, Tarefas, Colunas, Ações) e seu comportamento de ordenação estão completamente especificados? [Completude, Spec §FR-011]
- [ ] CHK007 O comportamento da busca em tempo real e da filtragem por Squad (tempo de resposta < 50ms, contagem de resultados) está delimitado de forma testável? [Mensurabilidade, Spec §FR-009, §FR-010, §SC-001]

## 3. Governança, Ciclo de Vida e Segurança de Exclusão

- [ ] CHK008 O fluxo de edição rápida de nome de quadro inline especifica o comportamento para teclas de atalho (Enter para salvar, Escape para descartar) e perda de foco (`onBlur`)? [Clareza, Spec §FR-006]
- [ ] CHK009 A substituição de caixas de diálogo nativas (`window.confirm`, `window.alert`) por um componente modal integrado do Metrik Design System está estritamente exigida para operações de exclusão? [Consistência, Spec §FR-007, §SC-003]
- [ ] CHK010 O bloqueio e desativação visual da exclusão quando restar apenas um único quadro no sistema estão documentados com mensagem amigável ao usuário? [Casos de Borda, Spec §FR-008, §Edge Cases]
- [ ] CHK011 As restrições de permissão para o perfil Convidado (*Guest Role*) estão formalizadas para ocultar ou desabilitar ações de criação, renomeação e exclusão de acordo com a Constituição VIII? [Segurança/Governança, Spec §Edge Cases]

## 4. Responsividade, Acessibilidade e Brand Independence

- [ ] CHK012 Os pontos de quebra (*breakpoints*) responsivos para a transição de grade multi-colunas para coluna única em telas compactas (< 768px) estão claramente definidos? [Responsividade, Spec §Edge Cases, §SC-002]
- [ ] CHK013 O tratamento para nomes de quadros extensos (reticências suaves no cartão com tooltip nativo completo) está delimitado sem risco de quebra de layout? [Casos de Borda, Spec §Edge Cases]
- [ ] CHK014 Os requisitos de acessibilidade por teclado (ordem de foco Tab, teclas de navegação, atributos ARIA nos seletores e cartões) e contraste WCAG 2.1 AA estão explicitados? [Acessibilidade, Spec §SC-004]
- [ ] CHK015 A conformidade com o Princípio VII da Constituição (Brand Independence) está garantida, proibindo qualquer menção a softwares proprietários ou marcas de terceiros em textos, tooltips e código? [Governança, Spec §FR-013, Constituição VII]

---

## Notes

- Marque os itens com `[x]` apenas após a revisão confirmar que o critério de qualidade de especificação foi satisfeito.
- Mantenha os itens desmarcados (`[ ]`) enquanto ainda demandarem clarificação, correção ou validação do revisor.
- `/speckit-implement` lê o estado deste checklist como um portão de qualidade e não modifica os marcadores.
- Itens numerados sequencialmente (CHK001 a CHK015) para rastreabilidade estrita.
