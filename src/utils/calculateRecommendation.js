import { roundMoney } from "./format.js";

export function calculateRecommendation(nova, ems) {
  const novaOk = Boolean(nova?.available && nova.finalCost != null);
  const emsOk = Boolean(ems?.available && ems.finalCost != null);

  if (!novaOk && !emsOk) {
    return {
      winner: null,
      winnerLabel: null,
      equal: false,
      savings: 0,
      savingsPercent: 0,
      novaUnavailable: true,
      emsUnavailable: true,
      message: "No valid carrier tariff could be calculated for this shipment.",
    };
  }

  if (!novaOk && emsOk) {
    return {
      winner: "ems",
      winnerLabel: "POȘTA MOLDOVEI EMS",
      equal: false,
      savings: 0,
      savingsPercent: 0,
      novaUnavailable: true,
      emsUnavailable: false,
      message: "Nova Post is not available for this destination according to the supplied tariff.",
      recommendedText: "Recommended carrier: POȘTA MOLDOVEI EMS",
    };
  }

  if (novaOk && !emsOk) {
    return {
      winner: "nova",
      winnerLabel: "NOVA POST",
      equal: false,
      savings: 0,
      savingsPercent: 0,
      novaUnavailable: false,
      emsUnavailable: true,
      message: "EMS is not available for this destination according to the supplied tariff.",
      recommendedText: "Recommended carrier: NOVA POST",
    };
  }

  const novaCost = roundMoney(nova.finalCost);
  const emsCost = roundMoney(ems.finalCost);

  if (novaCost === emsCost) {
    return {
      winner: null,
      winnerLabel: null,
      equal: true,
      savings: 0,
      savingsPercent: 0,
      finalCost: novaCost,
      novaUnavailable: false,
      emsUnavailable: false,
      message: "Both options have the same calculated cost.",
      recommendedText: "Both options have the same calculated cost.",
    };
  }

  if (novaCost < emsCost) {
    const savings = roundMoney(emsCost - novaCost);
    const savingsPercent = roundMoney((savings / emsCost) * 100);
    return {
      winner: "nova",
      winnerLabel: "NOVA POST",
      equal: false,
      savings,
      savingsPercent,
      novaUnavailable: false,
      emsUnavailable: false,
      recommendedText: "Recommended carrier: NOVA POST",
    };
  }

  const savings = roundMoney(novaCost - emsCost);
  const savingsPercent = roundMoney((savings / novaCost) * 100);
  return {
    winner: "ems",
    winnerLabel: "POȘTA MOLDOVEI EMS",
    equal: false,
    savings,
    savingsPercent,
    novaUnavailable: false,
    emsUnavailable: false,
    recommendedText: "Recommended carrier: POȘTA MOLDOVEI EMS",
  };
}
