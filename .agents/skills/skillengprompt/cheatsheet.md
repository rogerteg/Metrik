# Cheatsheet: Engenharia de Prompt para Devs

Guia rápido de consulta e regras de decisão para o dia a dia da programação assistida por IA.

---

## 1. Matriz de Temperatura para Tarefas de Dev

| Tarefa de Engenharia | Temperatura Recomendada | Motivo Técnico |
|---|---|---|
| **Geração de Código Estrito** | `0.0` a `0.2` | Máxima reprodutibilidade, minimiza erros de sintaxe |
| **Geração de Testes Unitários** | `0.1` a `0.2` | Foco em assertividade e casos limites determinísticos |
| **Refatoração / Code Review** | `0.2` | Análise crítica e precisão estrita às regras |
| **Criação de Documentação / Docs**| `0.3` a `0.5` | Equilíbrio entre precisão técnica e fluidez textual |
| **Ideação e Design Arquitetural** | `0.6` a `0.7` | Estímulo a abordagens alternativas e trade-offs |

---

## 2. Checklist Rápido de Construção de Prompts (Os 4 Pilares)

- [ ] **1. Persona Declarada?** ("Atue como engenheiro de software sênior em...")
- [ ] **2. Contexto Fornecido e Delimitado?** (Versões de frameworks, banco, tags XML ou markdown)
- [ ] **3. Ação Clara e Granular?** (Verbo no imperativo, uma camada arquitetural por prompt)
- [ ] **4. Restrições Negativas Definidas?** ("Não use lib X, não omita código, sem texto extra")
- [ ] **5. Formato de Saída Especificado?** (Apenas código TypeScript, apenas JSON schema válido, etc.)

---

## 3. Regras de Ouro de Segurança para Desenvolvedores

1. **Jamais Envie Segredos**: Nunca cole arquivos `.env`, chaves de API, senhas ou dados pessoais de clientes em chats de IA.
2. **Desconfie de Pacotes Novos**: Se a IA sugerir uma dependência NPM/Pip que você não conhece, verifique no repositório oficial se o pacote realmente existe e tem manutenção ativa (evite alucinações de supply chain).
3. **Você é o Autor do Commit**: O código gerado pela IA é de sua inteira responsabilidade técnica e legal. Revise linha por linha e execute testes automatizados antes do merge.
