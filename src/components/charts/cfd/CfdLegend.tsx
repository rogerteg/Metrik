import React from 'react';
import { ColumnModel } from '../../../types/kanban';
import { getColumnColor } from './useCfdPlotCoordinates';

export interface CfdLegendProps {
  hasDynamicStages: boolean;
  effectiveColumns?: ColumnModel[];
}

export const CfdLegend: React.FC<CfdLegendProps> = ({ hasDynamicStages, effectiveColumns }) => {
  return (
    <div
      className="cfd-legend-bar"
      style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '0.75rem',
        fontSize: '0.75rem',
      }}
    >
      {hasDynamicStages && effectiveColumns ? (
        effectiveColumns.map((col) => {
          const color = getColumnColor(col);
          return (
            <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: color,
                  display: 'inline-block',
                }}
              />
              <span>{col.title}</span>
            </div>
          );
        })
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: '#6366f1',
                display: 'inline-block',
              }}
            />
            <span>A Fazer (Backlog)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: '#f59e0b',
                display: 'inline-block',
              }}
            />
            <span>Em Progresso (WIP)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: '#10b981',
                display: 'inline-block',
              }}
            />
            <span>Concluído</span>
          </div>
        </>
      )}
    </div>
  );
};
