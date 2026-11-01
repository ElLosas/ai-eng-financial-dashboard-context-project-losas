# Producto

Dashboard de métricas financieras con KPI de ingresos, gastos, beneficio y margen, más gráficos mensuales de ingresos/gastos y margen. La interfaz carga movimientos mediante `GET /api/metrics`; calcula los KPI y las series mensuales en el frontend. El período del encabezado se deriva ahora de las fechas recibidas y muestra `No data` si no hay movimientos.

Evidencia: `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`, `frontend/src/lib/financial-utils.ts`.

## Criterios para gráficas

Al crear o revisar visualizaciones, consulta `.agents/skills/data-visualization/SKILL.md`. Aplica sus criterios de selección de gráfico, escalas, formato de unidades, leyendas, color y accesibilidad al dashboard financiero. El frontend usa TypeScript y Recharts: adapta los principios y no copies literalmente los ejemplos de Python (Matplotlib, Seaborn o Plotly).