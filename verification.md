# Verificación del dashboard y sus contratos

1. **Afirmación original:** El dashboard muestra ingresos, gastos, beneficio y margen, además de gráficos mensuales.  
   **Archivos revisados:** `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-row.tsx` y los componentes de gráficos.  
   **Resultado:** Confirmada.

2. **Afirmación original:** El frontend solicita `/api/metrics` y calcula los indicadores y datos mensuales.  
   **Archivos revisados:** `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`.  
   **Resultado:** Confirmada.

3. **Afirmación original:** Vite reenvía las solicitudes `/api` al backend de Docker Compose.  
   **Archivos revisados:** `frontend/vite.config.ts`, `docker-compose.yml`.  
   **Resultado:** Confirmada. Desde 2026-11-01 Compose usa `http://host.docker.internal:8000` como destino predeterminado y `/api/metrics` responde HTTP 200 sin pasar un override. El historial de pruebas previas se conserva abajo.

4. **Afirmación original:** El backend genera movimientos de ejemplo para las rutas de métricas revisadas.  
   **Archivos revisados:** `backend/app/main.py`, `backend/app/routes.py`.  
   **Resultado:** Confirmada en el código.

5. **Afirmación original:** El proyecto se levanta con `docker compose up --build`.  
   **Archivos revisados:** `README.es.md`, `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`.  
   **Resultado:** El proxy configurado en Compose permite que la interfaz obtenga `/api/metrics` con HTTP 200. No se hizo una comprobación visual automatizada del dashboard en navegador.

## Comprobaciones posteriores: 2026-10-20

- El backend directo respondió HTTP 200 en `/health` con `{"status":"ok"}` y en `/api/metrics` durante las comprobaciones de terminal. El usuario también confirmó acceso a la documentación `/docs` desde el navegador mediante el puerto reenviado de Codespaces.
- `curl -i --max-time 10 http://localhost:5173/api/metrics` terminó con código 28 (timeout). Recrear los servicios y la red mediante `docker compose down` y `docker compose up -d` no resolvió ese resultado.
- Desde el contenedor frontend, una petición a `http://backend:8000/health` con `AbortSignal.timeout(5000)` también expiró. El fallo se reproduce sin intervenir el proxy Vite.
- El usuario confirmó HTTP 200 al ejecutar desde el contenedor frontend la misma comprobación de salud usando la puerta de enlace Docker y el puerto publicado 8000. La dirección se obtuvo mediante `docker inspect`, sin fijarla en el código.
- Estos resultados acreditan acceso directo y mediante la puerta de enlace, pero no una integración satisfactoria del dashboard con el proxy actual. La causa exacta del problema de conectividad no está confirmada. No se modificaron Vite ni Compose para aplicar una alternativa.

Evidencia de configuración: `frontend/vite.config.ts` acepta `API_PROXY_TARGET` y conserva `http://backend:8000` como fallback si no se define; Compose establece ahora `http://host.docker.internal:8000` por defecto. Los resultados históricos proceden de las pruebas de terminal de cada sesión.

## Alternativa del proxy validada: 2026-10-20

- Se corrigió la ubicación de `extra_hosts` y `API_PROXY_TARGET`: pertenecen al servicio frontend, donde corre Vite, no al backend. Se retiró el volumen `/app/node_modules` añadido al backend durante el intento de configuración.
- Vite permite seleccionar `process.env.API_PROXY_TARGET`, conservando `http://backend:8000` como destino predeterminado. El alias `host.docker.internal` se resuelve mediante `host-gateway`.
- Se validó Compose con `docker compose config --quiet` y se recreó únicamente frontend con `API_PROXY_TARGET=http://host.docker.internal:8000 docker compose up -d --no-deps --force-recreate frontend`.
- Desde frontend, la petición a `http://host.docker.internal:8000/health` respondió 200. Desde la terminal, tanto `http://localhost:8000/api/metrics` como `http://localhost:5173/api/metrics` respondieron HTTP 200 con 360 movimientos; se verificaron los cinco campos de movimiento de la primera entrada.
- Esta alternativa resuelve el acceso HTTP a través del proxy en la sesión validada. No demuestra que se haya reparado la conexión directa a `backend:8000`, ni confirma su causa, ni sustituye una prueba del dashboard en el navegador. Al recrear el servicio hay que volver a proporcionar la variable para mantener la alternativa.

## Cierre de la verificación

El dashboard financiero queda ejecutable en este entorno con el proxy predeterminado: `http://localhost:5173/api/metrics` devuelve HTTP 200. Build, lint y las 10 pruebas frontend pasaron en las verificaciones registradas. La funcionalidad visual completa no se ha comprobado mediante una prueba automatizada de navegador.

Para arrancar ambos servicios desde la raíz, ya no hace falta definir `API_PROXY_TARGET`:

```bash
docker compose up --build
```

En Codespaces, abrir la URL reenviada del puerto 5173 para acceder al dashboard. El override `API_PROXY_TARGET` sigue disponible para otros entornos.

## Proxy predeterminado de Codespaces: 2026-11-01

- El proxy predeterminado `http://backend:8000` volvió a agotar el tiempo de espera al consultar `http://localhost:5173/api/metrics`; la página frontend y `/health` del backend respondían HTTP 200.
- Se cambió el valor predeterminado de `API_PROXY_TARGET` en `docker-compose.yml` a `http://host.docker.internal:8000`. La variable sigue permitiendo overrides para otros entornos.
- Se recreó solo frontend con `docker compose up -d --no-deps --force-recreate frontend`, sin pasar `API_PROXY_TARGET`. Después, la página frontend y `/api/metrics` a través de Vite respondieron HTTP 200.
- El comando habitual `docker compose up --build` usa ahora ese destino por defecto; no hace falta volver a añadir el override cada vez que se abra Codespaces. La validación fue HTTP y no una prueba visual automatizada del dashboard.

## Accesibilidad y tablas de gráficas: 2026-11-01

- `frontend/src/App.tsx`: el error de API usa `role="alert"` y `lang="es"`; la región `role="status"` anuncia carga, éxito o ausencia de datos y las secciones de KPI/gráficas exponen `aria-busy`.
- `frontend/src/components/ui/card.tsx`: `CardTitle` renderiza un encabezado `<h2>`. `frontend/src/components/ui/skeleton.tsx` oculta los placeholders a lectores de pantalla y desactiva el pulso con `prefers-reduced-motion`.
- `frontend/src/components/dashboard/income-outcome-chart.tsx` y `profit-percent-chart.tsx`: cada gráfica ofrece una tabla semántica alternativa; cada tabla tiene un botón propio con `aria-expanded` y estado React local, por lo que su apertura es independiente. En la gráfica de ingresos/gastos, ingresos usa línea sólida y gastos línea discontinua con una explicación textual.
- El grid de gráficas usa `items-start` para que abrir una tabla no estire la tarjeta vecina. Ambas descripciones reservan dos líneas (`min-h-10`) para igualar la altura de las tarjetas cuando las tablas están cerradas.
- Build de producción y ESLint focalizado pasaron tras estos cambios. No se ejecutó una auditoría automatizada de Lighthouse/axe ni una prueba con lector de pantalla o navegador.

## Patrones React y despliegue: 2026-11-01

- Se confirmó que `frontend/package-lock.json` ya está versionado; `frontend/Dockerfile` ahora usa `npm ci` para instalaciones reproducibles y `.dockerignore` excluye dependencias y artefactos locales del contexto Docker.
- El target `development` mantiene Vite para Codespaces. El target `production` compila `dist` y lo sirve con Nginx; el perfil Compose `production` publica el frontend en el puerto 8080 y reenvía `/api/` al backend.
- La documentación de `README.md` y `README.es.md` conserva el comando de desarrollo y añade el comando opcional `docker compose --profile production up --build backend frontend-production`.
- Se cambiaron los imports estáticos de ambas gráficas a `React.lazy` con boundaries `Suspense`. El build generó un entrypoint de `187.95 kB` (`59.95 kB` gzip) y un chunk compartido `LineChart` de `342.29 kB` (`100.53 kB` gzip), sin la advertencia anterior de chunk superior a 500 kB.
- `docker compose run --build --rm frontend npm run build`, las 10 pruebas frontend, `npm run lint` y `docker compose --profile production config --quiet` pasaron. La imagen `frontend-production` se construyó y se inició; `http://localhost:8080/` y `http://localhost:8080/api/metrics` respondieron HTTP 200.
- `frontend/index.html` declara título, descripción y color del tema. Se eligió explícitamente la pila de fuentes del sistema en `frontend/src/index.css`; no se descarga una fuente externa.
- El fallback de `Suspense` y ambos estados de tarjeta reservan 470px mínimos. Es una mitigación estática de CLS; no hay medición de CLS en navegador en esta verificación.
- `frontend/nginx.conf.template` obtiene el origen API de `API_PROXY_TARGET` al iniciar Nginx. Compose conserva `host.docker.internal:8000` como valor predeterminado para Codespaces y permite sobrescribirlo para otros entornos; el filtro de envsubst preserva las variables propias de Nginx.
- `next/image` no se aplica a esta SPA Vite: no usa Next.js ni imágenes de contenido que justifiquen un pipeline de imágenes.

## Skill de visualización de datos: 2026-11-01

- Se añadió `.agents/skills/data-visualization/SKILL.md` desde `anthropics/knowledge-work-plugins`, registrado en `skills-lock.json`.
- Se eligió porque el dashboard comunica principalmente tendencias mensuales de ingresos/gastos y margen mediante gráficos. Sus criterios de selección, ejes, unidades, color y accesibilidad se aplican directamente a esos componentes y complementan las skills de React y accesibilidad.
- Para trabajos de gráficas, la skill aporta criterios de selección, precisión de ejes/unidades, color, leyendas y accesibilidad. Sus ejemplos de implementación usan Python; en este repo se deben adaptar los principios a React, TypeScript y Recharts, sin incorporar esas librerías Python al frontend.
- Esta integración añade guía para futuros cambios; no implica por sí sola una auditoría ni cambios adicionales de visualización en esta fecha.

## Exploracion de API: 2026-10-28

- Se arranco el servicio backend con Docker Compose y Swagger (`/docs`) respondio HTTP 200. Se consulto `/openapi.json` y se exploraron rutas de analitica existentes. `/api/metrics/summary` y `/api/metrics/comparison` se conservaron como evidencia de exploracion, pero no forman parte de las tres funcionalidades especificadas en `frontend/specs/README.md`.
- `GET /api/metrics/summary?group_by=month` respondio HTTP 200 con 12 periodos; el primero fue `2025-10` y el ultimo `2026-09`. Los elementos contienen `period`, `income`, `outcome` y `net`.
- `GET /api/metrics/comparison?start_date=2026-03-01&end_date=2026-03-31` respondio HTTP 200 con `current_period=40793.34`, `previous_period=96461.19`, `delta_abs=-55667.85` y `delta_pct=-57.71`.
- `GET /api/metrics/alerts?threshold=0.2&group_by=month` respondio HTTP 200 con cuatro alertas; sus elementos contienen `period`, `outcome_total`, `baseline_average` e `increase_ratio`.
- `GET /api/metrics/facets` respondio HTTP 200 con `operation_types` (`income`, `outcome`), `business_types` (`B2B`, `B2C`), las seis categorias permitidas y el rango `2025-10-02` a `2026-09-26`.
- `GET /api/metrics/categories/top` con `business_type=B2B&limit=5` y con `business_type=B2C&limit=5` respondio HTTP 200 en ambos casos, con cinco entradas cada uno. La primera categoria fue `others` para B2B y `administrative` para B2C; cada entrada expone `category`, `operation_type` y `total_amount`.
- `TopCategoriesResponse` representa el array `CategoryEntry[]` de OpenAPI; `TopCategoriesComparisonData` nombra la composicion frontend de las dos respuestas B2B y B2C.
- Se contrastaron los contratos con `frontend/src/lib/financial-api.ts`, `frontend/src/lib/financial-types.ts` y `frontend/src/App.tsx`: el dashboard actual solo solicita `/api/metrics` y calcula sus KPI y series mensuales en cliente; las rutas documentadas para filtros/facetas, alertas y comparativa de categorias aun no se consumen.
- El significado de campos, parametros, props y estados de UI queda documentado en `frontend/specs/README.md` y `frontend/specs/components.md`; no se modifico la implementacion ni se afirma que esos endpoints esten integrados en la interfaz.
- Para que los contratos TypeScript documentados tambien formen parte del chequeo normal, `frontend/tsconfig.app.json` activa `strict` e incluye `specs/**/*.ts` ademas de `src`.
- `frontend/specs/components.md` especifica props tipadas para filtros, alertas y comparativa B2B/B2C; documenta el rango con un solo extremo y estados de carga, error y vacio, incluidos estados vacios independientes para ambos paneles top-5.
- Con las dependencias del lockfile instaladas, `npx tsc --noEmit`, `npm run build`, `npm test` (10 pruebas) y `npm run lint`, ejecutados desde `frontend/`, finalizaron correctamente. El build solo mostro el aviso de chunk mayor a 500 kB.
- El error `Cannot find type definition file for 'vite/client'` se debia a que `frontend/node_modules` estaba vacio y pertenecia a root, lo que impedia `npm ci`. Se retiro unicamente ese directorio vacio y `npm ci --prefix frontend` reinstalo las dependencias; despues pasaron TypeScript y el build.
- `npm ci` instalo 266 paquetes. `npm audit` informo 14 advisories (1 low, 5 moderate, 8 high); no se ejecuto `npm audit fix` ni se cambiaron versiones como parte de esta documentacion.

## Documentacion del contrato de datos: 2026-10-28

- Se creo `frontend/specs/README.md` como guia autocontenida del contrato frontend para filtros de periodo/segmento, alertas de gastos y comparativa B2B/B2C.
- Para cada funcionalidad se indican endpoints contrastados con `/docs`, tipos TypeScript de peticion/respuesta, valores y restricciones de parametros, casos limite y el estado esperado de la UI.
- Se documentaron limites de fecha abiertos e invertidos, respuestas de alertas vacias, baseline cero, igualdad con el umbral, limites invalidos para `limit`, paneles B2B/B2C sin datos y fallo parcial de la comparativa.
- La guia enlaza `api-types.ts`, `param-types.ts` y `components.md`, y aclara que los contratos son documentacion: no se agregaron componentes React, llamadas HTTP ni cambios de backend.
- Tras los cambios de tipos/configuracion, `npx tsc --noEmit` desde `frontend/` termino correctamente. El chequeo valida los archivos TypeScript incluidos por `tsconfig.app.json`; los documentos Markdown no son archivos compilados por TypeScript.