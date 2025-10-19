import React from 'react';
import { Assessment } from '../../lib/mockData';
import { groupIndicatorsByBlock, prettyBlock, getQuestionLabel, INDICATOR_COLORS, QUESTIONS, MODULE_STAGE_BLOCKS } from './constants';
import Legend from './Legend';

interface Props { assessment?: Assessment | null; variant?: 'screen' | 'pdf' }

const StageTable: React.FC<Props> = ({ assessment, variant='screen' }) => {
  if (!assessment) return <div className="text-sm text-gray-600">No hay evaluación para mostrar.</div>;
  const grouped = groupIndicatorsByBlock(assessment.indicators);
  const expected = MODULE_STAGE_BLOCKS[assessment.module_id as 'lectoescritura'|'matematica']?.[assessment.stage] || Object.keys(grouped);
  const pnLabelFor: Record<string, string> = {};
  let running = 1;
  for (const blockId of expected) {
    const count = QUESTIONS[blockId]?.length ?? (grouped[blockId]?.length ?? 0);
    for (let i = 0; i < count; i++) pnLabelFor[`${blockId}#${i}`] = `P${running++}`;
  }

  const blockIds = expected;
  return (
    <div className={`border rounded-lg overflow-visible ${variant==='pdf' ? 'text-[12px]' : ''}`}>
      <div className="w-full">
        <table
          className={`w-full table-fixed ${variant==='pdf' ? 'border-separate' : 'border-collapse'} text-sm`}
          style={variant==='pdf' ? { borderSpacing: '8px 6px' } : undefined}
        >
          <thead>
            <tr>
              {blockIds.map((blockId) => (
                <th
                  key={blockId}
                  className="border border-gray-200 bg-gray-100 text-gray-800 font-semibold text-center px-2 py-2"
                  style={{ width: `${100 / blockIds.length}%`, wordWrap: 'break-word' }}
                >
                  {prettyBlock(blockId)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {blockIds.map((blockId) => {
                const items = (grouped[blockId] ?? []) as Array<{ idx: number; key: string; val: 'SA'|'AP'|'NP' }>; 
                const cellBase = 'text-center align-top overflow-visible';
                const cellClass = variant==='pdf' ? `border border-gray-200 rounded-md px-3 py-4 ${cellBase}` : `border border-gray-100 px-2 py-3 ${cellBase}`;
                return (
                  <td key={blockId} className={cellClass}>
                    {variant==='pdf' ? (
                      <div className="rounded-md ring-1 ring-gray-200 bg-white p-2">
                        <div className="grid grid-cols-5 place-items-center gap-3">
                          {(QUESTIONS[blockId] ?? []).map((_, i) => {
                            const present = items.find((it) => it.idx === i + 1);
                            const label = getQuestionLabel(blockId, i);
                            const pn = pnLabelFor[`${blockId}#${i}`];
                            const colorClass = present ? INDICATOR_COLORS[present.val] : 'bg-white border border-gray-300 text-gray-700';
                            return (
                              <div key={`${blockId}-${i}`} className="relative group">
                                <span
                                  className={`inline-flex items-center justify-center w-9 h-9 rounded ${colorClass} cursor-default text-[10px] font-semibold ${present ? 'text-white/90' : ''}`}
                                  title={`${pn}: ${label}`}
                                >
                                  {pn}
                                </span>
                                <span className="sr-only">{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 place-items-center gap-2">
                        {(QUESTIONS[blockId] ?? []).map((_, i) => {
                          const present = items.find((it) => it.idx === i + 1);
                          const label = getQuestionLabel(blockId, i);
                          const pn = pnLabelFor[`${blockId}#${i}`];
                          const colorClass = present ? INDICATOR_COLORS[present.val] : 'bg-white border border-gray-300 text-gray-700';
                          return (
                            <div key={`${blockId}-${i}`} className="relative group">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded ${colorClass} cursor-default text-[10px] font-semibold ${present ? 'text-white/90' : ''}`}
                                title={`${pn}: ${label}`}
                              >
                                {pn}
                              </span>
                              <span className="sr-only">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-gray-50 border-t">
        <Legend />
      </div>
    </div>
  );
}

export default StageTable;
