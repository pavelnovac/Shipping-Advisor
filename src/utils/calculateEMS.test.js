import { describe, expect, it } from "vitest";
import { additionalEmsSteps, calculateEMS } from "./calculateEMS.js";

const FR = "FR";

function emsCost(grams, country = FR) {
  return calculateEMS({ countryCode: country, actualWeightGrams: grams }).finalCost;
}

describe("EMS bracket edges for France", () => {
  it("charges 250g at the <=250g rate", () => {
    expect(emsCost(250)).toBe(460);
  });

  it("charges 251g at the 251–500g rate", () => {
    expect(emsCost(251)).toBe(485);
  });

  it("charges 500g at the 251–500g rate", () => {
    expect(emsCost(500)).toBe(485);
  });

  it("charges 501g at the 501–1000g rate", () => {
    expect(emsCost(501)).toBe(530);
  });

  it("charges 1000g at the 501–1000g rate", () => {
    expect(emsCost(1000)).toBe(530);
  });

  it("charges 1001g at the 1001–1500g rate", () => {
    expect(emsCost(1001)).toBe(575);
  });

  it("charges 1500g at the 1001–1500g rate", () => {
    expect(emsCost(1500)).toBe(575);
  });

  it("charges 1501g at the 1501–2000g rate", () => {
    expect(emsCost(1501)).toBe(620);
  });

  it("charges 2000g at the 1501–2000g rate", () => {
    expect(emsCost(2000)).toBe(620);
  });
});

describe("EMS additional 500g steps", () => {
  it("treats 2001g as one additional 500g charge", () => {
    expect(additionalEmsSteps(2001)).toBe(1);
    expect(emsCost(2001)).toBe(665);
  });

  it("treats 2499g as one additional 500g charge", () => {
    expect(additionalEmsSteps(2499)).toBe(1);
    expect(emsCost(2499)).toBe(665);
  });

  it("treats 2500g as one additional 500g charge", () => {
    expect(additionalEmsSteps(2500)).toBe(1);
    expect(emsCost(2500)).toBe(665);
  });

  it("treats 2501g as two additional 500g charges", () => {
    expect(additionalEmsSteps(2501)).toBe(2);
    expect(emsCost(2501)).toBe(710);
  });
});

describe("EMS destination coverage", () => {
  it("uses actual weight only and remains available for countries without Nova", () => {
    const result = calculateEMS({ countryCode: "RO", actualWeightGrams: 250 });
    expect(result.available).toBe(true);
    expect(result.finalCost).toBe(300);
  });

  it("marks unknown destinations unavailable", () => {
    const result = calculateEMS({ countryCode: "XX", actualWeightGrams: 500 });
    expect(result.available).toBe(false);
  });
});
