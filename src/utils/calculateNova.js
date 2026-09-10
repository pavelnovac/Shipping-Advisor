import { getNovaRate } from "../data/novaRates.js";
import {
  DECLARED_VALUE_RATE,
  DECLARED_VALUE_THRESHOLD_MDL,
  HS_FEE_EUR_PER_CODE,
  NOVA_EU_COUNTRY_CODES,
  USA_INVOICE_SURCHARGE_RATE,
} from "../constants/calculator.js";
import { convertInvoiceToMDL, fromEUR } from "./currency.js";
import { roundKg, roundMoney } from "./format.js";
import { billableWeightNova, calculateVolumetricWeightKg, novaDimensionWarning } from "./volumetric.js";

const EU_SET = new Set(NOVA_EU_COUNTRY_CODES);

export function calculateDeclaredValueFee(declaredValueMDL) {
  if (declaredValueMDL > DECLARED_VALUE_THRESHOLD_MDL) {
    return roundMoney(declaredValueMDL * DECLARED_VALUE_RATE);
  }
  return 0;
}

export function calculateHsFee(countryCode, uniqueHSCodeCount, eurToMdl) {
  if (!EU_SET.has(countryCode)) {
    return { applicable: false, hsFeeEUR: 0, hsFeeMDL: 0 };
  }
  const hsFeeEUR = uniqueHSCodeCount * HS_FEE_EUR_PER_CODE;
  return {
    applicable: true,
    hsFeeEUR,
    hsFeeMDL: fromEUR(hsFeeEUR, eurToMdl),
  };
}

export function calculateUsaSurcharge(countryCode, invoiceValueMDL) {
  if (countryCode !== "US") {
    return { applicable: false, usaFee: 0 };
  }
  return {
    applicable: true,
    usaFee: roundMoney(invoiceValueMDL * USA_INVOICE_SURCHARGE_RATE),
  };
}

function unavailable(reason, extra = {}) {
  return {
    available: false,
    unavailableReason: reason,
    finalCost: null,
    ...extra,
  };
}

export function getNovaTariffBracket(rateRow, billableWeightKg, shipmentType) {
  if (shipmentType === "documents") {
    if (rateRow.documents == null) {
      return { ok: false, reason: "Tariff unavailable for this weight" };
    }
    return {
      ok: true,
      bracket: "documents",
      baseRate: rateRow.documents,
      extraKg: 0,
    };
  }

  const weight = billableWeightKg;

  if (weight <= 2) {
    if (rateRow.upTo2 == null) return { ok: false, reason: "Tariff unavailable for this weight" };
    return { ok: true, bracket: "<=2kg", baseRate: rateRow.upTo2, extraKg: 0 };
  }
  if (weight <= 5) {
    if (rateRow.upTo5 == null) return { ok: false, reason: "Tariff unavailable for this weight" };
    return { ok: true, bracket: "<=5kg", baseRate: rateRow.upTo5, extraKg: 0 };
  }
  if (weight <= 10) {
    if (rateRow.upTo10 == null) return { ok: false, reason: "Tariff unavailable for this weight" };
    return { ok: true, bracket: "<=10kg", baseRate: rateRow.upTo10, extraKg: 0 };
  }
  if (weight <= 20) {
    if (rateRow.upTo20 == null) return { ok: false, reason: "Tariff unavailable for this weight" };
    return { ok: true, bracket: "<=20kg", baseRate: rateRow.upTo20, extraKg: 0 };
  }
  if (weight <= 30) {
    if (rateRow.upTo30 == null) return { ok: false, reason: "Tariff unavailable for this weight" };
    return { ok: true, bracket: "<=30kg", baseRate: rateRow.upTo30, extraKg: 0 };
  }

  if (rateRow.upTo30 == null || rateRow.additionalKg == null) {
    return { ok: false, reason: "Tariff unavailable for this weight" };
  }

  const extraKg = Math.ceil(weight - 30);
  return {
    ok: true,
    bracket: `>30kg (+${extraKg} kg)`,
    baseRate: rateRow.upTo30 + extraKg * rateRow.additionalKg,
    extraKg,
  };
}

export function calculateNova({
  countryCode,
  actualWeightKg,
  lengthCm,
  widthCm,
  heightCm,
  invoiceValue,
  invoiceCurrency,
  uniqueHSCodes,
  shipmentType = "parcel",
  senderType = "physical",
  eurToMdl,
  includeDeclaredValueFee = true,
  includeHsFee = true,
  includeUsaSurcharge = true,
}) {
  const rateRow = getNovaRate(countryCode);
  const actual = actualWeightKg == null ? null : roundKg(actualWeightKg);
  const volumetricWeightKg = calculateVolumetricWeightKg(lengthCm, widthCm, heightCm);
  const hasCompleteDimensions =
    volumetricWeightKg != null &&
    [lengthCm, widthCm, heightCm].every((value) => Number.isFinite(value) && value > 0);

  const shared = {
    carrier: "nova",
    countryCode,
    countryName: rateRow?.countryName ?? null,
    actualWeightKg: actual,
    volumetricWeightKg,
    shipmentType,
    senderType,
    extrasIncluded: senderType === "juridical",
  };

  if (!rateRow) {
    return unavailable(
      "Nova Post is not available for this destination according to the supplied tariff.",
      { ...shared, code: "NOVA_DESTINATION" },
    );
  }

  if (!hasCompleteDimensions) {
    return unavailable("Enter parcel dimensions to calculate Nova Post accurately.", {
      ...shared,
      code: "NOVA_DIMENSIONS",
    });
  }

  const billableWeightKg = billableWeightNova(actual, volumetricWeightKg);
  const bracket = getNovaTariffBracket(rateRow, billableWeightKg, shipmentType);

  if (!bracket.ok) {
    return unavailable(bracket.reason, {
      ...shared,
      billableWeightKg,
      code: "NOVA_WEIGHT",
    });
  }

  const extrasIncluded = senderType === "juridical";
  const invoiceValueMDL = convertInvoiceToMDL(invoiceValue, invoiceCurrency, eurToMdl);
  const declaredValueFeeRaw = calculateDeclaredValueFee(invoiceValueMDL);
  const declaredValueFee = extrasIncluded && includeDeclaredValueFee ? declaredValueFeeRaw : 0;

  const hs = calculateHsFee(countryCode, uniqueHSCodes, eurToMdl);
  const hsFeeEUR = extrasIncluded && includeHsFee && hs.applicable ? hs.hsFeeEUR : 0;
  const hsFeeMDL = extrasIncluded && includeHsFee && hs.applicable ? hs.hsFeeMDL : 0;

  const usa = calculateUsaSurcharge(countryCode, invoiceValueMDL);
  const usaFee = extrasIncluded && includeUsaSurcharge && usa.applicable ? usa.usaFee : 0;

  const finalCost = roundMoney(bracket.baseRate + declaredValueFee + hsFeeMDL + usaFee);
  const dimensionWarning = novaDimensionWarning(lengthCm, widthCm, heightCm);

  return {
    available: true,
    unavailableReason: null,
    code: null,
    ...shared,
    billableWeightKg,
    tariffBracket: bracket.bracket,
    extraKg: bracket.extraKg,
    baseRate: bracket.baseRate,
    invoiceValueMDL,
    declaredValueFee,
    declaredValueFeeRaw,
    declaredValueIncluded: extrasIncluded && includeDeclaredValueFee,
    hsApplicable: extrasIncluded && hs.applicable,
    hsFeeEUR,
    hsFeeMDL,
    uniqueHSCodes,
    usaApplicable: extrasIncluded && usa.applicable,
    usaFee,
    finalCost,
    dimensionWarning,
    details: {
      actualWeightKg: actual,
      volumetricWeightKg,
      billableWeightKg,
      tariffBracket: bracket.bracket,
      baseRate: bracket.baseRate,
      declaredValueMDL: invoiceValueMDL,
      declaredValueFee,
      hsFeeEUR,
      hsFeeMDL,
      exchangeRate: eurToMdl,
      usaFee,
      finalCost,
    },
  };
}
