# Contrato de datos del frontend

## Alcance

Este documento describe los datos que la capa frontend necesita para filtros
de periodo/segmento, alertas de gastos y comparacion de categorias B2B/B2C. Las
rutas se contrastaron con Swagger/OpenAPI (`/docs`); la evidencia de las
consultas reales esta en la seccion de exploracion de analitica de
[`verification.md`](../../verification.md).

Esto es una especificacion, no una implementacion. No define componentes React,
llamadas `fetch` ni cambios del backend. Los contratos TypeScript se definen en
[`api-types.ts`](./api-types.ts) y [`param-types.ts`](./param-types.ts); los
estados de componentes se detallan en [`components.md`](./components.md).

## Convenciones compartidas

- Las fechas son strings de calendario ISO `YYYY-MM-DD`; no incluyen hora ni
  zona horaria.
- `start_date` y `end_date` son inclusivas e independientes. Si solo se envia
  `start_date`, no hay limite superior; si solo se envia `end_date`, no hay
  limite inferior; si se omiten ambas, no se filtra por fecha.
- El backend recibe nombres de query en snake_case. Los nombres de props del
  frontend pueden estar en camelCase.
- Los tipos de parametros mejoran el chequeo estatico; las validaciones del
  backend siguen siendo la autoridad en runtime. Un query invalido puede
  responder HTTP 422.
- La API no devuelve un codigo de moneda. La interfaz no debe inventar uno; la
  presentacion monetaria debe seguir la configuracion explicita del producto.

## 1. Filtros de periodo y segmento

### Endpoints

`GET /api/metrics/facets` carga los valores disponibles y el rango de fechas.
No acepta query parameters ni cuerpo de solicitud.

Las facetas alimentan los filtros usados despues por alertas y categorias. Si
el usuario selecciona B2B o B2C, se envia `business_type` con ese valor. La
opcion “Todos” omite ese parametro.

### Tipos

- Respuesta: `FacetsResponse`, definida en `api-types.ts`.
- Peticion de facetas: no tiene parametros ni cuerpo tipado porque el endpoint
  no recibe ninguno.
- Los filtros compartidos por las otras funciones usan `DateRangeFilter`,
  definido en `param-types.ts`.

`FacetsResponse` tiene estas propiedades:

| Propiedad | Tipo | Significado |
| --- | --- | --- |
| `operation_types` | `OperationType[]` | Opciones `income` y `outcome`. |
| `business_types` | `BusinessType[]` | Segmentos disponibles: `B2B` y `B2C`. |
| `categories` | `Category[]` | `suppliers`, `sales`, `operational`, `administrative`, `others` y `taxes`. |
| `min_date` | `string` | Fecha minima disponible, `YYYY-MM-DD`. |
| `max_date` | `string` | Fecha maxima disponible, `YYYY-MM-DD`. |

### Valores, restricciones y casos limite

- Inicializar el rango visual con `min_date` y `max_date`; limitar la seleccion
  a esos extremos. Los valores publicados por `business_types` y `categories`
  son la fuente de opciones, no una lista paralela inventada por el cliente.
- **Solo fecha inicial:** enviar `start_date` y omitir `end_date`; la UI mantiene
  abierto el extremo final y no duplica la fecha.
- **Solo fecha final:** enviar `end_date` y omitir `start_date`; la UI mantiene
  abierto el extremo inicial.
- **Rango invertido:** si ambas fechas existen y `start_date > end_date`, mostrar
  validacion de rango y no solicitar los datos dependientes.
- **Facetas no disponibles:** mientras se cargan, mostrar controles en estado de
  carga. Ante error HTTP o respuesta inutilizable, mostrar un error de pagina;
  no sustituir el rango por fechas fijas. El esquema actual requiere `min_date`
  y `max_date`, por lo que no se asume una respuesta de facetas vacia valida.

## 2. Tabla de anomalias de gastos

### Endpoint

`GET /api/metrics/alerts` devuelve una lista `MetricsAlert`; en frontend se
representa con `AlertsResponse` (`AlertEntry[]`). No requiere cuerpo.

### Parametros TypeScript y valores validos

Peticion: `AlertsParams` de `param-types.ts`, que extiende `DateRangeFilter`.

| Query | Tipo | Valores/restricciones | Default |
| --- | --- | --- | --- |
| `threshold` | `number` | Proporcion mayor o igual que `0`; no tiene maximo declarado. `0.3` equivale a 30%. | `0.3` |
| `group_by` | `GroupBy` | `day`, `week` o `month`. | `month` |
| `start_date` | `string` | Fecha ISO `YYYY-MM-DD`, limite inclusivo. | Sin limite inferior |
| `end_date` | `string` | Fecha ISO `YYYY-MM-DD`, limite inclusivo. | Sin limite superior |
| `business_type` | `BusinessType` | `B2B` o `B2C`; si se omite, se incluyen ambos segmentos. | Sin filtro |

Cada `AlertEntry` contiene `period: string`, `outcome_total: number`,
`baseline_average: number` e `increase_ratio: number`. El periodo usa `YYYY-MM-DD`
para `day`, `YYYY-Www` para semana ISO y `YYYY-MM` para `month`. Los dos campos
de incremento son proporciones; la UI los multiplica por 100 solo al mostrarlos
como porcentajes.

### Casos limite y comportamiento de UI

- **Lista vacia:** mostrar “No hay alertas que superen el umbral para estos
  filtros”. No deducir que no existan movimientos a partir de `[]`.
- **Baseline igual a cero:** el backend no crea alertas para ese periodo; si la
  respuesta queda vacia, mostrar el estado vacio normal, no division entre cero.
- **Incremento igual al umbral:** la API alerta solo si
  `increase_ratio > threshold`; la igualdad no genera fila ni debe mostrarse
  como anomalia.
- **Umbral negativo o agrupacion invalida:** no solicitar datos y mostrar
  validacion del filtro. Si llega a la API, FastAPI rechaza el umbral negativo
  o un valor fuera del enum con HTTP 422; no presentarlo como lista vacia.

## 3. Comparativa de categorias B2B vs B2C

### Endpoints

La tabla necesita dos solicitudes a `GET /api/metrics/categories/top`: una con
`business_type=B2B` y otra con `business_type=B2C`. Cada respuesta real es
`CategoryEntry[]`. `TopCategoriesResponse` es el wrapper compuesto por el
frontend con las propiedades `B2B` y `B2C`; no es un objeto devuelto por la API.
Ninguna solicitud requiere cuerpo.

### Parametros TypeScript y valores validos

Cada solicitud usa `TopCategoriesParams` de `param-types.ts`. Los mismos filtros
se aplican a ambas solicitudes; solo cambia `business_type`.

| Query | Tipo | Valores/restricciones | Default |
| --- | --- | --- | --- |
| `operation_type` | `OperationType` | `income` o `outcome`. | `outcome` |
| `limit` | `number` | Entero entre `1` y `20`, inclusive. | `5` |
| `start_date` | `string` | Fecha ISO `YYYY-MM-DD`, limite inclusivo. | Sin limite inferior |
| `end_date` | `string` | Fecha ISO `YYYY-MM-DD`, limite inclusivo. | Sin limite superior |
| `business_type` | `BusinessType` | Opcional para la API; admite `B2B` o `B2C`. La comparativa envia `B2B` en una solicitud y `B2C` en la otra. | Sin filtro en una solicitud directa; la comparativa siempre envia un segmento |

Cada `CategoryEntry` contiene `category: Category`,
`operation_type: OperationType` y `total_amount: number`. El backend entrega cada
lista ordenada por `total_amount` descendente y limitada por `limit`. Los arrays
se conservan como paneles independientes; una categoria ausente en una lista no
se agrega a esa lista con importe fabricado.

### Casos limite y comportamiento de UI

- **Un segmento sin resultados:** si `B2B` esta vacio y `B2C` tiene resultados,
  mostrar el estado vacio solo en el panel B2B y mantener las filas B2C; aplicar
  la regla inversa cuando B2C esta vacio.
- **Ambos segmentos sin resultados:** mostrar un estado vacio en cada panel,
  identificando B2B y B2C por separado. No mostrar skeletons cuando la carga ya
  termino.
- **Limite minimo/maximo:** `limit=1` y `limit=20` son validos; solicitar esos
  valores y presentar hasta esa cantidad por panel. Con `limit=0`, `limit=21` o
  un numero no entero, validar antes de solicitar; si llega a la API, respondera
  HTTP 422.
- **Fallo de una de las dos solicitudes:** mostrar el error de la funcionalidad
  en la pagina contenedora; no convertir la respuesta fallida en un panel vacio
  ni afirmar que la comparativa esta completa.

## Alcance de implementacion

Estos contratos describen la futura capa frontend. No se crean componentes, no
se conectan llamadas HTTP y no se cambia el backend en esta fase documental.