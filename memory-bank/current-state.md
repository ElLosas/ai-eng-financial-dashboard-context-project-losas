# Estado actual

## Estado verificado

- Las pruebas frontend pasaron: 11 pruebas con Vitest, incluidas agregación con centavos, período, agrupación de fechas ISO y cliente API.
- Las pruebas backend pasaron: 17 pruebas con pytest, incluidas rutas, filtros, categoría `taxes` y neto con valores conocidos.
- Pasó un chequeo TypeScript focalizado de los tipos y utilidades financieras/API.
- En la verificación de 2026-11-01 pasaron el build sin advertencias, ESLint y las 11 pruebas frontend; las 17 pruebas backend pasaron con una advertencia de deprecación de Starlette/httpx. Con Compose, el proxy predeterminado respondió HTTP 200 para `/api/metrics`. Esto verifica el flujo HTTP, no el renderizado visual completo. Evidencia: `verification.md`.
- Las pruebas del 2026-10-20 necesitaron configurar temporalmente `API_PROXY_TARGET`; ese requisito fue supersedido el 2026-11-01 al fijar el destino funcional como valor predeterminado en Compose. Los resultados históricos están en `verification.md`.

## Limitaciones confirmadas

- Los movimientos son sintéticos: `generate_mock_movements(seed=42)` genera 360 por llamada y usa fechas relativas a `date.today()`. No se observa persistencia ni conexión a base de datos en el backend. Evidencia: `backend/app/routes.py`, `docker-compose.yml`.
- El dashboard consume `/api/metrics`; las rutas de facetas, resúmenes, comparación, alertas y segmentos B2B/B2C existen, pero la pantalla no las llama. Evidencia: `frontend/src/lib/financial-api.ts`, `frontend/src/App.tsx`, `backend/app/routes.py`.
- Backend y frontend mantienen declaraciones separadas del contrato de movimientos. Los cambios de campos o valores permitidos requieren conservar su correspondencia. Evidencia: `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`.
- En este entorno, `backend:8000` presentó un timeout entre contenedores; su causa exacta no está confirmada. Compose usa ahora `http://host.docker.internal:8000` como destino predeterminado del proxy frontend y conserva `API_PROXY_TARGET` como override opcional. Se recreó frontend sin pasar la variable y `/api/metrics` respondió HTTP 200. Evidencia: `verification.md`, `docker-compose.yml`, `frontend/vite.config.ts`.

## Skills aplicadas y cambios verificados
- `accessibility` se aplicó a anuncios de carga/error, semántica de encabezados, movimiento reducido, alternativa tabular de gráficas, diferenciación no basada solo en color y controles independientes. No se hizo auditoría Lighthouse/axe ni prueba con lector de pantalla.
- `vercel-react-best-practices` motivó carga dinámica de gráficas, instalaciones reproducibles con `npm ci` y un target Docker de producción con Nginx; el flujo de Vite para Codespaces se conserva.
- `data-visualization` se eligió porque las tendencias mensuales de ingresos/gastos y margen son centrales al dashboard. Sus principios se adaptaron a Recharts/TypeScript, no se copiaron los ejemplos Python.
- La skill interna `.agents/skills/financial-amount-display/SKILL.md` cubre el gap de precisión y redondeo financiero. La política confirmada conserva centavos en valores API y cálculos, y muestra USD redondeado a dólares enteros en KPI, tooltips y tablas. El backend usa datos sintéticos sin persistencia. El test financiero verifica ambas partes.
- Build del frontend sin advertencias, 11 pruebas Vitest y ESLint pasaron. Las 17 pruebas backend pasaron con una advertencia de deprecación de Starlette/httpx. Compose valida en desarrollo y producción; la imagen de producción y las rutas `/` y `/api/metrics` respondieron HTTP 200 en el puerto 8080.
- El bundle final registrado es 187.95 kB para el entrypoint y 342.29 kB para el chunk compartido de gráficas (sin gzip). La reserva de altura es una mitigación estática; no hay medición CLS, auditoría Lighthouse/axe ni prueba con lector de pantalla.

## Prioridades derivadas del estado

1. Al validar la integración en este entorno, comprobar la respuesta mediante el proxy predeterminado; distinguir su éxito HTTP de una prueba de renderizado y de la investigación pendiente de la conexión directa entre contenedores.
2. Al cambiar el contrato financiero, actualizar y probar tanto Pydantic como los tipos TypeScript.
3. Mantener el período visible basado en las fechas efectivamente presentadas y probar fechas límite de calendario.
4. Antes de depender de endpoints distintos de `/api/metrics`, verificar o implementar su consumo en la vista correspondiente; su existencia en el backend no implica que el dashboard ya los use.

Estas prioridades se deducen del código y las verificaciones descritas; no representan un roadmap declarado por el proyecto.