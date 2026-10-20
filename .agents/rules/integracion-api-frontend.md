# Integración API del frontend

**Nombre:** Verificar el origen real de los datos de cada vista

**Alcance:** Llamadas HTTP desde `frontend/src` y sus rutas FastAPI correspondientes.

**Motivo:** La pantalla actual consume `/api/metrics` y calcula los KPI en el cliente; existen otros endpoints de resumen que no forman parte de ese flujo. Cambiar o duplicar una ruta sin revisar el consumo puede dejar la vista igual o desconectada.

**Instrucciones concretas:**
- Antes de cambiar una vista, localiza su llamada HTTP y confirma que la ruta exista en el backend.
- Conserva el proxy `/api` y `VITE_API_BASE_URL` como puntos de configuración del origen.
- Mantén la llamada en el cliente API frontend y prueba el path y el manejo de respuestas no exitosas.

**Evidencia del repo:** `frontend/src/App.tsx` consulta `/api/metrics`; `frontend/vite.config.ts` configura el proxy; `backend/app/routes.py` declara esa ruta y otras que la pantalla no consume.