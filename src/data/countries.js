import { emsRates } from "./emsRates.js";
import { novaRates } from "./novaRates.js";
import { NOVA_EU_COUNTRY_CODES } from "../constants/calculator.js";

const EXTRA_ALIASES = {
  AT: ["Austria", "AUSTRIA"],
  CZ: ["Cehia", "Czechia", "Czech Republic", "Czechia / Czech Republic"],
  EE: ["Estonia", "ESTONIA"],
  FR: ["Franța", "Franta", "France", "FRANŢA", "FRANTA"],
  DE: ["Germania", "Germany", "GERMANIA"],
  IT: ["Italia", "Italy", "ITALIA"],
  LT: ["Lituania", "Lithuania", "LITUANIA"],
  LV: ["Letonia", "Latvia", "LETONIA"],
  GB: ["Marea Britanie", "United Kingdom", "UK", "Great Britain", "Britain", "MAREA BRITANIE"],
  NL: ["Olanda", "Țările de Jos", "Tarile de Jos", "Netherlands", "Holland", "OLANDA", "ŢĂRILE DE JOS"],
  PL: ["Polonia", "Poland", "POLONIA"],
  SK: ["Slovacia", "Slovakia", "SLOVACIA"],
  ES: ["Spania", "Spain", "SPANIA"],
  HU: ["Ungaria", "Hungary", "UNGARIA"],
  US: [
    "Statele Unite ale Americii",
    "STATELE UNITE ALE AMERICII",
    "USA",
    "United States",
    "United States of America",
  ],
  BE: ["Belgia", "Belgium"],
  CH: ["Elveția", "Elvetia", "Switzerland"],
  RO: ["România", "Romania"],
  UA: ["Ucraina", "Ukraine"],
  CN: ["Chine", "China", "CHINE, BEIJING", "Beijing"],
  MO: ["Macao", "Macau", "CHINE, MACAO"],
  TW: ["Taiwan", "CHINE, TAIWAN"],
  HK: ["Hong-Kong", "Hong Kong"],
  KR: ["Coreea de Sud", "South Korea"],
  CI: ["Coasta de Fildeș", "Cote d'Ivoire", "Ivory Coast"],
  CD: ["Congo Kinshasa", "DRC", "Democratic Republic of the Congo"],
  CG: ["Congo Brazzaville", "Republic of the Congo"],
  MK: ["Macedonia", "North Macedonia"],
  IC: ["Canary Islands", "Insulele Canare", "Spain Canary Islands"],
  AE: ["Emiratele Arabe Unite", "UAE", "United Arab Emirates"],
};

const ROMANIAN_NAMES = {
  ZA: "Africa de Sud",
  AL: "Albania",
  DZ: "Algeria",
  AO: "Angola",
  SA: "Arabia Saudită",
  AR: "Argentina",
  AM: "Armenia",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaidjan",
  BH: "Bahrain",
  BD: "Bangladeș",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgia",
  BJ: "Benin",
  BO: "Bolivia",
  BA: "Bosnia și Herțegovina",
  BW: "Botswana",
  BR: "Brazilia",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  CM: "Camerun",
  CA: "Canada",
  CZ: "Cehia",
  CL: "Chile",
  CN: "China (Beijing)",
  MO: "China, Macao",
  TW: "China, Taiwan",
  TD: "Ciad",
  CY: "Cipru",
  CI: "Coasta de Fildeș",
  CO: "Columbia",
  CG: "Congo (Brazzaville)",
  CD: "Congo (Kinshasa)",
  KR: "Coreea de Sud",
  CR: "Costa Rica",
  HR: "Croația",
  CU: "Cuba",
  DK: "Danemarca",
  DJ: "Djibouti",
  DO: "Republica Dominicană",
  EC: "Ecuador",
  EG: "Egipt",
  SV: "El Salvador",
  CH: "Elveția",
  AE: "Emiratele Arabe Unite",
  EE: "Estonia",
  ET: "Etiopia",
  PH: "Filippine",
  FI: "Finlanda",
  FR: "Franța",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germania",
  GH: "Ghana",
  GR: "Grecia",
  GN: "Guineea",
  GQ: "Guineea Ecuatorială",
  HK: "Hong-Kong",
  IN: "India",
  ID: "Indonezia",
  JO: "Iordania",
  IR: "Iran",
  IE: "Irlanda",
  IS: "Islanda",
  IL: "Israel",
  IT: "Italia",
  JM: "Jamaica",
  JP: "Japonia",
  KZ: "Kazahstan",
  KE: "Kenya",
  KG: "Kîrghîzstan",
  KW: "Kuweit",
  LV: "Letonia",
  LB: "Liban",
  LT: "Lituania",
  LU: "Luxemburg",
  MK: "Macedonia",
  MG: "Madagascar",
  MY: "Malaezia",
  MW: "Malawi",
  MV: "Maldive",
  ML: "Mali",
  MT: "Malta",
  GB: "Marea Britanie",
  MA: "Maroc",
  MU: "Mauritius",
  MX: "Mexic",
  MN: "Mongolia",
  MZ: "Mozambic",
  ME: "Muntenegru",
  NA: "Namibia",
  NP: "Nepal",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NO: "Norvegia",
  NZ: "Noua Zeelandă",
  NL: "Olanda (Țările de Jos)",
  OM: "Oman",
  PK: "Pakistan",
  PA: "Panama",
  PY: "Paraguay",
  PE: "Peru",
  PL: "Polonia",
  PT: "Portugalia",
  QA: "Qatar",
  RO: "România",
  RU: "Rusia",
  RW: "Rwanda",
  SN: "Senegal",
  RS: "Serbia",
  SG: "Singapore",
  SK: "Slovacia",
  SI: "Slovenia",
  ES: "Spania",
  IC: "Spania — Insulele Canare",
  LK: "Sri Lanka",
  US: "Statele Unite ale Americii",
  SE: "Suedia",
  SZ: "Eswatini (Swaziland)",
  TJ: "Tadjîkistan",
  TZ: "Tanzania",
  TH: "Thailanda",
  TG: "Togo",
  TN: "Tunisia",
  TR: "Turcia",
  TM: "Turkmenistan",
  UA: "Ucraina",
  UG: "Uganda",
  HU: "Ungaria",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VE: "Venezuela",
  VN: "Vietnam",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};

const novaCodes = new Set(novaRates.map((row) => row.countryCode));
const euCodes = new Set(NOVA_EU_COUNTRY_CODES);

export const countries = emsRates
  .map((row) => {
    const aliases = new Set([
      row.countryName,
      row.countryCode,
      ROMANIAN_NAMES[row.countryCode],
      ...(EXTRA_ALIASES[row.countryCode] ?? []),
    ].filter(Boolean));

    return {
      code: row.countryCode,
      name: row.countryName,
      romanianName: ROMANIAN_NAMES[row.countryCode] ?? row.countryName,
      aliases: [...aliases],
      emsAvailable: true,
      novaAvailable: novaCodes.has(row.countryCode),
      novaEuCustoms: euCodes.has(row.countryCode),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export const countriesByCode = Object.fromEntries(
  countries.map((country) => [country.code, country]),
);

export function getCountry(countryCode) {
  return countriesByCode[countryCode] ?? null;
}

export function normalizeSearch(value) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function searchCountries(query) {
  const needle = normalizeSearch(query);
  if (!needle) return countries;
  return countries
    .filter((country) =>
      country.aliases.some((alias) => normalizeSearch(alias).includes(needle)),
    )
    .sort((a, b) => {
      const aExact = normalizeSearch(a.code) === needle;
      const bExact = normalizeSearch(b.code) === needle;
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aStarts = normalizeSearch(a.name).startsWith(needle);
      const bStarts = normalizeSearch(b.name).startsWith(needle);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.name.localeCompare(b.name, "en");
    });
}
