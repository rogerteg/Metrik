# Implementation Plan: Qualidade de Código & Arquitetura (Ciclo 3)

**Branch**: `046-code-quality-architecture` | **Date**: 2026-10-15 | **Spec**: [specs/046-code-quality-architecture/spec.md](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/specs/046-code-quality-architecture/spec.md)

**Input**: Feature specification e clarificações aprovadas de `specs/046-code-quality-architecture/spec.md`.

---

## 1. Summary

O objetivo deste plano é erradicar a dívida técnica acumulada do Metrik, zerando os **40 warnings do ESLint**, promovendo a tipagem estrita de dados através da substituição de tipos `any` por tipos seguros de domínio, blindando a configuração com `@typescript-eslint/no-explicit-any: "error"`, estabilizando dependências de hooks reativos (`useCfdData.ts`, `useTeamAccess.ts`, `BoardManagementModal.tsx`), e otimizando o asset de imagem principal (`src/assets/metrik-logo.png`) de 982 KB para menos de 120 KB, garantindo 100% de conformidade com a Constituição do Metrik.

---

## 2. Technical Context

- **Language/Version**: TypeScript 5.7.2 / React 19.0.0
- **Build & Bundler**: Vite 6.1.0
- **Linter & Code Standards**: ESLint 9.39.5, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, Prettier 3.9.9
- **Testing**: Vitest 3.0.5, `@testing-library/react`, JSDOM, `jest-axe`
- **Asset Optimization**: Pillow (Python) para compressão PNG com filtro Lanczos e alpha preservado
- **Performance Goals**: 
  - `npm run lint`: 0 problems (0 errors, 0 warnings)
  - `dist/assets/metrik-logo-*.png`: < 120 KB (redução > 80%)
  - `npm run build`: < 5 segundos
  - 100% dos 701 testes unitários passando (`npm test`)

---

## 3. Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Princípio I (Model Integrity & Parity)**: **PASS** — Fortalece a integridade eliminando 31 ocorrências de `any` solto e substituindo por tipos declarativos alinhados a `src/types/`.
- **Princípio II (Clean Architecture & Living Documentation)**: **PASS** — Respeita o isolamento de camadas e estabiliza hooks de ciclo de vida.
- **Princípio III (Automated Quality Gates & Physical Evidence)**: **PASS** — Zero enfraquecimento de asserções; todos os 701 testes existentes devem continuar verdes; eleva regra de linter para `"error"`.
- **Princípio IV (Explicit Failure & No Silent Swallowing)**: **PASS** — Nenhuma exceção mascarada; tipos seguros evitam falhas silenciosas de runtime.
- **Princípio V (Simplicity & YAGNI)**: **PASS** — Utiliza tipos diretos sem introdução de frameworks pesados de validação desnecessários.
- **Princípio VI (Analytical Reasoning Models)**: **PASS** — Será exigido e documentado antes da decomposição de tarefas em `tasks.md`.
- **Princípio VII (Brand Independence)**: **PASS** — Zero menções a marcas proprietárias de terceiros.

---

## 4. Proposed File Changes

### Linter Configuration Layer
#### [MODIFY] [eslint.config.js](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/eslint.config.js)
- Alterar `@typescript-eslint/no-explicit-any` de `'warn'` para `'error'` no bloco principal de código de produção (`**/*.{ts,tsx}`).

### Components Layer (Strict Typing & Hooks Stabilization)
#### [MODIFY] [src/components/BoardManagementModal.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/BoardManagementModal.tsx)
- Envolver `myTeams` em `useMemo` para estabilizar referência de dependência do `useEffect` (linha 36).
- Substituir `any` por tipos semânticos de formulário/times (linha 39).

#### [MODIFY] [src/components/BoardSwitcher.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/BoardSwitcher.tsx)
- Tipar parâmetro/estado de time (linha 32).

#### [MODIFY] [src/components/TaskMetadataSidebar.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TaskMetadataSidebar.tsx)
- Tipar callback/propriedade de metadados (linha 89).

#### [MODIFY] [src/components/TeamManagementModal.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/TeamManagementModal.tsx)
- Substituir 13 ocorrências de `any` por `Team`, `TeamMember`, `User`, `Invitation` e eventos React de formulário.

#### [MODIFY] [src/components/UserProfileMenu.tsx](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/components/UserProfileMenu.tsx)
- Tipar propriedade de papel/time do usuário (linha 81).

### Hooks Layer (Dependency Exhaustiveness)
#### [MODIFY] [src/hooks/useCfdData.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useCfdData.ts)
- Incluir `customDateRange` no array de dependências do `useMemo` (linha 207).

#### [MODIFY] [src/hooks/useTeamAccess.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useTeamAccess.ts)
- Estabilizar dependências de `useEffect` com `useCallback` e memoização de listas de membros/convites para evitar loops reativos (linha 106).

#### [MODIFY] [src/hooks/useWorkspaces.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/hooks/useWorkspaces.ts)
- Tipar `any` de resposta de workspace (linha 63).

### Services Layer (Sync & Types Hygiene)
#### [MODIFY] [src/services/supabase/syncService.ts](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/services/supabase/syncService.ts)
- Substituir 9 ocorrências de `any` por tipos seguros de payload (`RemoteWorkspaceRow`, `RemoteBoardRow`, `RemoteTaskRow`).
- Remover ou prefixar com `_` as variáveis não utilizadas: `_sprints`, `_active_sprint_id`, `_sprint_id`, `_estimation`, `_assignee`, `_last_moved_at`.

### Assets Layer (Image Optimization)
#### [MODIFY] [src/assets/metrik-logo.png](file:///c:/Users/Rogerio%20Teixeira/OneDrive/Documentos/Antigravity/Metrik/src/assets/metrik-logo.png)
- Substituir pelo arquivo otimizado de 256x256 pixels com canal alpha preservado e compressão PNG, reduzindo o tamanho de 982 KB para ~43 KB.

---

## 5. Verification Plan

1. **Linter Estrito**: Executar `npm run lint` e atestar 0 errors e 0 warnings.
2. **Asset Payload**: Medir o tamanho do arquivo `src/assets/metrik-logo.png` (< 120 KB).
3. **Não-Regressão de Testes**: Executar `npm test` e atestar 701/701 testes passando (100% verde).
4. **Build de Produção**: Executar `npm run build` e atestar compilação limpa em < 5 segundos com asset reduzido em `dist/assets/`.
