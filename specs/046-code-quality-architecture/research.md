# Research & Technical Decisions: Qualidade de Código & Arquitetura (Ciclo 3)

**Feature**: `046-code-quality-architecture`  
**Date**: 2026-10-15  
**Status**: Completed  

---

## 1. Pesquisa 1: Tipagem Estrita e Erradicação dos 40 Warnings do ESLint

### Contexto
O comando `npm run lint` reporta 40 warnings distribuídos entre:
- `@typescript-eslint/no-explicit-any` (31 ocorrências em componentes de gerenciamento de equipes, modal de quadros e sincronização).
- `react-hooks/exhaustive-deps` (3 ocorrências em `BoardManagementModal.tsx`, `useCfdData.ts` e `useTeamAccess.ts`).
- `@typescript-eslint/no-unused-vars` (6 ocorrências em `syncService.ts`).

### Decisões Técnicas

#### Decisão 1.1: Substituição de `any` por Tipos Semânticos de Domínio
- **Decisão**: Mapear cada instância de `any` para tipos formais:
  - Em `TeamManagementModal.tsx`: utilizar `Team`, `TeamMember`, `User`, `TeamRole`, `Invitation` já definidos em `src/types/teams.ts`.
  - Em `BoardManagementModal.tsx`: tipar callbacks de seleção de times e eventos de formulário (`React.FormEvent`, `React.ChangeEvent<HTMLSelectElement>`).
  - Em `BoardSwitcher.tsx` e `UserProfileMenu.tsx`: tipar referências a times do usuário (`Team[]` e `TeamRole`).
  - Em `syncService.ts`: tipar registros remotos de sincronização como `Record<string, unknown>`, `Workspace`, `Board`, `Task` e estruturas de payload do Supabase.
- **Alternativa Rejeitada**: Usar `unknown` indiscriminadamente com type assertions forçadas (`as unknown as Type`). Rejeitada porque transfere a fragilidade para o runtime ao invés de garantir tipagem estática confiável.

#### Decisão 1.2: Elevação da Regra `@typescript-eslint/no-explicit-any` para `"error"`
- **Decisão**: Alterar em `eslint.config.js` a regra `@typescript-eslint/no-explicit-any` de `'warn'` para `'error'` para arquivos sob `src/**/*.{ts,tsx}` após zerar todos os warnings, mantendo `'off'` em `tests/` para mocks parciais.
- **Rationale**: Impede regressões silenciosas no pipeline de CI/CD e sustenta a governança do Princípio I (Model Integrity) e Princípio III (Automated Quality Gates).

---

## 2. Pesquisa 2: Resiliência de Hooks React (`useMemo` e `useEffect`)

### Contexto
Três hooks/componentes possuem avisos de dependências ausentes:
1. `src/hooks/useCfdData.ts` (linha 207): `customDateRange` não está no array de dependências do `useMemo` que calcula os dados do CFD.
2. `src/hooks/useTeamAccess.ts` (linha 106): `activeUserId`, `invitations`, `teamMembers`, `teams`, `users` ausentes no `useEffect` de sincronização de permissões.
3. `src/components/BoardManagementModal.tsx` (linha 36): `myTeams` é recalculado condicionalmente dentro do corpo do componente, instabilizando a referência para o `useEffect`.

### Decisões Técnicas

#### Decisão 2.1: Inclusão de `customDateRange` em `useCfdData`
- **Decisão**: Adicionar `customDateRange` ao array de dependências de `useMemo` em `useCfdData.ts`.
- **Rationale**: Garante que alterações no seletor de intervalo de datas provoquem a re-computação correta e imediata das curvas acumuladas de fluxo.

#### Decisão 2.2: Estabilização de `useTeamAccess` sem Loops Reativos
- **Decisão**: Envolver funções auxiliares em `useCallback` e memoizar arrays de dependências derivados de IDs, assegurando que o `useEffect` declare todas as variáveis exigidas pelo ESLint sem gerar loops de sincronização entre estado local e chamadas subsequentes.
- **Alternativa Rejeitada**: Desativar o ESLint na linha com `// eslint-disable-next-line react-hooks/exhaustive-deps`. Rejeitada por violar a política de não mascaramento de avisos.

#### Decisão 2.3: Memoização de `myTeams` em `BoardManagementModal.tsx`
- **Decisão**: Envolver a inicialização de `myTeams` em `useMemo(() => ..., [teams, activeUser])`.
- **Rationale**: Cria uma referência de memória estável, evitando re-execuções desnecessárias do efeito de inicialização de quadro.

---

## 3. Pesquisa 3: Otimização do Asset `src/assets/metrik-logo.png`

### Contexto
O arquivo `src/assets/metrik-logo.png` possui 982.63 KB (1024x1024 pixels, RGBA não-comprimido). Ele representa mais de 60% do tamanho total de assets gerados pelo `vite build` (`dist/assets/`).

### Decisões Técnicas

#### Decisão 3.1: Formato e Resolução
- **Decisão**: Redimensionar e comprimir para PNG com resolução de 256x256 pixels com compressão RGBA via Pillow (`Image.Resampling.LANCZOS`, `optimize=True`).
- **Dimensões e Tamanho Alvo**: 256x256 pixels gera um arquivo de ~43 KB (redução de **95.6%** em relação ao original de 982 KB).
- **Compatibilidade**: Preserva o mesmo nome de arquivo e caminho (`src/assets/metrik-logo.png`), assegurando que nenhum import em `App.tsx`, `Board.tsx` ou testes quebre.
- **Fidelidade Visual**: 256x256 é mais que suficiente para renderização ultra-nítida em monitores 4K/Retina com elementos de interface cuja altura máxima é de 32px a 48px.
- **Alternativa Rejeitada**: Conversão para `.webp`. Rejeitada na sessão de clarificação (Q2) para manter compatibilidade imediata e zero atrito de imports.

---

## 4. Pesquisa 4: Limpeza de Variáveis Não Utilizadas em `syncService.ts`

### Contexto
As variáveis `sprints`, `active_sprint_id`, `sprint_id`, `estimation`, `assignee` e `last_moved_at` estão declaradas em desestruturações no serviço de sincronização com o Supabase sem serem lidas no bloco.

### Decisão
Prefixar com `_` (ex: `_sprints`, `_estimation`) ou remover dos parâmetros de desestruturação quando dispensáveis, em total consonância com a convenção do projeto configurada no `eslint.config.js` (`argsIgnorePattern: '^_'`).
