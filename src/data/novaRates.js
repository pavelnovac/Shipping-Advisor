export const novaMeta = {
  carrier: "Nova Post",
  source: "MD_EU - EU_MD for business (Nova Post Moldova international business tariffs)",
  validFrom: "2026-06-01",
  currency: "MDL",
  lastUpdated: "2026-09-10",
  notes:
    "Rates include VAT. Billable weight is the greater of actual weight and volumetric weight (L × W × H / 5000).",
};

/**
 * Nova Post international outbound tariffs from Moldova.
 * `upTo20` / `upTo30` may be null when the source table does not publish that bracket.
 * Do not invent missing brackets.
 */
export const novaRates = [
  { countryCode: "AT", countryName: "Austria", documents: 220, upTo2: 342, upTo5: 492, upTo10: 758, upTo20: 1257, upTo30: 1855, additionalKg: 60 },
  { countryCode: "CZ", countryName: "Czechia", documents: 218, upTo2: 345, upTo5: 490, upTo10: 700, upTo20: 1219, upTo30: 1817, additionalKg: 60 },
  { countryCode: "EE", countryName: "Estonia", documents: 239, upTo2: 371, upTo5: 502, upTo10: 768, upTo20: 1250, upTo30: 1848, additionalKg: 65 },
  { countryCode: "FR", countryName: "France", documents: 310, upTo2: 488, upTo5: 646, upTo10: 901, upTo20: 1511, upTo30: 2110, additionalKg: 65 },
  { countryCode: "DE", countryName: "Germany", documents: 196, upTo2: 353, upTo5: 484, upTo10: 751, upTo20: 1284, upTo30: 1882, additionalKg: 50 },
  { countryCode: "IT", countryName: "Italy", documents: 279, upTo2: 433, upTo5: 603, upTo10: 869, upTo20: 1401, upTo30: 1999, additionalKg: 60 },
  { countryCode: "LT", countryName: "Lithuania", documents: 240, upTo2: 366, upTo5: 497, upTo10: 763, upTo20: 1245, upTo30: 1843, additionalKg: 75 },
  { countryCode: "LV", countryName: "Latvia", documents: 240, upTo2: 372, upTo5: 502, upTo10: 769, upTo20: 1251, upTo30: 1849, additionalKg: 65 },
  { countryCode: "GB", countryName: "United Kingdom", documents: 348, upTo2: 494, upTo5: 658, upTo10: 924, upTo20: 1601, upTo30: 2200, additionalKg: 100 },
  { countryCode: "NL", countryName: "Netherlands", documents: 280, upTo2: 426, upTo5: 579, upTo10: 849, upTo20: 1436, upTo30: 2034, additionalKg: 70 },
  { countryCode: "PL", countryName: "Poland", documents: 198, upTo2: 325, upTo5: 455, upTo10: 721, upTo20: 1173, upTo30: 1772, additionalKg: 55 },
  { countryCode: "SK", countryName: "Slovakia", documents: 220, upTo2: 342, upTo5: 492, upTo10: 708, upTo20: 1257, upTo30: 1855, additionalKg: 60 },
  { countryCode: "ES", countryName: "Spain", documents: 248, upTo2: 388, upTo5: 569, upTo10: 836, upTo20: 1436, upTo30: 2034, additionalKg: 65 },
  { countryCode: "HU", countryName: "Hungary", documents: 210, upTo2: 334, upTo5: 467, upTo10: 733, upTo20: 1220, upTo30: 1819, additionalKg: 60 },
  { countryCode: "US", countryName: "United States", documents: 400, upTo2: 525, upTo5: 1995, upTo10: 1995, upTo20: null, upTo30: null, additionalKg: 230 },
];

export const novaRatesByCode = Object.fromEntries(
  novaRates.map((row) => [row.countryCode, row]),
);

export function getNovaRate(countryCode) {
  return novaRatesByCode[countryCode] ?? null;
}
