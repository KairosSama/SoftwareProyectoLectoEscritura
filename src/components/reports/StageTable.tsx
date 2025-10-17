import React, { useMemo, useState } from 'react';
import { Assessment } from '../../lib/mockData';
import { groupIndicatorsByBlock, prettyBlock, getQuestionLabel, INDICATOR_COLORS, QUESTIONS } from './constants';
import Legend from './Legend';

interface Props { assessment?: Assessment | null }

const StageTable: React.FC<Props> = ({ assessment }) => {
  if (!assessment) return <div className="text-sm text-gray-600">No hay evaluación para mostrar.</div>;
  const grouped = groupIndicatorsByBlock(assessment.indicators);
  // Numeración continua P1..Pn por orden de bloques y luego índice
  const pnMap: Record<string, string> = {};
  let running = 1;
  for (const blockId of Object.keys(grouped)) {
    for (const { key } of grouped[blockId]) {
      pnMap[key] = `P${running++}`;
    }
  }
  // Estado de bloques expandidos para ver preguntas extendidas
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggleBlock = (blockId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(blockId) ? next.delete(blockId) : next.add(blockId);
      return next;
    });
  };
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tarea</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Preguntas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.entries(grouped).map(([blockId, items]) => {
            const saCount = items.filter(i=>i.val==='SA').length;
            const apCount = items.filter(i=>i.val==='AP').length;
            const npCount = items.filter(i=>i.val==='NP').length;
            const totalCatalog = (QUESTIONS[blockId]?.length ?? 0);
            const presentIdx = new Set(items.map(i=>i.idx));
            const missingIdxs = useMemo(() => Array.from({ length: totalCatalog }).map((_,i)=>i).filter(i=>!presentIdx.has(i)), [totalCatalog, blockId, items.length]);
            return (
            <tr key={blockId}>
              <td className="px-4 py-3 align-top w-72">
                <div className="font-medium text-gray-900">{prettyBlock(blockId)}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded bg-green-500" aria-hidden /> SA: {saCount}</span>
                  <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded bg-yellow-400" aria-hidden /> AP: {apCount}</span>
                  <span className="inline-flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded bg-red-500" aria-hidden /> NP: {npCount}</span>
                </div>
                {totalCatalog > items.length && (
                  <button type="button" className="mt-2 text-xs text-blue-600 hover:underline" onClick={()=>toggleBlock(blockId)}>
                    {expanded.has(blockId) ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="grid md:grid-cols-2 gap-2">
                  {items.map(({ idx, key, val }) => (
                    <div key={key} className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50 transition-colors">
                      <span className={`inline-block w-3 h-3 rounded ${INDICATOR_COLORS[val]}`} />
                      <span className="inline-flex items-center gap-1 text-gray-800">
                        <span className="text-[10px] px-1 py-0.5 rounded bg-gray-100 border text-gray-600">{pnMap[key]}</span>
                        <span>{getQuestionLabel(blockId, idx)}</span>
                      </span>
                    </div>
                  ))}
                  {expanded.has(blockId) && missingIdxs.map(mIdx => (
                    <div key={`missing-${blockId}-${mIdx}`} className="flex items-center gap-2 rounded px-1 py-0.5">
                      <span className="inline-block w-3 h-3 rounded bg-gray-300" />
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <span className="text-[10px] px-1 py-0.5 rounded bg-gray-50 border text-gray-400">—</span>
                        <span>{getQuestionLabel(blockId, mIdx)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          );})}
        </tbody>
      </table>
      <div className="p-3 bg-gray-50 border-t">
        <Legend />
      </div>
    </div>
  );
};

export default StageTable;
