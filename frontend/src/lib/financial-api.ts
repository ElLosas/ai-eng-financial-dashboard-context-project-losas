import type { FinancialMovement } from "./financial-types";

export async function fetchFinancialData(
  apiBaseUrl: string,
): Promise<FinancialMovement[]> {
  const response = await fetch(`${apiBaseUrl}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}