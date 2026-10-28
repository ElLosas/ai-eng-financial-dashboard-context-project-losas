import type { BusinessType, OperationType } from "./api-types";

export interface DateRangeFilter {
  /** Optional inclusive lower bound, formatted as an ISO calendar date (`YYYY-MM-DD`). */
  start_date?: string;
  /** Optional inclusive upper bound, formatted as an ISO calendar date (`YYYY-MM-DD`). */
  end_date?: string;
}

/** Aggregation units accepted by the summary and alerts endpoints. */
export type GroupBy = "day" | "week" | "month";

export interface AlertsParams extends DateRangeFilter {
  /** Minimum relative increase ratio; must be >= 0, defaults to `0.3` (30%). */
  threshold?: number;
  /** Alert aggregation unit; accepts `day`, `week`, or `month`, defaults to `month`. */
  group_by?: GroupBy;
  /** Optional segment filter; accepts `B2B` or `B2C`. */
  business_type?: BusinessType;
}

export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation to rank; accepts `income` or `outcome`, defaults to `outcome`. */
  operation_type?: OperationType;
  /** Maximum number of categories; integer from 1 to 20, defaults to `5`. */
  limit?: number;
  /** Optional segment filter; accepts `B2B` or `B2C`. */
  business_type?: BusinessType;
}