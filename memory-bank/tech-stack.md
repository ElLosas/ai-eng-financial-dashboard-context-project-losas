# Stack y ejecución

- Frontend: React, TypeScript, Vite, Tailwind CSS y Recharts. Evidencia: `frontend/package.json`, `frontend/vite.config.ts`.
- Backend: FastAPI, Pydantic y Uvicorn. El contenedor usa Python 3.13 y ejecuta Uvicorn con recarga y debugpy. Evidencia: `backend/requirements.txt`, `backend/Dockerfile`.
- Docker Compose define `frontend` y `backend`; el proxy de Vite reenvía `/api` a `http://host.docker.internal:8000` por defecto en este entorno. `API_PROXY_TARGET` permite elegir otro destino desde el entorno del servicio frontend. Evidencia: `docker-compose.yml`, `frontend/vite.config.ts`.
- El README documenta `docker compose up --build`, frontend en el puerto 5173 y backend en 8000. Evidencia: `README.es.md`.