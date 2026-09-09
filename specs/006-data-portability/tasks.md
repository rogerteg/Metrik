# Implementation Tasks: Feature 006 (Data Portability)

## Phase 1: Core Hook Implementation
- [ ] T001 Adicionar função `overwriteBoard(newState: BoardState)` em `src/hooks/useTaskCollection.ts` que substitui o estado completo e salva no localStorage.
- [ ] T002 Criar o hook `src/hooks/useDataPortability.ts` com a função `exportData(board: BoardState)` usando `Blob` e `URL.createObjectURL`.
- [ ] T003 Adicionar a função `importData(file: File, onSuccess: (board: BoardState) => void, onError: (err: string) => void)` em `useDataPortability.ts` usando `FileReader` e `isValidBoardState`.

## Phase 2: Unit Testing
- [ ] T004 Criar testes para `overwriteBoard` garantindo que o localStorage é atualizado.
- [ ] T005 Criar suite de testes `tests/unit/useDataPortability.test.ts` para testar os casos de erro e sucesso da importação/exportação.

## Phase 3: UI Integration
- [ ] T006 Atualizar `src/App.tsx` para incluir um `<input type="file" />` oculto.
- [ ] T007 Adicionar botões "Exportar" e "Importar" no cabeçalho de `App.tsx` ao lado dos controles existentes.
- [ ] T008 Integrar o hook `useDataPortability` ao `App.tsx` e acoplar a função `importData` ao evento `onChange` do input file.

## Phase 4: Validation
- [ ] T009 Rodar build e validação de testes (`npm run build` e `npm test`).
- [ ] T010 Teste manual na interface garantindo que o arquivo exportado tem o formato JSON correto e pode ser importado sem falhas.
