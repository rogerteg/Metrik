# Quickstart: Validação das Automações de Fluxo & Políticas de Coluna

**Feature**: `053-flow-automation-policies`
**Date**: 2026-11-02

---

## 1. Pré-Requisitos e Inicialização

Certifique-se de que as dependências do projeto estão instaladas e o servidor de desenvolvimento está em execução:

```bash
# Executar a suíte de testes automatizados
npm run test

# Iniciar servidor local
npm run dev
```

Acesse o aplicativo em seu navegador em `http://localhost:5173/`.

---

## 2. Cenários de Validação Prática

### Cenário 1: Criar Regra de Fluxo sem Código (Gatilho -> Ação)
1. No cabeçalho da aplicação (ou barra de ferramentas do quadro), clique no botão **"Regras de Fluxo"** (ícone de raio/engrenagem).
2. O modal de gerenciamento de regras será aberto. Clique em **"Nova Regra"**.
3. Preencha os campos:
   - **Nome**: "Adicionar tag ao mover para Revisão"
   - **Gatilho**: Selecione "Cartão movido para coluna" e escolha a coluna de revisão/QA.
   - **Condição** (opcional): Prioridade igual a "Urgente" ou "Alta".
   - **Ação**: Selecione "Adicionar Tag" e informe o texto `needs-qa`.
4. Clique em **"Salvar Regra"**.
5. Verifique que a regra aparece na lista como **Ativa**.
6. Feche o modal e arraste um cartão elegível para a coluna de revisão.
7. **Resultado Esperado**: O cartão ganha instantaneamente a tag `needs-qa` e uma notificação discreta (toast) confirma a execução da regra.

---

### Cenário 2: Políticas Explícitas de Coluna (Definition of Ready / Done)
1. No quadro Kanban, localize o cabeçalho de uma coluna (ex: "Em Progresso").
2. Clique no ícone de **Políticas da Coluna** (ícone de documento/acordo).
3. No painel/modal aberto, defina:
   - **Critérios de Entrada (DoR)**: "Item deve possuir descrição clara e critérios de aceitação aprovados."
   - **Critérios de Saída (DoD)**: "Testes unitários escritos e cobertura validada."
4. Salve as políticas.
5. Passe o mouse ou clique no indicador de política da coluna.
6. **Resultado Esperado**: Um popover flutuante exibe as diretrizes acordadas de forma legível.

---

### Cenário 3: Modelos Pré-Configurados (Templates Prontos)
1. Abra o modal de **"Regras de Fluxo"**.
2. Clique na aba ou seção **"Modelos Sugeridos"**.
3. Selecione o modelo **"Alerta de WIP Aging em Progresso"** e clique em **"Usar Modelo"**.
4. Ajuste os dias se desejar (padrão: 3 dias) e confirme.
5. **Resultado Esperado**: A regra é adicionada pronta para uso sem necessidade de configuração manual do zero.

---

### Cenário 4: Exportação e Importação de Regras
1. No modal de regras, clique em **"Exportar Regras"**.
2. Verifique o download de um arquivo JSON contendo as regras ativas do quadro.
3. Alterne para outro quadro ou limpe as regras locais.
4. Clique em **"Importar Regras"** e selecione o arquivo JSON exportado.
5. **Resultado Esperado**: As regras são restauradas perfeitamente no novo quadro.

---

## 3. Validação de Testes Automatizados

Para rodar exclusivamente os testes de unidade e integração desta feature:

```bash
# Testes do motor puro de regras
npx vitest run tests/unit/flowRulesEngine.test.ts

# Testes de hooks e componentes
npx vitest run tests/unit/useFlowRules.test.ts
npx vitest run tests/unit/ColumnPolicyPopover.test.ts
```
