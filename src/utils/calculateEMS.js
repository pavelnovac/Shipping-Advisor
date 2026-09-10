import { getEmsRate } from "../data/emsRates.js";
import { EMS_BASE_GRAMS, EMS_STEP_GRAMS } from "../constants/calculator.js";
import { roundMoney } from "./format.js";

function unavailable(reason, extra = {}) {
  return {
    available: false,
    unavailableReason: reason,
    finalCost: null,
    ...extra,
  };
}

export function additionalEmsSteps(weightGrams) {
  if (weightGrams <= EMS_BASE_GRAMS) return 0;
  return Math.ceil((weightGrams - EMS_BASE_GRAMS) / EMS_STEP_GRAMS);
}

export function getEmsTariffBracket(weightGrams, rateRow) {
  if (weightGrams <= 250) {
    return { bracket: "<=250g", baseTariff: rateRow.upTo250, additionalUnits: 0 };
  }
  if (weightGrams <= 500) {
    return { bracket: "251–500g", baseTariff: rateRow.upTo500, additionalUnits: 0 };
  }
  if (weightGrams <= 1000) {
    return { bracket: "501–1000g", baseTariff: rateRow.upTo1000, additionalUnits: 0 };
  }
  if (weightGrams <= 1500) {
    return { bracket: "1001–1500g", baseTariff: rateRow.upTo1500, additionalUnits: 0 };
  }
  if (weightGrams <= 2000) {
    return { bracket: "1501–2000g", baseTariff: rateRow.upTo2000, additionalUnits: 0 };
  }

  const additionalUnits = additionalEmsSteps(weightGrams);
  return {
    bracket: `>2000g (+${additionalUnits} × 500g)`,
    baseTariff: rateRow.upTo2000,
    additionalUnits,
  };
}

export function calculateEMS({ countryCode, actualWeightGrams }) {
  const rateRow = getEmsRate(countryCode);
  const shared = {
    carrier: "ems",
    countryCode,
    countryName: rateRow?.countryName ?? null,
    actualWeightGrams,
  };

  if (!rateRow) {
    return unavailable(
      "EMS is not available for this destination according to the supplied tariff.",
      { ...shared, code: "EMS_DESTINATION" },
    );
  }

  const bracket = getEmsTariffBracket(actualWeightGrams, rateRow);
  const additionalCost = roundMoney(bracket.additionalUnits * rateRow.additional500);
  const finalCost = roundMoney(bracket.baseTariff + additionalCost);

  return {
    available: true,
    unavailableReason: null,
    code: null,
    ...shared,
    tariffBracket: bracket.bracket,
    baseTariff: bracket.baseTariff,
    additionalUnits: bracket.additionalUnits,
    additional500Rate: rateRow.additional500,
    additionalCost,
    finalCost,
    details: {
      actualWeightGrams,
      tariffBracket: bracket.bracket,
      rate: bracket.additionalUnits > 0 ? rateRow.upTo2000 : bracket.baseTariff,
      additionalUnits: bracket.additionalUnits,
      additional500Rate: rateRow.additional500,
      finalCost,
    },
  };
}
