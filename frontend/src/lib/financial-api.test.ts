import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchFinancialData } from "./financial-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchFinancialData", () => {
  it("requests the backend metrics route through the configured base URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchFinancialData("http://api.example.test")).resolves.toEqual(
      [],
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.example.test/api/metrics",
    );
  });

  it("rejects unsuccessful HTTP responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );

    await expect(fetchFinancialData("")).rejects.toThrow(
      "Failed to fetch financial data: 503",
    );
  });
});