/** Operation values accepted by the financial metrics API. */
export type OperationType = "income" | "outcome";

/** Category values accepted and returned by the financial metrics API. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others"
  | "taxes";

/** Business segments accepted by the financial metrics API. */
export type BusinessType = "B2B" | "B2C";

export interface FacetsResponse {
  /** Operation types available for filtering: `income` and `outcome`. */
  operation_types: OperationType[];
  /** Business segments available for filtering: `B2B` and `B2C`. */
  business_types: BusinessType[];
  /** Categories available for filtering, using the API's `Category` values. */
  categories: Category[];
  /** Earliest movement date as an ISO calendar date (`YYYY-MM-DD`). */
  min_date: string;
  /** Latest movement date as an ISO calendar date (`YYYY-MM-DD`). */
  max_date: string;
}

export interface AlertEntry {
  /** Aggregation key: `YYYY-MM-DD` for days, `YYYY-Www` for ISO weeks, or `YYYY-MM` for months. */
  period: string;
  /** Total amount of outcome movements in this period, in the API's currency units. */
  outcome_total: number;
  /** Mean outcome amount for preceding periods in the selected aggregation, in currency units. */
  baseline_average: number;
  /** Relative increase over the baseline as a ratio; for example, `0.3` means 30%. */
  increase_ratio: number;
}

/** Array returned by `GET /api/metrics/alerts`; it is empty when no period exceeds the threshold. */
export type AlertsResponse = AlertEntry[];

export interface CategoryEntry {
  /** Category of the ranked movements; values match the API's `Category` union. */
  category: Category;
  /** Operation being ranked: `income` or `outcome`. */
  operation_type: OperationType;
  /** Sum for this category and operation in the selected segment and date range, in currency units. */
  total_amount: number;
}

/**
 * Frontend aggregation of two `/api/metrics/categories/top` responses.
 * The API returns one `CategoryEntry[]` per request, not this B2B/B2C wrapper.
 */
export interface TopCategoriesResponse {
  /** Top categories returned by a request filtered with `business_type=B2B`. */
  B2B: CategoryEntry[];
  /** Top categories returned by a request filtered with `business_type=B2C`. */
  B2C: CategoryEntry[];
}