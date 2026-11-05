import { describe, it, expect } from "vitest";
import { calculateProfit } from "../src/lib/profit";

describe("calculateProfit", () => {
  it("computes net profit and margin correctly", () => {
    const r = calculateProfit({
      itemCost: 10,
      shippingCost: 4,
      packagingCost: 1,
      platformFeePercent: 0.1,
      paymentFeePercent: 0.03,
      paymentFixedFee: 0.3,
      taxBufferPercent: 0.05,
      salePrice: 30,
    });
    expect(r.isValid).toBe(true);
    expect(r.totalCosts).toBe(15);
    expect(r.netProfit).toBeCloseTo(9.3, 2);
    expect(r.margin).toBeCloseTo(0.31, 2);
  });

  it("flags invalid when variable fees reach 100%", () => {
    const r = calculateProfit({
      itemCost: 10,
      shippingCost: 0,
      packagingCost: 0,
      platformFeePercent: 0.5,
      paymentFeePercent: 0.5,
      paymentFixedFee: 0,
      taxBufferPercent: 0,
      salePrice: 20,
    });
    expect(r.isValid).toBe(false);
    expect(r.suggestedPrice).toBeNull();
  });

  it("suggests a higher price for a target profit", () => {
    const r = calculateProfit({
      itemCost: 10,
      shippingCost: 4,
      packagingCost: 1,
      platformFeePercent: 0.1,
      paymentFeePercent: 0.03,
      paymentFixedFee: 0.3,
      taxBufferPercent: 0.05,
      salePrice: 30,
      targetNetProfit: 15,
    });
    expect(r.suggestedPrice).not.toBeNull();
    expect(r.suggestedPrice as number).toBeGreaterThan(30);
    expect(r.suggestedPrice as number).toBeCloseTo(36.95, 2);
  });
});