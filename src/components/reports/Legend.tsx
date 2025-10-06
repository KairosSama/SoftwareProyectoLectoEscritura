import React from 'react';

const Legend: React.FC = () => (
  <div className="flex items-center gap-4 text-xs md:text-sm">
    <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500" /> SA (Autónomo)</div>
    <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-yellow-400" /> AP (Con Apoyo)</div>
    <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-500" /> NP (No logrado)</div>
  </div>
);

export default Legend;
