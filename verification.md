# Fase 1: verificación

Contrasté el resumen con el código: `App.tsx` solicita `/api/metrics`, `vite.config.ts` reenvía `/api` a `backend:8000` y `routes.py` genera movimientos de ejemplo. `docker-compose.yml` define los servicios frontend y backend.

Ejecuté Compose y pude abrir el frontend. Los logs muestran que Uvicorn arrancó; no confirmé la respuesta de la API desde el navegador.