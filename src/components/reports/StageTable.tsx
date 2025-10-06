import React from 'react';
import { Assessment } from '../../lib/mockData';
import { groupIndicatorsByBlock, prettyBlock, getQuestionLabel, INDICATOR_COLORS } from './constants';
import Legend from './Legend';

interface Props { assessment?: Assessment | null }

const StageTable: React.FC<Props> = ({ assessment }) => {
  if (!assessment) return <div className="text-sm text-gray-600">No hay evaluación para mostrar.</div>;
  const grouped = groupIndicatorsByBlock(assessment.indicators);
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
          {Object.entries(grouped).map(([blockId, items]) => (
            <tr key={blockId}>
              <td className="px-4 py-3 align-top w-72">
                <div className="font-medium text-gray-900">{prettyBlock(blockId)}</div>
              </td>
              <td className="px-4 py-3">
                <div className="grid md:grid-cols-2 gap-2">
                  {items.map(({ idx, key, val }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded ${INDICATOR_COLORS[val]}`} />
                      <span className="text-gray-800">{getQuestionLabel(blockId, idx)}</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-3 bg-gray-50 border-t">
        <Legend />
      </div>
    </div>
  );
};

export default StageTable;
