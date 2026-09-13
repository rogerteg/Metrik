# Quickstart & Guia de Validação: Gestão de Usuários, Times e Controle de Acesso a Quadros por Squad

**Feature**: `023-team-access-control` | **Date**: 2026-09-12 | **Branch**: `023-team-access-control`

---

## 1. Visão Geral dos Cenários de Teste

Este guia orienta a validação ponta a ponta dos fluxos de gestão de usuários, criação de squads, envio de convites específicos e isolamento estrito de quadros Kanban no Metrik.

---

## 2. Cenários Manuais Passo a Passo

### Cenário 1: Cadastro de Usuário e Criação de Squad
1. Abra a aplicação em [http://localhost:5173/](http://localhost:5173/).
2. No cabeçalho, localize o novo botão de perfil/usuário (ex: "Entrar / Perfil").
3. Cadastre o usuário:
   - **Nome**: Alice Silva
   - **E-mail**: `alice@metrik.local`
4. Acesse a gestão de times e clique em **"Criar Nova Squad"**:
   - **Nome**: Squad Engenharia
   - **Descrição**: Equipe de desenvolvimento de checkout e pagamentos.
5. **Resultado esperado**: O time é criado com sucesso. Alice é identificada como `admin` da "Squad Engenharia".

### Cenário 2: Criação de Quadro Vinculado à Squad
1. Abra o modal de gerenciamento de quadros (`BoardManagementModal`).
2. Crie um novo quadro:
   - **Nome**: Quadro de Pagamentos
   - **Squad**: Selecione "Squad Engenharia" (já selecionado por padrão).
3. **Resultado esperado**: O "Quadro de Pagamentos" é criado com o vínculo `teamId` da Squad Engenharia e exibido no seletor de quadros.

### Cenário 3: Envio de Convite com Papel de Convidado (`guest`)
1. No menu da Squad Engenharia, clique em **"Convidar Integrante"**:
   - **E-mail do Convidado**: `carlos.convidado@externo.local`
   - **Papel**: Selecione `Convidado (Somente Leitura)`
2. Clique em **"Gerar Convite"**.
3. **Resultado esperado**: O sistema gera um código exclusivo (ex: `METRIK-ENG-7X4K`) e lista o convite com status `pending`.

### Cenário 4: Alternância de Perfil e Aceite de Convite
1. No cabeçalho, alterne o usuário ativo cadastrando ou selecionando:
   - **Nome**: Carlos Convidado
   - **E-mail**: `carlos.convidado@externo.local`
2. Carlos vê o convite pendente da Squad Engenharia ou insere o código `METRIK-ENG-7X4K` em **"Entrar com Código"**.
3. Clique em **"Aceitar Convite"**.
4. **Resultado esperado**: Carlos agora tem acesso ao "Quadro de Pagamentos" da Squad Engenharia, porém com controles de edição desabilitados (modo somente-leitura / visualizador).

### Cenário 5: Verificação de Isolamento Estrito (Acesso Negado)
1. Crie um terceiro usuário:
   - **Nome**: Diana Beta
   - **E-mail**: `diana@outraempresa.local`
2. Crie uma squad separada: "Squad Marketing" com o "Quadro de Campanhas".
3. Enquanto autenticada como Diana, inspecione o seletor de quadros (`BoardSwitcher`):
   - O "Quadro de Pagamentos" da Squad Engenharia **NÃO APARECE** na lista.
4. Tente acessar o ID do "Quadro de Pagamentos" diretamente:
   - **Resultado esperado**: O sistema intercepta o acesso e exibe a tela de aviso: *"Acesso Restrito: Este quadro pertence à Squad Engenharia. Solicite um convite a um administrador para acessar."*

---

## 3. Validação Automatizada

Para validar a integridade funcional, isolamento de boards e regressão zero:

### Testes Unitários de Controle de Acesso e Times
```bash
npx vitest run tests/unit/useTeamAccess.test.ts tests/unit/TeamManagementModal.test.tsx
```

### Suíte Completa de Regressão
```bash
npm test
```
*Critério de Aceite*: 100% de testes verdes (266 legados + novos testes de controle de acesso).

### Verificação de Tipagem Estrita e Build
```bash
npm run build
```
*Critério de Aceite*: `tsc && vite build` compila sem nenhum erro em menos de 2 segundos.
