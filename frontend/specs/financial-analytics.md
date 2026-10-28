# Analitica financiera

## Objetivo y alcance

Documentar la semantica de resumenes, comparaciones y alertas para evitar que el
texto de producto atribuya a la API campos o calculos que no expone.

El backend publica estos tres endpoints, pero el frontend actual no los consume.
La pantalla carga `GET /api/metrics` mediante `fetchFinancialData` y calcula los
KPI y las series mensuales en el cliente. Esta especificacion describe el
contrato que debe respetar una futura integracion; no implica cambios en la
implementacion actual.

## Terminologia de producto y API

| Wording de producto | Campo o calculo real | Nota para la interfaz |
| --- | --- | --- |
| Ingresos | `income` | Importe agregado de movimientos `income`. |
| Gastos | `outcome` | La API no usa un campo llamado `expenses`. |
| Beneficio / beneficio neto | `net` | Ingresos menos gastos. En comparacion, `current_period` y `previous_period` tambien son netos. |
| Margen | No es un campo de estos endpoints | Se deriva como `net / income * 100`; el frontend actual devuelve 0 si los ingresos son 0. |
| Variacion porcentual | `delta_pct` en comparacion | Es la variacion del neto frente al periodo anterior, no el margen ni la variacion de ingresos. Puede ser `null`. |
| Alerta / anomalia | Aumento de gastos | El endpoint no detecta anomalias genericas: busca aumentos de `outcome` frente al promedio de periodos anteriores. |

Los nombres `current_period` y `previous_period` son importes netos, no fechas ni
totales de ingresos. `delta_pct` se expresa en porcentaje (por ejemplo, `-57.71`
significa -57.71 %). `increase_ratio` y `threshold`, en cambio, son proporciones
(por ejemplo, `0.3` equivale a 30 %).

## Contratos de API

Todas las fechas de consulta usan el formato ISO `YYYY-MM-DD`. Los parametros
son query parameters; los endpoints no requieren un cuerpo de solicitud.

### Resumen

`GET /api/metrics/summary`

| Parametro | Tipo y valores | Requerido | Predeterminado |
| --- | --- | --- | --- |
| `group_by` | `day`, `week` o `month` | No | `month` |
| `start_date` | Fecha ISO | No | Sin limite inferior |
| `end_date` | Fecha ISO | No | Sin limite superior |
| `category` | `suppliers`, `sales`, `operational`, `administrative`, `others` o `taxes` | No | Sin filtro |
| `operation_type` | `income` o `outcome` | No | Sin filtro |
| `business_type` | `B2B` o `B2C` | No | Sin filtro |

Respuesta: array de objetos con forma:

```json
{
  "period": "2026-03",
  "income": 1200.0,
  "outcome": 475.0,
  "net": 725.0
}
```

`period` es una fecha (`YYYY-MM-DD`) para `day`, una semana ISO (`YYYY-Www`)
para `week` y un mes (`YYYY-MM`) para `month`. `net = income - outcome`.

### Comparacion

`GET /api/metrics/comparison`

| Parametro | Tipo y valores | Requerido | Predeterminado |
| --- | --- | --- | --- |
| `start_date` | Fecha ISO | Si | Ninguno |
| `end_date` | Fecha ISO | Si | Ninguno |
| `business_type` | `B2B` o `B2C` | No | Sin filtro |

Respuesta: un objeto con forma:

```json
{
  "current_period": 725.0,
  "previous_period": 500.0,
  "delta_abs": 225.0,
  "delta_pct": 45.0
}
```

`current_period` y `previous_period` son los netos de ambos intervalos. El
intervalo anterior tiene la misma duracion inclusiva y termina el dia anterior
a `start_date`. `delta_abs = current_period - previous_period`.
`delta_pct = delta_abs / abs(previous_period) * 100`; vale `null` si el neto
anterior es cero.

### Alertas

`GET /api/metrics/alerts`

| Parametro | Tipo y valores | Requerido | Predeterminado |
| --- | --- | --- | --- |
| `threshold` | Numero mayor o igual que 0 | No | `0.3` |
| `group_by` | `day`, `week` o `month` | No | `month` |
| `start_date` | Fecha ISO | No | Sin limite inferior |
| `end_date` | Fecha ISO | No | Sin limite superior |
| `business_type` | `B2B` o `B2C` | No | Sin filtro |

Respuesta: array de objetos con forma:

```json
{
  "period": "2026-03",
  "outcome_total": 900.0,
  "baseline_average": 600.0,
  "increase_ratio": 0.5
}
```

`baseline_average` es el promedio de gastos de los periodos anteriores
incluidos en la consulta. Se emite una alerta solo cuando existe un promedio
mayor que cero y `increase_ratio > threshold`; igualdad con el umbral no alerta.
`increase_ratio = (outcome_total - baseline_average) / baseline_average`.

## Criterios de integracion

- Mantener las llamadas HTTP y el manejo de respuestas no exitosas en
  `frontend/src/lib/financial-api.ts`, siguiendo el patron existente de
  `fetchFinancialData`.
- Declarar los tipos de respuesta de estos endpoints en
  `frontend/src/lib/financial-types.ts`; no reutilizar `KPIMetrics` ni
  `MonthlyDataPoint` como si fueran sus respuestas API.
- Codificar los query parameters como parametros URL. Los endpoints de resumen
  y alertas aceptan filtros opcionales; comparacion requiere ambas fechas.
- Probar paths, parametros, respuestas y el comportamiento HTTP no exitoso.
- No presentar `delta_pct` como margen ni `increase_ratio` como un porcentaje
  ya escalado por 100.