import React, { useEffect, useRef, useState } from 'react';

interface Series { label: string; values: number[] }
interface Props {
  series: Series[];
  title: string;
  height?: number;
  minWidth?: number;
  onBarHover?: (i:number,e:React.MouseEvent<SVGRectElement>)=>void;
  onLeave?: ()=>void;
  onBarClick?: (i:number)=>void;
}

const BarChartMini: React.FC<Props> = ({ series, title, height=220, minWidth=480, onBarHover, onLeave, onBarClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.getBoundingClientRect().width);
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const groups = series[0]?.values.length ?? 0;
  const numSeries = series.length;
  const BAR_WIDTH = 18;
  const SERIES_GAP = 4;
  const GROUP_GAP = 32;
  // padding lateral aumentado para evitar clipping de "100%"
  const padding = Math.max(44, 26);
  const plotW = groups === 0 ? 0 : groups * (numSeries * BAR_WIDTH + (numSeries - 1) * SERIES_GAP) + (groups - 1) * GROUP_GAP;
  const contentSvgWidth = Math.max(minWidth, padding * 2 + plotW);
  const svgWidth = Math.max(contentSvgWidth, containerWidth || contentSvgWidth);
  const colorFor = (label: string) => {
    switch (label) {
      case 'Completado': return '#3b82f6'; // azul
      case 'Autónomo': return '#16a34a';  // verde
      case 'Con apoyo': return '#f59e0b'; // amarillo
      case 'No logrado': return '#ef4444';// rojo
      default: return '#6b7280'; // gris por defecto
    }
  };
  const scaleY = (v:number) => padding + (height - padding * 2) - ((height - padding * 2) * v)/100;
  const groupStartX = (i:number) => padding + i * (numSeries * BAR_WIDTH + (numSeries - 1) * SERIES_GAP + GROUP_GAP);

  return (
    <div className="border rounded-lg">
      <div className="px-3 py-2 border-b text-xs font-medium text-gray-800">{title}</div>
      <div ref={containerRef} className="p-2 overflow-x-auto">
        <svg width={svgWidth} height={height} role="img" aria-label={title} onMouseLeave={onLeave}>
          <line x1={padding} y1={padding} x2={padding} y2={height-padding} stroke="#e5e7eb" />
          <line x1={padding} y1={height-padding} x2={svgWidth-padding} y2={height-padding} stroke="#e5e7eb" />
          {[0,20,40,60,80,100].map(g=>{
            const y = scaleY(g);
            return (
              <g key={g}>
                <line x1={padding} y1={y} x2={svgWidth-padding} y2={y} stroke="#f3f4f6" />
                <text x={padding-6} y={y+4} textAnchor="end" fontSize={9} fill="#6b7280">{g}%</text>
              </g>
            );
          })}
          {series.map((s, si)=> s.values.map((v,i)=>{
            const gX = groupStartX(i); const x = gX + si * (BAR_WIDTH + SERIES_GAP); const y = scaleY(v); const hBar = height - padding - y;
            return <rect
              key={s.label+"-"+i}
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={Math.max(0,hBar)}
              fill={colorFor(s.label)}
              rx={2}
              onMouseEnter={onBarHover? e=>onBarHover(i,e):undefined}
              onClick={()=>onBarClick?.(i)}
              style={{ cursor:onBarClick?'pointer':'default', transition:'height 250ms ease, y 250ms ease, opacity 200ms ease' }}
            />
          }))}
          {Array.from({length: groups}).map((_,i)=> (
            <text key={i} x={groupStartX(i) + (numSeries*BAR_WIDTH + (numSeries-1)*SERIES_GAP)/2} y={height - padding + 12} fontSize={9} textAnchor="middle" fill="#6b7280">Eval {i+1}</text>
          ))}
          {series.map((s,si)=> (
            <g key={s.label} transform={`translate(${padding + si*120}, ${padding - 10})`}>
              <rect width={10} height={10} fill={colorFor(s.label)} rx={2} />
              <text x={14} y={10} fontSize={10} fill="#374151">{s.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default BarChartMini;
