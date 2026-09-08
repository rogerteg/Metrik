---
name: engprompt
description: Engenharia de Prompt para Desenvolvedores de Software — técnicas práticas de prompt engineering aplicadas a todo o ciclo de vida do software (modelagem de requisitos, arquitetura, codificação limpa, refatoração, testes unitários, code review e documentação técnica) com base no livro de Ricardo Pupo Larguesa (Casa do Código). Use ao criar ou otimizar prompts para codificar, debugar, testar, documentar ou modelar sistemas com IA.
compatibility: Works across all IDEs and AI agents supporting Agent Skills
metadata:
  author: Ricardo Pupo Larguesa (Casa do Código)
  version: '1.0'
---

# Engenharia de Prompt para Devs (skillengprompt)

Guia e base de conhecimento estruturada a partir do livro de **Ricardo Pupo Larguesa** (*Engenharia de Prompt para Devs: Um guia para aprender a usar IA no desenvolvimento de software*, Casa do Código). Foco: transformar LLMs em parceiros de desenvolvimento eficientes através de instruções rigorosas, técnicas comprovadas e templates aplicáveis a cada fase do ciclo de software.

## How to Use This Skill

1. **Fundamentos e Teoria**: Consulte `chapters/ch01-modelos-de-linguagem.md` e `chapters/ch02-engenharia-de-prompt.md` para entender tokens, contexto e os 4 pilares da instrução eficaz.
2. **Técnicas de Elaboração e Teste**: `chapters/ch03-elaboracao-de-prompts.md` (Zero-shot, Few-shot, CoT, delimitação) e `chapters/ch04-testes-de-prompts.md` (validação e regressão de prompts).
3. **Gestão de Prompts**: `chapters/ch05-organizacao-de-prompts.md` (repositórios, templates modulares e versionamento).
4. **O Papel do Desenvolvedor**: `chapters/ch06-ia-e-o-programador-moderno.md` (postura crítica, validação e governança).
5. **Aplicações no Ciclo de Vida**:
   - **Modelagem e Requisitos**: `chapters/ch07-prompts-de-apoio-a-modelagem.md` (UML, banco de dados, user stories).
   - **Codificação e Refatoração**: `chapters/ch08-prompts-de-apoio-a-codificacao.md` (SOLID, Clean Code, migrações).
   - **Testes e Code Review**: `chapters/ch09-prompts-de-apoio-a-testes-e-code-review.md` (testes unitários, edge cases, análise estática).
   - **Documentação Técnica**: `chapters/ch10-prompts-de-apoio-a-documentacao.md` (docstrings, OpenAPI, READMEs, diagramas).
6. **Modelos de Código e Segurança**: `chapters/ch11-modelos-de-linguagem-de-codigo.md` e `chapters/ch12-desafios-e-tendencias-futuras.md`.
7. **Consultas Rápidas**: `cheatsheet.md` para checklist de construção de prompts para devs; `patterns.md` para templates prontos de copiar e colar; `glossary.md` para termos técnicos.

---

## Core Frameworks & Mental Models

- **Os 4 Pilares do Prompt Técnico**:
  1. **Papel/Persona**: Especialidade do modelo (ex: 'Arquiteto de Soluções Python sênior').
  2. **Contexto & Entrada**: Código existente, bibliotecas, versões e dependências delimitadas por tags.
  3. **Instrução Precisa**: Ação direta em verbos no imperativo com critérios de aceite explícitos.
  4. **Restrições & Formato de Saída**: O que NÃO fazer e o formato estrito da resposta (código puro, markdown, sem explicações prolixas).
- **O Dev como Piloto e Revisor Crítico**: A IA é um copiloto acelerador, mas a responsabilidade do design, da segurança e da correção lógica permanece 100% no desenvolvedor humano. Nunca comite código não revisado.
- **Técnica do Espaço Delimitado**: Usar markdown, triplas aspas ou tags XML (`<codigo>`, `<requisitos>`) para separar instruções das massas de dados, prevenindo confusão semântica e injeções acidentais.
- **Engenharia Reversa de Requisitos**: Usar a IA para gerar cenários de teste e diagramas conceituais *antes* de escrever a primeira linha de código, revelando lacunas nos requisitos de negócio.

---

## Chapter Index

| # | Capítulo | Arquivo |
|---|----------|---------|
| 1 | Modelos de linguagem | `chapters/ch01-modelos-de-linguagem.md` |
| 2 | Engenharia de prompt | `chapters/ch02-engenharia-de-prompt.md` |
| 3 | Elaboração de prompts | `chapters/ch03-elaboracao-de-prompts.md` |
| 4 | Testes de prompts | `chapters/ch04-testes-de-prompts.md` |
| 5 | Organização de prompts | `chapters/ch05-organizacao-de-prompts.md` |
| 6 | IA e o programador moderno | `chapters/ch06-ia-e-o-programador-moderno.md` |
| 7 | Prompts de apoio à modelagem | `chapters/ch07-prompts-de-apoio-a-modelagem.md` |
| 8 | Prompts de apoio à codificação | `chapters/ch08-prompts-de-apoio-a-codificacao.md` |
| 9 | Prompts de apoio a testes e revisão de código | `chapters/ch09-prompts-de-apoio-a-testes-e-code-review.md` |
| 10 | Prompts de apoio à documentação | `chapters/ch10-prompts-de-apoio-a-documentacao.md` |
| 11 | Modelos de Linguagem de Código (Code LLMs) | `chapters/ch11-modelos-de-linguagem-de-codigo.md` |
| 12 | Desafios e tendências futuras | `chapters/ch12-desafios-e-tendencias-futuras.md` |
