export const VOLUMETRIC_DIVISOR = 5000;

export const DEFAULT_EUR_TO_MDL = 19.5;

export const DECLARED_VALUE_THRESHOLD_MDL = 500;
export const DECLARED_VALUE_RATE = 0.005;

export const HS_FEE_EUR_PER_CODE = 3;
export const USA_INVOICE_SURCHARGE_RATE = 0.15;

export const EMS_BASE_GRAMS = 2000;
export const EMS_STEP_GRAMS = 500;

export const NOVA_MAX_SIDE_CM = 150;
export const NOVA_MAX_GIRTH_CM = 300;

export const HISTORY_LIMIT = 50;

export const STORAGE_KEYS = {
  SETTINGS: "laforma.calculator.settings",
  HISTORY: "laforma.calculator.history",
};

export const NOVA_EU_COUNTRY_CODES = [
  "AT",
  "CZ",
  "EE",
  "FR",
  "DE",
  "IT",
  "LT",
  "LV",
  "NL",
  "PL",
  "SK",
  "ES",
  "HU",
];

export const DEFAULT_SETTINGS = {
  eurToMdl: DEFAULT_EUR_TO_MDL,
  includeDeclaredValueFee: true,
  includeHsFee: true,
  includeUsaSurcharge: true,
};

export const EMPTY_FORM = {
  countryCode: "",
  weight: "780",
  weightUnit: "g",
  length: "39",
  width: "25",
  height: "23",
  invoiceValue: "95",
  invoiceCurrency: "EUR",
  uniqueHSCodes: 1,
  shipmentType: "parcel",
};
