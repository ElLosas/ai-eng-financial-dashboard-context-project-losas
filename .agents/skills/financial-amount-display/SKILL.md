---
name: financial-amount-display
description: "Use when reviewing or changing how currency amounts, totals, percentages, or financial values are calculated, rounded, or displayed in this dashboard."
---

# Financial Amount Display

## Objective

Keep financial calculations numerically accurate and make the display precision, currency, and locale consistent with the purpose of each dashboard surface.

## Inputs

- The requested metric or display surface: KPI, chart axis, tooltip, table, or API response.
- The current source type, currency, locale, formatter, and call sites.
- Any explicit product or accounting requirement for decimal precision and rounding.

If the required precision or currency is unspecified and a change would alter visible financial values, report the current behavior and ask for the product decision before changing it. Do not treat an existing formatter or test as proof that its behavior is an approved accounting policy.

## Workflow

1. Trace the value from the API/type through aggregation and calculation to every affected display surface.
2. Separate numeric calculations from presentation. Never feed formatted or rounded display strings back into calculations; preserve source precision through aggregation and ratios.
3. Identify the existing display contract for each surface, including currency, locale, decimal places, compact axis units, and negative-value notation.
4. Compare the requested behavior with explicit product requirements. Preserve existing behavior when requirements are absent; call out detail lost by rounding and propose a surface-specific alternative for confirmation.
5. Reuse or extend the shared formatter rather than adding one-off currency formatting. Keep compact axis labels explicit about units and do not confuse them with exact values in a tooltip or table.
6. Add exact tests for representative values and rounding boundaries, including negative values and zero where relevant. Keep calculation assertions separate from formatter assertions.
7. Run the focused financial tests, frontend build, and lint when code changes.

## Repository Evidence

- Backend movements expose `amount` as a Python `float`; frontend movements expose it as a TypeScript `number`.
- `formatCurrency` currently uses `en-US`, USD, and zero fraction digits. It is shared by KPI cards, chart tooltips, and the chart data table; the income axis separately uses compact `$k` labels.
- A formatter test currently expects `formatCurrency(1234.56)` to return `$1,235`. This documents current behavior, not a confirmed product-wide precision policy.

Recheck these files rather than assuming this evidence is unchanged:

- `backend/app/routes.py`
- `frontend/src/lib/financial-types.ts`
- `frontend/src/lib/financial-utils.ts`
- `frontend/src/lib/financial-utils.test.ts`
- `frontend/src/components/dashboard/`

## Expected Output

For an audit, report the source-to-display path, current behavior by surface, any precision or currency ambiguity, and a minimal recommendation. For an implementation, list the changed surfaces, the chosen display contract, exact test cases, and validation results.

## Acceptance Criteria

- Source values and intermediate financial calculations retain their numeric precision; rounding is confined to the intended presentation boundary unless an explicit accounting rule says otherwise.
- Currency, locale, decimal precision, and compact units are explicit for each affected surface.
- Related surfaces do not silently disagree about what a displayed amount means.
- Tests assert exact financial values and exact formatted output, including relevant boundaries.
- Unspecified policy is surfaced as an assumption or question, not silently invented by the agent.