# Período desde los datos

**Nombre:** Período del dashboard desde los movimientos

**Alcance:** El período que se presenta en el dashboard y los datos financieros que lo alimentan.

**Motivo:** El encabezado recibía un período fijo, mientras el backend genera movimientos con años relativos a la fecha actual. Eso puede atribuir métricas a un intervalo distinto del que contienen los movimientos.

**Instrucciones concretas:**
- Deriva el período visible de las fechas de los movimientos que se muestran.
- Si los datos están vacíos, muestra un estado explícito en vez de un año fijo.
- Añade una prueba con movimientos de más de un año y otra para la entrada vacía cuando cambies esta lógica.

**Evidencia del repo:** `frontend/src/App.tsx` pasa el período al encabezado; `frontend/src/lib/financial-utils.ts` calcula los datos mensuales; `backend/app/routes.py` genera fechas según `date.today()`.