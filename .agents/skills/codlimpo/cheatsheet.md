# Cheatsheet de Bolso: Código Limpo (Robert C. Martin - Uncle Bob)

Guia rápido de referência com regras de ouro, checklists e catálogo de odores para revisões de código.

---

## 1. As Três Leis Supremas
- **A Regra do Escoteiro**: *Deixe sempre a área de acampamento mais limpa do que você a encontrou.*
- **A Lei de LeBlanc**: *Mais tarde é igual a nunca (Later equals never).*
- **A Lei de Deméter**: *Converse apenas com seus amigos imediatos; não atravesse estranhos (`a.getB().getC()` é proibido).*

---

## 2. Regras de Nomes
- [ ] O nome revela intenção sem exigir comentários explicativos?
- [ ] Evitou desinformação (ex: chamar de `List` o que é um `Set`)?
- [ ] Fez distinções significativas (sem ruídos como `Data`, `Info`, `The`)?
- [ ] Classes são substantivos (`Customer`, `Account`); métodos são verbos (`postPayment`, `save`)?
- [ ] Escolheu uma única palavra para o mesmo conceito em todo o projeto (ex: apenas `get` ou apenas `fetch`)?

---

## 3. Regras de Funções
- [ ] É pequena? (Idealmente menos de 10 a 20 linhas).
- [ ] Faz apenas uma coisa?
- [ ] Respeita a **Regra Decrescente (Stepdown Rule)**, lida como uma narrativa jornalística de cima para baixo?
- [ ] Quantidade de argumentos: 0 (ideal), 1 (bom), 2 (aceitável), 3 (evite), 4+ (agrupe em objeto)?
- [ ] Não possui argumentos booleanos sinalizadores (`flags`)?
- [ ] Respeita a **Separação Comando-Consulta (CQS)**: faz algo OU responde algo?
- [ ] Não possui efeitos colaterais ocultos?
- [ ] Prefere exceções a códigos de retorno?

---

## 4. Regras de Tratamento de Erro & Nulos
- [ ] **NUNCA RETORNE NULL**: Retorne coleções vazias (`[]`, `set()`) ou use o **Special Case Pattern (Null Object)**.
- [ ] **NUNCA PASSE NULL**: Não passe `null` como argumento sem uma razão crítica inegociável.
- [ ] Blocos `try-catch` isolados em funções próprias.
- [ ] Exceções com mensagens contextuais ricas.

---

## 5. Regras F.I.R.S.T. para Testes Unitários
- **F (Fast)**: Rápido (roda em milissegundos).
- **I (Independent)**: Independente (sem ordem de execução ou estado compartilhado).
- **R (Repeatable)**: Repetível em qualquer máquina ou ambiente sem rede.
- **S (Self-Validating)**: Autovalidável (retorno booleano claro: Passou/Falhou).
- **T (Timely)**: Oportuno (escrito imediatamente antes do código de produção).

---

## 6. As 4 Regras de Design Simples de Kent Beck
1. **Executa todos os testes.**
2. **Não contém duplicação (DRY).**
3. **Expressa a intenção do desenvolvedor.**
4. **Minimiza o número de classes e métodos.**

---

## 7. Tabela Rápida dos Principais Odores de Código (Smells)

| Código | Odor / Heurística | Ação de Refatoração |
|---|---|---|
| **C5** | Código Comentado | Apague imediatamente; o Git guarda o histórico. |
| **F1** | Excesso de Argumentos | Agrupe argumentos em um DTO ou classe de parâmetros. |
| **F3** | Argumento Sinalizador (Flag) | Divida em duas funções explícitas separadas. |
| **G5** | Duplicação (DRY) | Extraia método comum ou use Template Method / Strategy. |
| **G14** | Inveja de Recursos (Feature Envy) | Mova o método para a classe cujos dados ele mais utiliza. |
| **G23** | Switch Statements em Cascata | Substitua por polimorfismo e fábricas (Factories). |
| **G25** | Números Mágicos | Substitua por constantes nomeadas (`MAX_RETRY_ATTEMPTS = 3`). |
| **G28** | Condicional Complexa | Encapsule em um método booleano explicativo (`if (isEligible())`). |
| **G29** | Condicional Negativa | Involva a lógica para condicional afirmativa (`if (buffer.isEmpty())`). |
| **G36** | Acidentes de Trem (Deméter) | Diga ao objeto o que fazer em vez de pedir suas entranhas. |
