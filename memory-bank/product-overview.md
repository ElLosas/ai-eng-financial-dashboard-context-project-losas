# Producto

Dashboard de métricas financieras con KPI de ingresos, gastos, beneficio y margen, más gráficos mensuales de ingresos/gastos y margen. La interfaz carga movimientos mediante `GET /api/metrics`; calcula los KPI y las series mensuales en el frontend. El período del encabezado se deriva ahora de las fechas recibidas y muestra `No data` si no hay movimientos.

Evidencia: `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`, `frontend/src/lib/financial-utils.ts`.