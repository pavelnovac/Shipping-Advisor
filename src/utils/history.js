import { HISTORY_LIMIT, STORAGE_KEYS } from "../constants/calculator.js";

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

export function loadHistory() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveHistory(items) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    STORAGE_KEYS.HISTORY,
    JSON.stringify(items.slice(0, HISTORY_LIMIT)),
  );
}

export function historyEntryFromCalculation({ form, result, settings }) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    form: { ...form },
    settingsSnapshot: {
      eurToMdl: settings.eurToMdl,
      includeDeclaredValueFee: settings.includeDeclaredValueFee,
      includeHsFee: settings.includeHsFee,
      includeUsaSurcharge: settings.includeUsaSurcharge,
    },
    country: form.countryCode,
    weight: form.weight,
    weightUnit: form.weightUnit,
    dimensions: {
      length: form.length,
      width: form.width,
      height: form.height,
    },
    invoiceValue: form.invoiceValue,
    invoiceCurrency: form.invoiceCurrency,
    uniqueHSCodes: form.uniqueHSCodes,
    emsFinal: result.ems?.available ? result.ems.finalCost : null,
    novaFinal: result.nova?.available ? result.nova.finalCost : null,
    recommendedCarrier: result.recommendation.winner,
    savings: result.recommendation.savings,
  };
}
