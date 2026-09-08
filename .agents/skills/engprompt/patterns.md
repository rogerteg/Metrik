# Catálogo de Templates de Prompts para Desenvolvedores (Patterns)

Templates homologados prontos para uso em cada fase do desenvolvimento de software.

---

## 1. Padrão de Modelagem e Requisitos (BDD + Mermaid)

```text
Atue como Arquiteto de Software e Engenheiro de Requisitos Sênior.
Com base no texto da regra de negócio abaixo:
1. Extraia os Atores e Casos de Uso.
2. Elabore 3 cenários de teste em formato BDD (Dado / Quando / Então).
3. Gere o diagrama de classes em sintaxe Mermaid (classDiagram).

<regra_de_negocio>
[INSIRA A DESCRIÇÃO DO MÓDULO AQUI]
</regra_de_negocio>
```

---

## 2. Padrão de Codificação com SOLID e Clean Code

```text
Atue como Desenvolvedor Backend Sênior especialista em [LINGUAGEM/FRAMEWORK].
Tarefa: Implementar [NOME_DA_FUNCIONALIDADE].
Contexto: Estamos em uma arquitetura [CAMADAS/HEXAGONAL/CLEAN].

Restrições Técnicas:
- Aplicar Single Responsibility Principle (SRP): separe regras de negócio de chamadas de infraestrutura.
- Não utilize bibliotecas externas não homologadas além de [LISTA_DE_LIBS].
- Trate todas as exceções de borda de forma explícita com tipos customizados de erro.
- Retorne apenas o código com docstrings concisas, sem texto conversacional.
```

---

## 3. Padrão de Geração de Testes Unitários de Borda

```text
Atue como Especialista em QA e Testes Automatizados.
Com base no código da função abaixo, gere uma suíte de testes unitários usando [FRAMEWORK_TESTE: Jest, PyTest, JUnit]:

<codigo_fonte>
[COLE A FUNÇÃO OU CLASSE AQUI]
</codigo_fonte>

Cobertura obrigatória:
1. Cenário Feliz (Happy Path) com validação de retorno.
2. Casos de Borda: valores nulos, vazios, negativos e extremos.
3. Teste de lançamento de exceções esperadas.
4. Mocks estritos de todas as dependências externas de banco ou rede.
```

---

## 4. Padrão de Code Review Automatizado (Segurança & Performance)

```text
Atue como Revisor de Código Sênior focado em Segurança e Otimização.
Audite o código abaixo sob os seguintes critérios:
1. Vulnerabilidades OWASP (SQL Injection, XSS, exposição de dados).
2. Complexidade temporal e espacial (identifique loops aninhados desnecessários).
3. Nomenclatura e legibilidade (princípios Clean Code).
4. Forneça uma versão corrigida para cada problema crítico identificado.

<codigo_para_revisao>
[COLE O CÓDIGO AQUI]
</codigo_para_revisao>
```

---

## 5. Padrão de Documentação Técnica de API (OpenAPI 3.0)

```text
Gere a especificação OpenAPI 3.0 em formato YAML para o seguinte endpoint de backend:
Linguagem/Framework: [TECNOLOGIA]

<codigo_endpoint>
[COLE A ROTA / CONTROLLER AQUI]
</codigo_endpoint>

Exigências:
- Sumário e descrição detalhada da operação.
- Schema completo do Request Body com exemplos válidos.
- Respostas para códigos 200/201, 400, 401/403 e 500.
```
