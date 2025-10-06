export interface ReportSeries { label: string; values: number[] }
export interface TooltipState { visible: boolean; x:number; y:number; title?:string; lines?: { name:string; value:number }[] }
