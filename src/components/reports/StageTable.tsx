import React from 'react';
import { Assessment } from '../../lib/mockData';
import { groupIndicatorsByBlock, prettyBlock, getQuestionLabel, INDICATOR_COLORS, QUESTIONS, MODULE_STAGE_BLOCKS } from './constants';
import Legend from './Legend';

interface Props { assessment?: Assessment | null }

const StageTable: React.FC<Props> = ({ assessment }) => {
  if (!assessment) return <div className="text-sm text-gray-600">No hay evaluación para mostrar.</div>;
  const grouped = groupIndicatorsByBlock(assessment.indicators);
  // Determinar bloques esperados según módulo y etapa; fallback a presentes si falta el mapeo
  const expected = MODULE_STAGE_BLOCKS[assessment.module_id as 'lectoescritura'|'matematica']?.[assessment.stage] || Object.keys(grouped);
  // Generar PN continuo por orden de bloques esperados y luego índice de pregunta (catálogo)
  const pnLabelFor: Record<string, string> = {};
  let running = 1;
  for (const blockId of expected) {
    const count = QUESTIONS[blockId]?.length ?? (grouped[blockId]?.length ?? 0);
    for (let i = 0; i < count; i++) {
      pnLabelFor[`${blockId}#${i}`] = `P${running++}`;
    }
  }

  // Vista compacta: columnas por bloque, una fila con cuadrícula de "cuadritos"
  const blockIds = expected;
  return (
    <div className="border rounded-lg overflow-visible">
      <div className="w-full">
        <table className="w-full table-fixed border-collapse text-sm">
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
                const items = grouped[blockId] || [];
                return (
                  <td
                    key={blockId}
                    className="border border-gray-100 px-2 py-3 text-center align-top overflow-visible"
                  >
                    <div className="grid grid-cols-5 place-items-center gap-2">
                      {(QUESTIONS[blockId] ?? []).map((_, i) => {
                        // En grouped, idx proviene de la clave ..._N (probablemente 1-based)
                        const present = items.find(it => it.idx === i + 1);
                        const label = getQuestionLabel(blockId, i);
                        const pn = pnLabelFor[`${blockId}#${i}`];
                        const colorClass = present ? INDICATOR_COLORS[present.val] : 'bg-gray-200 text-gray-500';
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
};

export default StageTable;
