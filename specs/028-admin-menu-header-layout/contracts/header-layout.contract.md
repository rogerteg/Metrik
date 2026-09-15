# Contract: Header & Admin Menu Layout (028)

**Feature**: `028-admin-menu-header-layout`
**Type**: UI Contract (Comportamento observável de empilhamento e hierarquia)
**Spec**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md)

---

## 1. Obrigações Observáveis

| ID | Obrigação | Verificação |
|---|---|---|
| HL-01 | O menu `.user-profile-dropdown` abre visualmente à frente da barra `.metrics-bar` sem nenhum corte ou oclusão. | Inspeção visual no browser e teste automatizado de classes de empilhamento. |
| HL-02 | O cabeçalho `.app-header` possui contexto de empilhamento explícito com `z-index` superior a `.metrics-bar`. | Asserção de estilo computado em teste unitário. |
| HL-03 | Pressionar a tecla `Escape` com o menu `.user-profile-dropdown` aberto fecha o menu imediatamente. | Teste de evento de teclado em `UserProfileMenu.test.tsx`. |
| HL-04 | Clicar em qualquer lugar fora do menu fecha o dropdown. | Teste de clique fora existente e validado. |
| HL-05 | Ações do quadro (Importar, Exportar, Demo, Limpar) estão visualmente agrupadas e separadas da identidade do usuário por divisória. | Verificação de estrutura DOM e classes CSS. |
| HL-06 | O mini-formulário de criação de usuário abre sem ser encoberto pela barra de métricas. | Teste de interação de abertura do form. |
| HL-07 | A paridade de layout entre navegadores é preservada (Edge, Chrome, Firefox, Safari). | CSS padrão sem propriedades proprietárias. |
