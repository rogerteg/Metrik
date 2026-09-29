# Release — Metrik

Versionamento semântico (`MAJOR.MINOR.PATCH`) com CHANGELOG no formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). O histórico técnico
por feature vive em `specs/`; o `CHANGELOG.md` é o resumo voltado ao produto.

## Fluxo

1. **Garanta a árvore limpa e os gates verdes**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

2. **Escolha a versão** e atualize o `package.json`
   ```bash
   npm version patch   # correções
   npm version minor   # novas capacidades compatíveis
   npm version major   # mudanças incompatíveis
   ```
   > `npm version` cria o commit de bump e a tag `vX.Y.Z`.

3. **Atualize o CHANGELOG** (usa `git log` desde a última tag e agrupa por tipo)
   ```bash
   npm run changelog -- vX.Y.Z
   ```
   - Gera a seção `## [vX.Y.Z] - AAAA-MM-DD` com Added/Changed/Fixed/…
   - Sanitiza nomes de marcas de terceiros (Constituição VII).
   - Preserva as seções anteriores.
   - Depois, ajuste manualmente o título para o padrão `## [X.Y.Z]` e adicione
     um bloco `## [Unreleased]` vazio no topo.

4. **Registre no Git**
   ```bash
   git add CHANGELOG.md package.json package-lock.json
   git commit -m "chore(release): vX.Y.Z"
   git tag -a vX.Y.Z -m "Metrik vX.Y.Z"
   ```

5. **(Opcional) Publicar**
   ```bash
   git push --follow-tags
   ```

## Convenção de commits

O gerador depende de [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Seção no CHANGELOG |
|---|---|
| `feat:` | Added |
| `fix:` | Fixed |
| `perf:` | Performance |
| `refactor:` | Changed |
| `docs:` / `test:` | Docs / Tests |
| `chore:` / `build:` / `ci:` / `style:` | Maintenance |

## Observações

- Sem tags, o gerador inclui todo o histórico na seção informada (usado no seed inicial `v0.1.0`).
- Não há publicação automática de pacote (o produto é uma SPA local-first); o "release" é a tag Git + CHANGELOG.
