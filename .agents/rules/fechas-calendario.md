# Fechas de calendario

**Nombre:** Agrupación estable de fechas ISO

**Alcance:** Conversión y agrupación de `create_date` en utilidades frontend.

**Motivo:** `create_date` es una fecha de calendario (`YYYY-MM-DD`), no una hora; convertirla a `Date` y consultar getters locales puede moverla al día o mes anterior según la zona horaria.

**Instrucciones concretas:**
- Agrupa fechas ISO por sus componentes de calendario, sin aplicar conversión de zona horaria.
- Conserva orden cronológico al ordenar las claves año-mes.
- Prueba fechas del primer día de mes bajo una zona horaria que normalmente las desplazaría al día anterior.

**Evidencia del repo:** `frontend/src/lib/financial-types.ts` define `create_date` como fecha ISO; `frontend/src/lib/financial-utils.ts` agrupa por año-mes; `frontend/src/lib/financial-utils.test.ts` ya cubre datos que cruzan año.