# Plano de Implementação — Feature 060: Otimização de Peso de Entrada e Particionamento de Bundle

## 1. Visão Arquitetural

A otimização de entrada atua em duas frentes independentes: camada de ativos estáticos (*assets*) e camada de empacotamento Rollup/Vite (*bundling*).

```mermaid
flowchart TD
    subgraph Assets["Camada de Ativos Estáticos"]
        SVG["public/favicon.svg (< 2 kB)"] --> HTML["index.html"]
        PNG["public/metrik-logo.png (20.9 kB)"] --> HTML
        SRC_PNG["src/assets/metrik-logo.png (20.9 kB)"] --> BUNDLE["dist/assets/metrik-logo-*.png (< 30 kB)"]
    end

    subgraph Rollup["Particionamento Rollup (vite.config.ts)"]
        MC["manualChunks(id)"] --> C1["vendor-react (~194 kB)"]
        MC --> C2["vendor-supabase (~227 kB)"]
        MC --> C3["feature-mika (~75 kB)"]
        MC --> C4["feature-workspace-management (~80 kB)"]
        MC --> C5["feature-flow-rules (~28 kB)"]
        MC --> C6["feature-reports (~20 kB)"]
        MC --> C7["feature-sprints (~11 kB)"]
        MC --> MAIN["dist/assets/index-*.js (237.9 kB < 500 kB)"]
    end
```

## 2. Decisões Técnicas

1. **Favicon SVG**: Criado arquivo vetorial `public/favicon.svg` contendo o símbolo semântico das três colunas do Kanban com curva ascendente de métricas de fluxo sobre gradiente noturno.
2. **Compressão PNG**: Reamostragem via Lanczos para 160x160 pixels com canal alfa preservado e nível de compressão máximo (compress_level=9) via Pillow.
3. **Rollup manualChunks**: Estruturação de limites modulares por subsistema no `vite.config.ts`, permitindo que os modais e painéis pesados sejam carregados sob demanda ou em paralelo, reduzindo o chunk principal `index-*.js` de 634,7 kB para 237,9 kB.
