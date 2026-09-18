# Domain Review Checklist: Salvamento Manual e Automático de Comentários e Campos (Feature 032)

**Purpose**: Validar a qualidade, completude, clareza e conformidade dos requisitos de salvamento de comentários, campos textuais, atalhos e configurações antes do início da implementação.  
**Created**: 2026-09-18  
**Feature**: [spec.md](../spec.md) | [checklists/requirements.md](requirements.md)

**Note**: Este checklist customizado foi gerado pelo comando `/speckit-checklist` com base no contexto da feature e nos requisitos funcionais.  
**Review Ownership**: Este checklist é um artefato de revisão de qualidade de requisitos pertencente ao revisor. Marque um item com `[x]` apenas quando a revisão confirmar que o critério de qualidade de especificação foi satisfeito.  
**Marker Semantics**: `[x]` significa que o critério de especificação foi revisado e aprovado. NÃO significa que a implementação do código está concluída.

---

## 1. Persistência Manual & Ações de Campo (Botões Salvar/Descartar e Feedback)

- [ ] CHK001 Os campos de texto editáveis cobertos no cartão (`Task.tsx`) e no modal (`TaskDetailsModal.tsx`) estão exaustivamente enumerados sem omissões? [Completude, Spec §FR-001]
- [ ] CHK002 A regra de visibilidade contextual dos botões e status no cartão (surgir no foco ou quando `isDirty`, recolhendo após salvar) está especificada de forma inequívoca? [Clareza, Spec §FR-001, §Clarifications]
- [ ] CHK003 Os estados do micro-indicador de persistência ("Alterações não salvas", "Salvando...", "✓ Salvo") e seu tempo de exibição transitória de 2 segundos estão precisamente delimitados? [Clareza, Spec §FR-002, §SC-002]
- [ ] CHK004 O comportamento da ação "Descartar" está formalizado para reverter estritamente ao valor original gravado no início da sessão de edição? [Consistência, Spec §FR-004]

## 2. Atalhos Universais de Teclado (Ctrl+S / Cmd+S e Escape)

- [ ] CHK005 A interceptação obrigatória de `Ctrl+S` / `Cmd+S` com bloqueio explícito (`preventDefault`) do diálogo nativo do navegador está formalizada para todos os sistemas operacionais suportados? [Completude, Spec §FR-005]
- [ ] CHK006 A diferenciação de escopo do atalho `Ctrl+S` (salvar campo focado individualmente vs salvar todas as alterações pendentes no escopo do modal) está claramente detalhada? [Clareza, Spec §FR-005, §Clarifications]
- [ ] CHK007 O comportamento da tecla `Escape` dentro de campos com alterações pendentes está delimitado para descartar a edição sem fechar o modal ou desselecionar o cartão no mesmo evento? [Cobertura, Spec §FR-004, §Edge Cases]

## 3. Configuração Global de Salvamento Automático & Debounce

- [ ] CHK008 A localização, rótulo exato e descrição do interruptor de autosave na tela de Configurações (`SettingsView` -> Geral) estão estritamente definidos? [Clareza, Spec §FR-006]
- [ ] CHK009 A chave do modelo `AppSettings` (`autoSaveComments: boolean`) e seu valor padrão inicial (`true`) estão especificados em conformidade com o padrão Local-First? [Consistência, Spec §FR-007, §Key Entities]
- [ ] CHK010 O comportamento de debounce de 800ms e a gravação forçada na perda de foco (`onBlur`) no modo automático estão especificados com métricas objetivas? [Mensurabilidade, Spec §FR-008, §NFR-001]
- [ ] CHK011 A suspensão total de gravações no timer e no `onBlur` quando o autosave estiver desativado (`autoSaveComments = false`) está garantida na especificação? [Consistência, Spec §FR-009]

## 4. Integridade de Dados, Guarda de Fechamento e Casos de Borda

- [ ] CHK012 O diálogo de confirmação protetor contra perda acidental de rascunhos ao tentar fechar o modal no modo manual está completamente especificado com suas 3 opções de ação? [Cobertura, Spec §FR-009, §Edge Cases]
- [ ] CHK013 Os requisitos especificam que o salvamento de comentários e campos textuais não pode alterar colunas, redefinir bloqueios ou afetar métricas de fluxo (Lead Time, Cycle Time)? [Consistência, Spec §FR-010]
- [ ] CHK014 O comportamento e a desativação estrutural de botões, atalhos e inputs para usuários com perfil Convidado (*Guest Role*) estão formalizados conforme a Constituição VIII? [Segurança/Governança, Spec §FR-011, Constituição VIII]
- [ ] CHK015 O tratamento para textos com caracteres Unicode, quebras de linha múltiplas ou conteúdo limpo para vazio está especificado sem ambiguidades? [Casos de Borda, Spec §Edge Cases]

## 5. Acessibilidade, Ergonomia e Brand Independence

- [ ] CHK016 Os requisitos de acessibilidade para anúncios em leitores de tela (`aria-live="polite"`, rótulos ARIA descritivos e foco visível) atendem às diretrizes WCAG 2.1 AA? [Acessibilidade, Spec §FR-012]
- [ ] CHK017 A responsividade e o isolamento contra quebras de layout na grade Kanban e no modal estão delimitados com critérios mensuráveis? [Mensurabilidade, Spec §FR-013, §NFR-004]
- [ ] CHK018 A exigência de Brand Independence (Constituição VII) está explicitada, proibindo menção a marcas proprietárias externas em código, tooltips, documentação e UI? [Governança, Spec §NFR-003, Constituição VII]

---

## Notes

- Mark items `[x]` only after review confirms the requirement-quality criterion is satisfied
- Leave items unchecked when they still require clarification, correction, or reviewer evaluation
- `/speckit-implement` reads checklist checkbox state as a gate and must not modify markers
- `checklists/requirements.md` has a separate built-in lifecycle maintained by `/speckit-specify` and `/speckit-clarify`
- Items are numbered sequentially (CHK001 to CHK018) for strict traceability
