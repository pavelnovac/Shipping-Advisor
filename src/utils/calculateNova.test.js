import { describe, expect, it } from "vitest";
import {
  calculateDeclaredValueFee,
  calculateHsFee,
  calculateNova,
  calculateUsaSurcharge,
  getNovaTariffBracket,
} from "./calculateNova.js";
import { getNovaRate } from "../data/novaRates.js";

function novaParcel(overrides = {}) {
  return calculateNova({
    countryCode: "FR",
    actualWeightKg: 1,
    lengthCm: 20,
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

describe("Nova billable weight", () => {
  it("uses actual weight when it is greater than volumetric weight", () => {
    const result = novaParcel({
      actualWeightKg: 5,
      lengthCm: 20,
      widthCm: 20,
      heightCm: 10,
    });
    expect(result.volumetricWeightKg).toBe(0.8);
    expect(result.billableWeightKg).toBe(5);
    expect(result.tariffBracket).toBe("<=5kg");
    expect(result.baseRate).toBe(646);
  });

  it("uses volumetric weight when it is greater than actual weight", () => {
    const result = novaParcel({
      actualWeightKg: 1,
      lengthCm: 40,
      widthCm: 30,
      heightCm: 25,
    });
    expect(result.actualWeightKg).toBe(1);
    expect(result.volumetricWeightKg).toBe(6);
    expect(result.billableWeightKg).toBe(6);
    expect(result.tariffBracket).toBe("<=10kg");
    expect(result.baseRate).toBe(901);
  });
});

describe("Nova weight brackets", () => {
  const fr = getNovaRate("FR");

  it("uses <=2kg at exactly 2kg", () => {
    expect(getNovaTariffBracket(fr, 2, "parcel")).toMatchObject({
      bracket: "<=2kg",
      baseRate: 488,
    });
  });

  it("uses <=5kg at 2.01kg", () => {
    expect(getNovaTariffBracket(fr, 2.01, "parcel")).toMatchObject({
      bracket: "<=5kg",
      baseRate: 646,
    });
  });

  it("uses <=5kg at exactly 5kg", () => {
    expect(getNovaTariffBracket(fr, 5, "parcel").baseRate).toBe(646);
  });

  it("uses <=10kg at 5.01kg", () => {
    expect(getNovaTariffBracket(fr, 5.01, "parcel")).toMatchObject({
      bracket: "<=10kg",
      baseRate: 901,
    });
  });

  it("uses <=10kg at 10kg", () => {
    expect(getNovaTariffBracket(fr, 10, "parcel").baseRate).toBe(901);
  });

  it("uses <=20kg at 20kg", () => {
    expect(getNovaTariffBracket(fr, 20, "parcel").baseRate).toBe(1511);
  });

  it("uses <=30kg at 30kg", () => {
    expect(getNovaTariffBracket(fr, 30, "parcel").baseRate).toBe(2110);
  });

  it("adds ceil extra kilograms above 30kg", () => {
    expect(getNovaTariffBracket(fr, 30.1, "parcel")).toMatchObject({
      extraKg: 1,
      baseRate: 2175,
    });
    expect(getNovaTariffBracket(fr, 32, "parcel")).toMatchObject({
      extraKg: 2,
      baseRate: 2240,
    });
  });
});

describe("Nova extra charges", () => {
  it("charges 3 EUR per unique HS code for EU destinations", () => {
    const one = calculateHsFee("FR", 1, 20);
    expect(one).toEqual({ applicable: true, hsFeeEUR: 3, hsFeeMDL: 60 });
    const many = calculateHsFee("DE", 3, 20);
    expect(many).toEqual({ applicable: true, hsFeeEUR: 9, hsFeeMDL: 180 });
  });

  it("does not apply HS fees to GB or US", () => {
    expect(calculateHsFee("GB", 2, 20).applicable).toBe(false);
    expect(calculateHsFee("US", 2, 20).hsFeeMDL).toBe(0);
  });

  it("includes declared value up to 500 MDL and charges 0.5% above", () => {
    expect(calculateDeclaredValueFee(500)).toBe(0);
    expect(calculateDeclaredValueFee(3500)).toBe(17.5);
  });

  it("applies a 15% USA invoice surcharge", () => {
    expect(calculateUsaSurcharge("US", 1000)).toEqual({ applicable: true, usaFee: 150 });
    expect(calculateUsaSurcharge("FR", 1000).applicable).toBe(false);
  });

  it("adds HS, declared-value and USA fees into the final Nova cost when enabled", () => {
    const result = calculateNova({
      countryCode: "US",
      actualWeightKg: 1,
      lengthCm: 20,
      widthCm: 10,
      heightCm: 10,
      invoiceValue: 1000,
      invoiceCurrency: "MDL",
      uniqueHSCodes: 2,
      shipmentType: "parcel",
      eurToMdl: 20,
      includeDeclaredValueFee: true,
      includeHsFee: true,
      includeUsaSurcharge: true,
    });
    expect(result.baseRate).toBe(525);
    expect(result.declaredValueFee).toBe(5);
    expect(result.hsFeeMDL).toBe(0);
    expect(result.usaFee).toBe(150);
    expect(result.finalCost).toBe(680);
  });
});

describe("Nova USA missing brackets", () => {
  it("does not invent USA tariffs above 10kg", () => {
    const result = novaParcel({
      countryCode: "US",
      actualWeightKg: 15,
      lengthCm: 20,
      widthCm: 20,
      heightCm: 10,
    });
    expect(result.available).toBe(false);
    expect(result.unavailableReason).toBe("Tariff unavailable for this weight");
  });

  it("still prices USA at 10kg from the published bracket", () => {
    const result = novaParcel({
      countryCode: "US",
      actualWeightKg: 10,
      lengthCm: 20,
      widthCm: 20,
      heightCm: 10,
    });
    expect(result.available).toBe(true);
    expect(result.baseRate).toBe(1995);
  });
});

describe("Nova missing dimensions", () => {
  it("does not assume volumetric weight equals actual weight", () => {
    const result = novaParcel({
      lengthCm: null,
      widthCm: null,
      heightCm: null,
    });
    expect(result.available).toBe(false);
    expect(result.unavailableReason).toBe(
      "Enter parcel dimensions to calculate Nova Post accurately.",
    );
  });
});
