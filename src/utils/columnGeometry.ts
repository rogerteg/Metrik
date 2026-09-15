/**
 * Metrik Column Geometry — fonte única de verdade da geometria de coluna (Feature 026).
 *
 * Nenhum outro módulo, componente ou folha de estilo pode declarar estes valores.
 * Os mesmos números são expostos em `src/App.css` como custom properties
 * (`--metrik-column-width-default|min|max`) e comparados automaticamente por
 * `tests/unit/columnGeometryContract.test.ts` — alterar um lado sem o outro quebra a suíte.
 *
 * Todas as funções aqui são puras: sem React, sem DOM, sem armazenamento, sem efeitos colaterais.
 */

/** Largura padrão de uma coluna sem preferência salva, em pixels CSS. */
export const DEFAULT_COLUMN_WIDTH = 290;

/** Menor largura permitida para uma coluna, em pixels CSS. */
export const MIN_COLUMN_WIDTH = 220;

/** Maior largura permitida para uma coluna, em pixels CSS. */
export const MAX_COLUMN_WIDTH = 650;

/** Prefixo estável de diagnóstico (Constitution IV). */
export const GEOMETRY_DIAGNOSTIC_PREFIX = '[Metrik Guard]';

/** Motivo pelo qual uma preferência persistida foi descartada. */
export type ColumnWidthDiscardReason = 'invalid' | 'out-of-range';

/** Resultado detalhado da resolução de uma largura. */
export interface ColumnWidthResolution {
  /** Largura efetiva a renderizar: sempre finita, inteira e dentro da faixa permitida. */
  width: number;
  /** Preferência aceita, quando houver. */
  preference: number | null;
  /** Indica que a entrada foi descartada em favor do layout íntegro. */
  discarded: boolean;
  /** Motivo do descarte, quando aplicável. */
  reason: ColumnWidthDiscardReason | null;
}

/** Relato de divergência de geometria, emitido para diagnóstico. */
export interface GeometryDivergenceReport {
  columnId: string;
  expected: number;
  resolved: number;
  preference: number | null;
  reason: ColumnWidthDiscardReason | null;
}

/**
 * Aplica a faixa permitida e garante valor inteiro.
 * Entrada não finita resolve para o padrão — nunca produz `NaN` no estilo.
 */
export function clampColumnWidth(value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_COLUMN_WIDTH;
  }
  return Math.round(Math.min(MAX_COLUMN_WIDTH, Math.max(MIN_COLUMN_WIDTH, value)));
}

/**
 * Resolve uma preferência de largura para o valor efetivamente renderizável.
 * Preferência ausente, não numérica ou não finita → padrão.
 * Preferência fora da faixa → descartada → padrão (FR-009).
 */
export function resolveColumnWidthWithDetail(preference?: unknown): ColumnWidthResolution {
  if (preference === undefined || preference === null) {
    return { width: DEFAULT_COLUMN_WIDTH, preference: null, discarded: false, reason: null };
  }

  if (typeof preference !== 'number' || !Number.isFinite(preference)) {
    return { width: DEFAULT_COLUMN_WIDTH, preference: null, discarded: true, reason: 'invalid' };
  }

  if (preference < MIN_COLUMN_WIDTH || preference > MAX_COLUMN_WIDTH) {
    return { width: DEFAULT_COLUMN_WIDTH, preference, discarded: true, reason: 'out-of-range' };
  }

  return { width: Math.round(preference), preference, discarded: false, reason: null };
}

/**
 * Resolve a largura efetiva de uma coluna.
 * Nunca retorna `undefined`: elimina o estado oculto que produzia dois caminhos de renderização.
 */
export function resolveColumnWidth(preference?: unknown): number {
  return resolveColumnWidthWithDetail(preference).width;
}

/**
 * Emite diagnóstico quando a largura resolvida divergir do esperado.
 * No-op quando não há divergência — evita ruído no console (Constitution IV).
 */
export function reportGeometryDivergence(report: GeometryDivergenceReport): void {
  if (report.expected === report.resolved) {
    return;
  }
  if (typeof console === 'undefined' || typeof console.warn !== 'function') {
    return;
  }
  const preference = report.preference === null ? 'none' : String(report.preference);
  const reason = report.reason === null ? 'none' : report.reason;
  console.warn(
    `${GEOMETRY_DIAGNOSTIC_PREFIX} Column geometry divergence — columnId=${report.columnId} ` +
      `expected=${report.expected} resolved=${report.resolved} preference=${preference} reason=${reason}`
  );
}

/**
 * Resolve o mapa persistido (coluna → largura) descartando entradas inválidas ou fora da faixa
 * e reportando cada descarte. Nunca lança.
 */
export function resolvePersistedWidthMap(
  persisted: unknown,
  report: (report: GeometryDivergenceReport) => void = reportGeometryDivergence
): Record<string, number> {
  if (persisted === null || typeof persisted !== 'object' || Array.isArray(persisted)) {
    return {};
  }

  const resolved: Record<string, number> = {};

  for (const [columnId, raw] of Object.entries(persisted as Record<string, unknown>)) {
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      report({
        columnId,
        expected: DEFAULT_COLUMN_WIDTH,
        resolved: DEFAULT_COLUMN_WIDTH,
        preference: null,
        reason: 'invalid',
      });
      continue;
    }

    if (raw < MIN_COLUMN_WIDTH || raw > MAX_COLUMN_WIDTH) {
      report({
        columnId,
        expected: raw,
        resolved: DEFAULT_COLUMN_WIDTH,
        preference: raw,
        reason: 'out-of-range',
      });
      continue;
    }

    resolved[columnId] = Math.round(raw);
  }

  return resolved;
}
