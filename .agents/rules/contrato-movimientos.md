# Contrato de movimientos

**Nombre:** Mantener sincronizados los tipos financieros

**Alcance:** Campos y valores de movimientos entre modelos Pydantic, respuestas API y tipos TypeScript.

**Motivo:** El backend y el frontend declaran por separado `FinancialMovement`, `Category`, `OperationType` y `BusinessType`; una divergencia puede producir respuestas que el consumidor no contempla.

**Instrucciones concretas:**
- Al cambiar campos o valores permitidos, actualiza el modelo backend y los tipos frontend en el mismo cambio.
- Mantén las restricciones de consulta y generación de datos coherentes con el valor nuevo.
- Añade una prueba de API para la aceptación/filtro del valor y ejecuta el chequeo TypeScript del frontend.

**Evidencia del repo:** `backend/app/routes.py` define `FinancialMovement` y los `Literal`; `frontend/src/lib/financial-types.ts` vuelve a declarar esos campos y uniones; `backend/tests/test_routes.py` prueba filtros por categoría.