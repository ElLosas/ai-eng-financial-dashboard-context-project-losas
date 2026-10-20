# Cálculos con valores esperados

**Nombre:** Probar resultados financieros numéricos

**Alcance:** Cálculos de KPI, resúmenes, comparaciones y alertas en frontend y backend.

**Motivo:** Una prueba que solo confirma el estado HTTP o las claves de una respuesta puede pasar aunque la fórmula financiera haya cambiado.

**Instrucciones concretas:**
- Para cada cálculo modificado, usa entradas pequeñas y conocidas y afirma los importes/resultados exactos.
- Incluye los límites relevantes para la fórmula, como ingresos cero o períodos sin datos.
- Conserva pruebas de contrato API, pero no las uses como sustituto de aserciones numéricas.

**Evidencia del repo:** `frontend/src/lib/financial-utils.test.ts` comprueba KPI y margen con valores conocidos; en cambio, `backend/tests/test_routes.py` comprueba las claves de comparación sin comprobar el delta numérico.