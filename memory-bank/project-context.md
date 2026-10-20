# Contexto del proyecto

## Producto

Dashboard de métricas financieras con KPI de ingresos, gastos, beneficio y margen, más gráficos mensuales de ingresos/gastos y margen. La interfaz carga movimientos mediante `GET /api/metrics`; calcula los KPI y las series mensuales en el frontend. El período del encabezado se deriva ahora de las fechas recibidas y muestra `No data` si no hay movimientos.

Evidencia: `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`, `frontend/src/lib/financial-utils.ts`.

## Stack y ejecución

- Frontend: React, TypeScript, Vite, Tailwind CSS y Recharts. Evidencia: `frontend/package.json`, `frontend/vite.config.ts`.
- Backend: FastAPI, Pydantic y Uvicorn. El contenedor usa Python 3.13 y ejecuta Uvicorn con recarga y debugpy. Evidencia: `backend/requirements.txt`, `backend/Dockerfile`.
- Docker Compose define `frontend` y `backend`; Vite reenvía `/api` a `http://backend:8000` por defecto. `API_PROXY_TARGET` permite elegir un destino alternativo desde el entorno del servicio frontend. Evidencia: `docker-compose.yml`, `frontend/vite.config.ts`.
- El README documenta `docker compose up --build`, frontend en el puerto 5173 y backend en 8000. Evidencia: `README.es.md`.

## Estado verificado

- Las pruebas frontend pasaron: 10 pruebas con Vitest, incluidas agregación, período, agrupación de fechas ISO y cliente API.
- Las pruebas backend pasaron: 17 pruebas con pytest, incluidas rutas, filtros, categoría `taxes` y neto con valores conocidos.
- Pasó un chequeo TypeScript focalizado de los tipos y utilidades financieras/API.
- Después de configurar la alternativa del proxy, también pasaron build, lint y las 10 pruebas frontend completas, tanto en el contenedor como en la instalación local. El dashboard es ejecutable en este entorno con `API_PROXY_TARGET=http://host.docker.internal:8000 docker compose up -d --build`; el flujo HTTP de métricas por Vite está comprobado. No equivale a una validación visual completa del navegador. Evidencia: resultados de ejecución registrados en `verification.md`.
- Las comprobaciones de 2026-10-20 registradas en `verification.md` confirman HTTP 200 del backend directo y acceso a `/docs` desde el navegador. Tras configurar el frontend con `API_PROXY_TARGET=http://host.docker.internal:8000`, `/api/metrics` a través de Vite también respondió HTTP 200 con 360 movimientos y los campos esperados. Es una verificación HTTP del proxy, no una prueba automatizada del renderizado del navegador.

## Limitaciones confirmadas

- Los movimientos son sintéticos: `generate_mock_movements(seed=42)` genera 360 por llamada y usa fechas relativas a `date.today()`. No se observa persistencia ni conexión a base de datos en el backend. Evidencia: `backend/app/routes.py`, `docker-compose.yml`.
- El dashboard consume `/api/metrics`; las rutas de facetas, resúmenes, comparación, alertas y segmentos B2B/B2C existen, pero la pantalla no las llama. Evidencia: `frontend/src/lib/financial-api.ts`, `frontend/src/App.tsx`, `backend/app/routes.py`.
- Backend y frontend mantienen declaraciones separadas del contrato de movimientos. Los cambios de campos o valores permitidos requieren conservar su correspondencia. Evidencia: `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`.
- En este entorno, el destino directo `backend:8000` presentó un timeout; su causa exacta no está confirmada. La alternativa verificada usa el alias `host.docker.internal` y el puerto publicado del backend. Para activarla al recrear frontend: `API_PROXY_TARGET=http://host.docker.internal:8000 docker compose up -d --no-deps --force-recreate frontend`. Sin esa variable se conserva el destino original. Evidencia: `verification.md`, `frontend/vite.config.ts`, `docker-compose.yml`.

## Prioridades derivadas del estado

1. Al validar la integración en este entorno, comprobar la respuesta mediante el proxy con la alternativa documentada; distinguir su éxito HTTP de una prueba de renderizado y de la investigación pendiente de la conexión directa entre contenedores.
2. Al cambiar el contrato financiero, actualizar y probar tanto Pydantic como los tipos TypeScript.
3. Mantener el período visible basado en las fechas efectivamente presentadas y probar fechas límite de calendario.
4. Antes de depender de endpoints distintos de `/api/metrics`, verificar o implementar su consumo en la vista correspondiente; su existencia en el backend no implica que el dashboard ya los use.

Estas prioridades se deducen del código y las verificaciones descritas; no representan un roadmap declarado por el proyecto.
