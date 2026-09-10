import { formatGrams, formatKg, formatMDL } from "./format.js";

export function explainRecommendation({ nova, ems, recommendation }) {
  if (!nova?.available && ems?.available) {
    const dimensionBlocked = nova?.code === "NOVA_DIMENSIONS";
    if (dimensionBlocked) {
      return `EMS is the available option at ${formatMDL(ems.finalCost)}. Nova Post cannot be compared until parcel dimensions are entered.`;
    }
    if (nova?.code === "NOVA_WEIGHT") {
      return `EMS is recommended at ${formatMDL(ems.finalCost)}. Nova Post has no published tariff for this billable weight.`;
    }
    return `Nova Post is not available for this destination according to the supplied tariff. EMS is the available option at ${formatMDL(ems.finalCost)}.`;
  }

  if (nova?.available && !ems?.available) {
    return `EMS is not available for this destination according to the supplied tariff. Nova Post is the available option at ${formatMDL(nova.finalCost)}.`;
  }

  if (!nova?.available && !ems?.available) {
    return "Neither carrier has a usable tariff for this shipment with the data entered.";
  }

  if (recommendation.equal) {
    return `Both options have the same calculated final cost of ${formatMDL(recommendation.finalCost)}.`;
  }

  const volumetricHigher =
    nova.volumetricWeightKg != null && nova.volumetricWeightKg > nova.actualWeightKg + 0.0005;
  const extraParts = [];
  if (nova.declaredValueFee > 0) extraParts.push("declared-value commission");
  if (nova.hsFeeMDL > 0) extraParts.push("EU customs/HS fee");
  if (nova.usaFee > 0) extraParts.push("USA invoice surcharge");

  if (recommendation.winner === "nova") {
    let text = `Nova Post is cheaper by ${formatMDL(recommendation.savings)}.`;
    if (volumetricHigher) {
      text += ` Although its billable weight is ${formatKg(nova.billableWeightKg)} because of volumetric weight, its final cost remains lower than EMS.`;
    } else {
      text += " Its final cost, including applicable extra fees, is lower than EMS based on actual weight.";
    }
    return text;
  }

  let text = `EMS is cheaper by ${formatMDL(recommendation.savings)}.`;
  if (volumetricHigher) {
    text += ` Nova Post's volumetric weight increases the shipment from ${formatKg(nova.actualWeightKg)} actual weight to ${formatKg(nova.billableWeightKg)} billable weight.`;
  } else {
    text += ` Using actual weight (${formatGrams(ems.actualWeightGrams)}), the EMS tariff is lower than Nova Post's final cost.`;
  }
  if (extraParts.length) {
    text += ` Extra Nova charges (${extraParts.join(", ")}) are included in the comparison.`;
  }
  return text;
}

export function collectWarnings({ nova, ems, form, settings }) {
  const warnings = [];

  if (nova?.code === "NOVA_DESTINATION" || (!nova?.available && nova?.code === "NOVA_DESTINATION")) {
    warnings.push({
      tone: "warn",
      text: "Nova Post is not available for this destination according to the supplied tariff.",
    });
  }

  if (nova?.code === "NOVA_DIMENSIONS") {
    warnings.push({
      tone: "warn",
      text: "Enter parcel dimensions to calculate Nova Post accurately.",
    });
  }

  if (nova?.code === "NOVA_WEIGHT") {
    warnings.push({
      tone: "warn",
      text: "Tariff unavailable for this weight",
    });
  }

  if (ems?.available) {
    warnings.push({
      tone: "info",
      text: "No EMS volumetric-weight formula was provided in the tariff document, therefore EMS is calculated using actual weight.",
    });
  }

  if (nova?.available && nova.volumetricWeightKg > nova.actualWeightKg + 0.0005) {
    warnings.push({
      tone: "warn",
      text: "Volumetric weight is higher than actual weight.",
    });
    warnings.push({
      tone: "warn",
      text: `Nova Post will charge this parcel as ${formatKg(nova.billableWeightKg)}.`,
    });
  }

  if (
    form.senderType === "juridical" &&
    nova?.hsApplicable &&
    settings.includeHsFee &&
    form.uniqueHSCodes >= 1
  ) {
    const euros = form.uniqueHSCodes * 3;
    warnings.push({
      tone: "info",
      text: `This shipment contains ${form.uniqueHSCodes} HS code${form.uniqueHSCodes === 1 ? "" : "s"}, therefore Nova customs clearance adds €${euros}.`,
    });
  }

  if (form.senderType === "juridical" && form.countryCode === "US" && settings.includeUsaSurcharge) {
    warnings.push({
      tone: "warn",
      text: "For USA, Nova Post adds 15% of invoice value.",
    });
  }

  if (nova?.dimensionWarning) {
    warnings.push({ tone: "warn", text: nova.dimensionWarning });
  }

  if (form.shipmentType === "documents" && nova?.available) {
    warnings.push({
      tone: "info",
      text: "Nova Post documents tariff is applied as a published documents rate, separate from the parcel weight brackets.",
    });
  }

  return warnings;
}
