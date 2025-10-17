import React from 'react';
import { Assessment } from '../../lib/mockData';
import { groupIndicatorsByBlock, prettyBlock, getQuestionLabel, INDICATOR_COLORS } from './constants';
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

  // Vista compacta: columnas por bloque, una fila con cuadrícula de "cuadritos"
  const blockIds = Object.keys(grouped);
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
                      {items.map(({ idx, key, val }) => {
                        const label = getQuestionLabel(blockId, idx);
                        const pn = pnMap[key];
                        return (
                          <div key={key} className="relative group">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded ${INDICATOR_COLORS[val]} cursor-default text-[10px] font-semibold text-white/90`}
                              aria-label={label}
                              title={`${pn}: ${label}`}
                            >
                              {pn}
                            </span>
                            {/* Texto accesible para tests/lectores de pantalla */}
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
