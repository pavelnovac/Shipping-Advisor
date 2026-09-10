import { calculateEMS } from "./calculateEMS.js";
import { calculateNova } from "./calculateNova.js";
import { calculateRecommendation } from "./calculateRecommendation.js";
import { collectWarnings, explainRecommendation } from "./explain.js";
import { parseNumber, toGrams, toKg } from "./format.js";
import { validateSettings, validateShipment } from "./validate.js";

export function calculateShipment(form, settings) {
  const shipment = validateShipment(form);
  const settingsCheck = validateSettings(settings);

  if (!shipment.ok || !settingsCheck.ok) {
    return {
      ok: false,
      errors: { ...shipment.errors, ...settingsCheck.errors },
      nova: null,
      ems: null,
      recommendation: null,
      explanation: null,
      warnings: [],
    };
  }

  const actualWeightKg = toKg(shipment.values.weight, form.weightUnit);
  const actualWeightGrams = toGrams(shipment.values.weight, form.weightUnit);
  const lengthCm = shipment.values.length;
  const widthCm = shipment.values.width;
  const heightCm = shipment.values.height;

  const nova = calculateNova({
    countryCode: form.countryCode,
    actualWeightKg,
    lengthCm,
    widthCm,
    heightCm,
    invoiceValue: shipment.values.invoice,
    invoiceCurrency: form.invoiceCurrency,
    uniqueHSCodes: shipment.values.hs,
    shipmentType: form.shipmentType,
    senderType: form.senderType ?? "physical",
    eurToMdl: settingsCheck.eurToMdl,
    includeDeclaredValueFee: settings.includeDeclaredValueFee,
    includeHsFee: settings.includeHsFee,
    includeUsaSurcharge: settings.includeUsaSurcharge,
  });

  const ems = calculateEMS({
    countryCode: form.countryCode,
    actualWeightGrams,
  });

  const recommendation = calculateRecommendation(nova, ems);
  const explanation = explainRecommendation({ nova, ems, recommendation });
  const warnings = collectWarnings({ nova, ems, form, settings });

  return {
    ok: true,
    errors: {},
    nova,
    ems,
    recommendation,
    explanation,
    warnings,
    actualWeightKg,
    actualWeightGrams,
    lengthCm: lengthCm ?? null,
    widthCm: widthCm ?? null,
    heightCm: heightCm ?? null,
    invoiceValueMDL: parseNumber(nova.invoiceValueMDL) ?? 0,
  };
}
