import React from 'react';

interface BarChartProps {
  labels: string[];
  values: number[];
  colors?: string[];
  title?: string;
}

const defaultColors = [
  'bg-green-500',
  'bg-red-500',
  'bg-gray-400',
  'bg-blue-500',
  'bg-yellow-500'
];

const BarChart: React.FC<BarChartProps> = ({ labels, values, colors = defaultColors, title }) => {
  const maxValue = Math.max(...values, 1);
  return (
    <div className="w-full">
      {title && <h4 className="text-lg font-semibold mb-4">{title}</h4>}
      <div className="space-y-4">
        {labels.map((label, idx) => (
          <div key={label} className="flex items-center space-x-2">
            <span className="w-32 text-gray-700 text-sm">{label}</span>
            <div className="flex-1 h-6 rounded-lg overflow-hidden bg-gray-100">
              <div
                className={`h-6 ${colors[idx % colors.length]}`}
                style={{ width: `${(values[idx] / maxValue) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-gray-800 font-medium">{values[idx]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
