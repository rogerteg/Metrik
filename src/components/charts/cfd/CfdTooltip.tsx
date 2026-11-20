import React from 'react';
import { ColumnModel } from '../../../types/kanban';
import { CfdCoord, getColumnColor } from './useCfdPlotCoordinates';

export interface CfdTooltipProps {
  activeCoord: CfdCoord;
  viewBoxWidth: number;
  hasDynamicStages: boolean;
  effectiveColumns?: ColumnModel[];
}

export const CfdTooltip: React.FC<CfdTooltipProps> = ({
  activeCoord,
  viewBoxWidth,
  hasDynamicStages,
  effectiveColumns,
}) => {
  return (
    <div
      className="cfd-tooltip"
      style={{
        position: 'absolute',
        top: '12px',
        left:
          activeCoord.x > viewBoxWidth / 2
            ? 'auto'
            : `${(activeCoord.x / viewBoxWidth) * 100 + 3}%`,
        right:
          activeCoord.x > viewBoxWidth / 2
            ? `${100 - (activeCoord.x / viewBoxWidth) * 100 + 3}%`
            : 'auto',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.8rem',
        pointerEvents: 'none',
        zIndex: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        minWidth: '170px',
      }}
    >
      <div
        style={{
          fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '4px',
          marginBottom: '6px',
        }}
      >
        📅 {activeCoord.data.date}
      </div>

      {hasDynamicStages && effectiveColumns ? (
        effectiveColumns.map((col) => {
          const color = getColumnColor(col);
          const count = activeCoord.data.stageCounts?.[col.id] || 0;
          return (
            <div
              key={col.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color,
                marginBottom: '2px',
              }}
            >
              <span>{col.title}:</span>
              <strong>{count}</strong>
            </div>
          );
        })
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#818cf8',
              marginBottom: '2px',
            }}
          >
            <span>A Fazer:</span>
            <strong>{activeCoord.data.todo}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#fbbf24',
              marginBottom: '2px',
            }}
          >
            <span>Em Progresso:</span>
            <strong>{activeCoord.data.inProgress}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: '#34d399',
              marginBottom: '4px',
            }}
          >
            <span>Concluído:</span>
            <strong>{activeCoord.data.done}</strong>
          </div>
        </>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px dashed rgba(255,255,255,0.2)',
          paddingTop: '4px',
          fontWeight: 600,
        }}
      >
        <span>Total no Sistema:</span>
        <span>{activeCoord.data.total}</span>
      </div>
    </div>
  );
};
