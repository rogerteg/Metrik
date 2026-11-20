import React from 'react';
import { CfdCoord, CfdInspectionData } from './useCfdPlotCoordinates';

export interface CfdInspectionOverlayProps {
  inspection: CfdInspectionData;
  activeCoord: CfdCoord;
  paddingTop: number;
  paddingLeft: number;
  yBaseline: number;
}

export const CfdInspectionOverlay: React.FC<CfdInspectionOverlayProps> = ({
  inspection,
  activeCoord,
  paddingTop,
  paddingLeft,
  yBaseline,
}) => {
  return (
    <g className="cfd-inspection-group" data-testid="cfd-inspection-overlay">
      {/* Linha vertical de corte */}
      <line
        x1={activeCoord.x}
        y1={paddingTop}
        x2={activeCoord.x}
        y2={yBaseline}
        stroke="rgba(255, 255, 255, 0.4)"
        strokeDasharray="3 3"
        strokeWidth="1.5"
      />

      {/* Medição Vertical de WIP com linha sólida e badge */}
      <line
        x1={activeCoord.x}
        y1={inspection.topY}
        x2={activeCoord.x}
        y2={inspection.bottomY}
        stroke="#38bdf8"
        strokeWidth="2.5"
        data-testid="wip-vertical-line"
      />
      <rect
        x={activeCoord.x + 6}
        y={(inspection.topY + inspection.bottomY) / 2 - 10}
        width={56}
        height={20}
        rx={4}
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth="1"
      />
      <text
        x={activeCoord.x + 10}
        y={(inspection.topY + inspection.bottomY) / 2 + 4}
        fill="#7dd3fc"
        fontSize="10px"
        fontWeight="700"
        fontFamily="monospace"
        data-testid="wip-items-badge"
      >
        {inspection.wipCount} items
      </text>

      {/* Medição Horizontal de Lead Time com seta bidirecional vermelha */}
      {inspection.endX > inspection.startX && (
        <g data-testid="leadtime-horizontal-group">
          <line
            x1={inspection.startX}
            y1={inspection.bottomY}
            x2={inspection.endX}
            y2={inspection.bottomY}
            stroke="#ef4444"
            strokeWidth="2.5"
            markerStart="url(#arrow-left)"
            markerEnd="url(#arrow-right)"
          />
          <rect
            x={(inspection.startX + inspection.endX) / 2 - 28}
            y={inspection.bottomY - 24}
            width={56}
            height={18}
            rx={4}
            fill="#450a0a"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <text
            x={(inspection.startX + inspection.endX) / 2 - 24}
            y={inspection.bottomY - 11}
            fill="#fca5a5"
            fontSize="10px"
            fontWeight="700"
            fontFamily="monospace"
            data-testid="leadtime-days-badge"
          >
            {inspection.leadTimeDays} days
          </text>
        </g>
      )}

      {/* Tag de Alerta de Gargalo em Expansão */}
      {inspection.isExpanding && (
        <g data-testid="bottleneck-expansion-tag">
          <rect
            x={Math.max(paddingLeft + 5, activeCoord.x - 70)}
            y={inspection.topY - 30}
            width={140}
            height={22}
            rx={4}
            fill="#f43f5e"
            filter="drop-shadow(0 2px 6px rgba(244, 63, 94, 0.6))"
          />
          <text
            x={Math.max(paddingLeft + 15, activeCoord.x - 60)}
            y={inspection.topY - 15}
            fill="#ffffff"
            fontSize="10px"
            fontWeight="700"
          >
            ⚠️ A queue column expanding
          </text>
        </g>
      )}
    </g>
  );
};
