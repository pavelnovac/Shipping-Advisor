import { getCountry } from "../data/countries.js";
import { formatGrams, formatKg, formatMDL } from "./format.js";

export function buildCopyText({ form, result }) {
  const country = getCountry(form.countryCode);
  const nova = result.nova;
  const ems = result.ems;
  const recommendation = result.recommendation;
  const dims =
    form.length && form.width && form.height
      ? `${form.length} × ${form.width} × ${form.height} cm`
      : "not entered";

  const weightText =
    form.weightUnit === "g"
      ? formatGrams(result.actualWeightGrams)
      : formatKg(result.actualWeightKg);

  const recommended = recommendation.equal
    ? "Both carriers equal"
    : recommendation.winner === "nova"
      ? "Nova Post"
      : recommendation.winner === "ems"
        ? "Poșta Moldovei EMS"
        : "None";

  const lines = [
    "Shipping calculation",
    country?.name ?? form.countryCode,
    "",
    `Weight: ${weightText}`,
    `Dimensions: ${dims}`,
    "",
    `Nova Post: ${nova?.available ? formatMDL(nova.finalCost, { compact: true }) : "unavailable"}`,
    `EMS: ${ems?.available ? formatMDL(ems.finalCost, { compact: true }) : "unavailable"}`,
    "",
    `Recommended: ${recommended}`,
  ];

  if (recommendation.savings > 0) {
    lines.push(`Savings: ${formatMDL(recommendation.savings, { compact: true })}`);
  }

  return lines.join("\n");
}
