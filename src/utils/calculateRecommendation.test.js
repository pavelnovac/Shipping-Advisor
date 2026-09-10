import { describe, expect, it } from "vitest";
import { calculateEMS } from "./calculateEMS.js";
import { calculateNova } from "./calculateNova.js";
import { calculateRecommendation } from "./calculateRecommendation.js";

function nova(overrides = {}) {
  return calculateNova({
    countryCode: "FR",
    actualWeightKg: 0.65,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 10,
    invoiceValue: 0,
    invoiceCurrency: "MDL",
    uniqueHSCodes: 1,
    shipmentType: "parcel",
    eurToMdl: 19.5,
    includeDeclaredValueFee: false,
    includeHsFee: false,
    includeUsaSurcharge: false,
    ...overrides,
  });
}

describe("recommendation compares final costs", () => {
  it("recommends Nova when Nova is cheaper", () => {
    const result = calculateRecommendation(nova(), calculateEMS({ countryCode: "FR", actualWeightGrams: 650 }));
    expect(result.winner).toBe("nova");
    expect(result.recommendedText).toBe("Recommended carrier: NOVA POST");
    expect(result.savings).toBeGreaterThan(0);
  });

  it("recommends EMS when EMS is cheaper", () => {
    const bulkyNova = nova({
      actualWeightKg: 0.7,
      lengthCm: 40,
      widthCm: 35,
      heightCm: 30,
    });
    const ems = calculateEMS({ countryCode: "FR", actualWeightGrams: 700 });
    const result = calculateRecommendation(bulkyNova, ems);
    expect(result.winner).toBe("ems");
    expect(result.recommendedText).toBe("Recommended carrier: POȘTA MOLDOVEI EMS");
  });

  it("reports equal final costs", () => {
    const result = calculateRecommendation(
      { available: true, finalCost: 530 },
      { available: true, finalCost: 530 },
    );
    expect(result.equal).toBe(true);
    expect(result.winner).toBe(null);
    expect(result.message).toBe("Both options have the same calculated cost.");
  });

  it("recommends EMS when Nova is unavailable", () => {
    const result = calculateRecommendation(
      nova({ countryCode: "RO" }),
      calculateEMS({ countryCode: "RO", actualWeightGrams: 500 }),
    );
    expect(result.winner).toBe("ems");
    expect(result.novaUnavailable).toBe(true);
  });

  it("recommends Nova when EMS is unavailable", () => {
    const result = calculateRecommendation(nova(), {
      available: false,
      finalCost: null,
    });
    expect(result.winner).toBe("nova");
    expect(result.emsUnavailable).toBe(true);
  });
});
