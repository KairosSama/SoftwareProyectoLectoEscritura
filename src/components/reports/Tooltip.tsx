import React from 'react';
import { TooltipState } from './types';

interface Props { tip: TooltipState }

const Tooltip: React.FC<Props> = ({ tip }) => {
  if (!tip.visible) return null;
  return (
    <div
      className="pointer-events-none fixed z-50 bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs text-gray-800"
      style={{ left: tip.x + 12, top: tip.y + 12 }}
    >
      {tip.title && <div className="font-medium mb-1">{tip.title}</div>}
      {tip.lines?.map(l => (
        <div key={l.name} className="flex justify-between gap-4">
          <span className="text-gray-700">
            {l.name}
            <span aria-hidden className="ml-0.5">:</span>
          </span>
          <span className="font-semibold">{l.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default Tooltip;
