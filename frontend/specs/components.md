# Especificacion de componentes por funcionalidad

## Alcance

Este documento define contratos de props para las tres funcionalidades de
analitica de Fase 2. Los tipos de API y parametros se reutilizan desde
`api-types.ts` y `param-types.ts`; los nombres de props de UI se mantienen en
camelCase y los nombres enviados al backend conservan snake_case.

Estos componentes son una especificacion, no implementaciones existentes. La
pantalla actual consume `/api/metrics` y calcula sus KPI y graficos en el
cliente; estas funcionalidades requieren integrar sus endpoints por separado.

## Decisiones compartidas

- El rango inicial abarca `FacetsResponse.min_date` hasta
  `FacetsResponse.max_date`. Ambos limites son inclusivos y usan `YYYY-MM-DD`.
- Los extremos se pueden editar y limpiar de forma independiente. Solo
  `start_date` consulta desde esa fecha sin limite superior; solo `end_date`
  consulta hasta esa fecha sin limite inferior. Si ambos se omiten, se usa todo
  el rango disponible.
- El usuario puede elegir B2B, B2C o todos los segmentos. En props, `undefined`
  significa todos; al construir la consulta, se omite `business_type`.
- Si ambos extremos estan definidos y `start_date` es posterior a `end_date`, se
  muestra un error de validacion y no se solicitan datos con ese rango.
- Los estados de carga se muestran dentro de cada componente. Los errores HTTP
  se propagan a la pagina, siguiendo el manejo actual de errores en `App.tsx`.
- Las respuestas vacias se muestran como estados vacios, no como errores. Un
  array vacio de alertas significa que la API no devolvio alertas para esos
  filtros; por si solo no permite afirmar que no existan movimientos.

## Controles de periodo y segmento

### `AnalyticsFilters`

Recibe las facetas de la API para establecer limites y opciones, y mantiene los
valores seleccionados bajo control del componente padre.

```ts
import type { FacetsResponse, BusinessType } from "./api-types";
import type { DateRangeFilter } from "./param-types";

interface AnalyticsFiltersProps {
  facets: FacetsResponse | null;
  dateRange: DateRangeFilter;
  businessType?: BusinessType;
  onDateRangeChange: (dateRange: DateRangeFilter) => void;
  onBusinessTypeChange: (businessType: BusinessType | undefined) => void;
  loading?: boolean;
}
```

- `facets.business_types` proporciona las opciones B2B y B2C; no se inventan
  segmentos que no devuelva la API.
- La opcion “Todos” representa `businessType === undefined` y elimina el filtro
  de segmento de las solicitudes.
- Los campos de fecha usan `facets.min_date` y `facets.max_date` como limites
  seleccionables. Si todavia se estan cargando las facetas, el componente
  muestra su estado de carga y no presenta limites ficticios.
- Cambiar un filtro actualiza el valor controlado mediante su callback; el
  componente no realiza llamadas HTTP.
- Con un solo campo de fecha informado, se conserva ese campo y se deja el otro
  sin definir; no se copia la fecha ni se transforma el filtro en un dia unico.

Renderizado condicional:

1. Sin facetas o con `loading`, mostrar skeletons para los controles y no
  inventar valores minimos, maximos ni opciones.
2. Con facetas, mostrar los controles con el rango y las opciones de la API.
3. Si ambos extremos existen y el rango es invalido, mostrar validacion y
  deshabilitar la accion que solicita datos.

## Alertas de gastos

### `AlertsTable`

```ts
import type { AlertsResponse } from "./api-types";
import type { AlertsParams } from "./param-types";

interface AlertsTableProps {
  alerts: AlertsResponse;
  params: AlertsParams;
  loading?: boolean;
}
```

- `params` describe los filtros usados para producir `alerts`, incluido el
  umbral y la agrupacion. `threshold` ausente equivale al default API `0.3`;
  `group_by` ausente equivale a `month`.
- Si `params.business_type` esta definido, las alertas corresponden solo a ese
  segmento. Si se omite, la consulta agrega ambos segmentos; la tabla no
  compara B2B y B2C por separado.
- Cada fila presenta periodo, gasto (`outcome_total`), promedio historico
  (`baseline_average`) e incremento. `increase_ratio` se muestra como porcentaje
  multiplicandolo por 100; `threshold` sigue la misma conversion visual.
- Se conserva el orden cronologico recibido. El formato de `period` depende de
  `params.group_by`: fecha ISO para dia, semana ISO para semana y `YYYY-MM` para
  mes.
- Si `alerts` esta vacio y no hay carga activa, mostrar “No hay alertas que
  superen el umbral para estos filtros”. No inferir del array vacio que no haya
  movimientos.

Renderizado condicional:

1. Con `loading`, mostrar skeleton de la tabla.
2. Sin carga y con `alerts.length === 0`, mostrar el estado vacio indicado.
3. Con alertas, mostrar la tabla con una fila por `AlertEntry`.
4. Si la pagina recibe un error HTTP, mostrar el error de pagina; no presentarlo
  como una respuesta vacia.

## Comparativa de categorias B2B/B2C

### `TopCategoriesComparison` y paneles por segmento

```ts
import type {
  BusinessType,
  TopCategoriesComparisonData,
  TopCategoriesResponse,
} from "./api-types";
import type { TopCategoriesParams } from "./param-types";

interface TopCategoriesComparisonProps {
  data: TopCategoriesComparisonData;
  params: Omit<TopCategoriesParams, "business_type">;
  loading?: boolean;
}

interface TopCategoriesPanelProps {
  businessType: BusinessType;
  entries: TopCategoriesResponse;
  loading?: boolean;
}
```

- `TopCategoriesResponse` es exactamente el array `CategoryEntry[]` devuelto
  por una llamada a `/api/metrics/categories/top`. `TopCategoriesComparisonData`
  es la composicion del frontend: el padre hace dos solicitudes con los mismos
  filtros, una con `business_type=B2B` y otra con `business_type=B2C`, y coloca
  cada respuesta en su propiedad correspondiente.
- La tabla compara siempre ambas columnas, aunque `AnalyticsFilters` tenga
  seleccionado un segmento concreto. El selector de segmento filtra las
  alertas; no elimina una columna de esta comparativa.
- `params` contiene `start_date`, `end_date`, `operation_type` y `limit`
  compartidos por ambas solicitudes. `business_type` se excluye porque cada
  solicitud usa un segmento distinto. Si `operation_type` no se define, se
  aplica el default API `outcome`; si `limit` no se define, se aplica `5`.
- El padre representa `data.B2B` y `data.B2C` en dos paneles independientes,
  uno por cada `businessType`. Cada panel recibe sus propias `entries` y conserva
  el orden descendente que entrega la API; no se hace union ni se rellena con
  ceros la lista del otro segmento.
- Cada solicitud pide hasta `params.limit ?? 5` elementos. Los paneles identifican
  el top-5 por segmento; si `limit` tiene otro valor, el titulo refleja ese
  limite efectivo.

Renderizado condicional de cada panel B2B y B2C, evaluado por separado:

1. Con `loading`, mostrar el skeleton del panel correspondiente.
2. Sin carga y con `entries.length === 0`, mantener el titulo y mostrar “No hay
   categorias para B2B con estos filtros” o “No hay categorias para B2C con
   estos filtros”, segun `businessType`. El otro panel no se oculta ni cambia.
3. Con entradas, mostrar las categorias e importes recibidos hasta el limite
   solicitado.
4. Un error HTTP se muestra en la pagina contenedora y no como panel vacio.

## Criterios de aceptacion

- Ningun componente usa `any` ni `object`; sus datos se tipan con los contratos
  de Fase 2.
- Las facetas definen las opciones y limites disponibles, y el filtro de
  segmento usa exclusivamente los valores `B2B` y `B2C` publicados por la API.
- El filtro global admite un estado sin segmento y lo traduce a la omision del
  query parameter `business_type`.
- La tabla de alertas representa correctamente la escala de ratios y no llama
  “margen” al `increase_ratio`.
- La tabla de categorias agrega dos respuestas separadas y nunca atribuye al
  backend el wrapper `TopCategoriesComparisonData`; los paneles B2B y B2C
  presentan sus estados vacios de forma independiente.
- Los estados de carga y vacio son distintos; los errores HTTP se manejan en la
  pagina contenedora.
- Un filtro con solo `start_date` o solo `end_date` conserva el extremo definido
  y deja abierto el otro extremo.