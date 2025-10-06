## Lecto_Escritura

Aplicación React + TypeScript + Vite para gestión y evaluación de progreso educativo (Lectoescritura y Matemática) con Supabase como backend.

### Módulo de Reportes (Arquitectura Avanzada)

La página `Reports.tsx` implementa un sistema de analítica y exportación PDF modular.

Componentes clave (en `src/components/reports`):
- `BarChartMini`: Gráfico SVG ligero multi-series (Completado, Autónomo, Con apoyo, No logrado).
- `StageTable`: Tabla de indicadores agrupados por bloque/tarea con leyenda.
- `Legend`: Leyenda unificada de estados (SA/AP/NP).
- `Tooltip`: Tooltip flotante reutilizable para gráficos.
- `series.ts`: Helpers puros para construir series (histórico y PDF).
- `constants.ts`: Catálogo de bloques e items (QUESTIONS) + colores.

Hooks:
- `useStudents`: Carga lista de estudiantes (Supabase).
- `useStudentAssessments`: Carga evaluaciones filtradas por estudiante.
- `usePdfSelection`: Maneja selección de etapas y evaluaciones para exportación.

### Flujo de Datos
1. Selección de estudiante → carga evaluaciones.
2. Filtro por etapa → se generan series por módulo (`buildSeriesAndOrder`).
3. Selección de evaluación → `StageTable` detalla indicadores.
4. Modal PDF → usuario selecciona etapas/evaluaciones → preview renderizada → captura con `html2canvas` → exportación vía `jsPDF`.

### Añadir Nuevos Indicadores
1. Agregar clave en `BLOCK_TITLES` si es un bloque nuevo.
2. Agregar array de strings en `QUESTIONS` con etiquetas amigables (orden = índice + 1).
3. Asegurar que las evaluaciones creen indicadores con patrón `bloque_indice` (ej: `reconocimiento_fotos_1`).
4. La tabla y la exportación PDF se actualizan automáticamente.

### Añadir Nuevo Módulo
1. Extender tipo `module_id` donde corresponda (evaluaciones y helpers).
2. Duplicar patrones en `buildSeriesAndOrder` / `buildPdfSeries` si la lógica cambia.
3. Ajustar UI (añadir panel de gráfico extra y mapeos de colores si procede).

### Testing
Pruebas con Vitest + Testing Library.
- Series: `src/components/reports/__tests__/series.test.ts`.
- Hook selección PDF: `src/hooks/__tests__/usePdfSelection.test.ts`.
Ejecutar: `npm test`.

### Performance
- Memoización de componentes de render pesado (`React.memo`).
- Lazy/lazy-like: `jspdf` y `html2canvas` se cargan sólo al exportar.
- Futuro: convertir modal PDF en `lazy(() => import(...))` si se mueve a archivo dedicado.

### Estilo / UI
TailwindCSS para estilos utilitarios. Leyenda y estados codificados con clases semánticas.

### Exportación PDF
- Cada etapa seleccionada genera: 1 portada (gráficos + tabla resumen) + N páginas (1 por evaluación con detalle de tareas).
- Ajuste responsivo mediante escalado canvas → A4 centrado.

### Extensión Futura (Ideas)
- Filtros por rango de fechas globales.
- Comparativa entre estudiantes (agregar multi-select).
- Agregar tests de regresión visual (storyshots o playwright screenshot).
- Web workers para preparación de datos pesados.

### Scripts
`npm run dev` — desarrollo
`npm run build` — build para producción
`npm run test` — ejecutar pruebas

---
Contribuciones: abrir PR describiendo cambio y su impacto en series o indicadores.
