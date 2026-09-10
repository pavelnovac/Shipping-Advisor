import { parseNumber } from "./format.js";

export function validateShipment(form) {
  const errors = {};
  const weight = parseNumber(form.weight);
  const length = parseNumber(form.length);
  const width = parseNumber(form.width);
  const height = parseNumber(form.height);
  const invoice = parseNumber(form.invoiceValue);
  const hs = parseNumber(form.uniqueHSCodes);

  if (!form.countryCode) {
    errors.countryCode = "Select a destination country.";
  }

  if (weight == null) {
    errors.weight = "Enter the actual parcel weight.";
  } else if (weight < 0) {
    errors.weight = "Weight cannot be negative.";
  } else if (weight === 0) {
    errors.weight = "Weight must be greater than 0.";
  }

  const dimValues = [form.length, form.width, form.height];
  const dimFilled = dimValues.filter((value) => String(value).trim() !== "");
  if (dimFilled.length > 0 && dimFilled.length < 3) {
    errors.dimensions = "Enter length, width and height to calculate volumetric weight.";
  } else if (dimFilled.length === 3) {
    if ([length, width, height].some((value) => value == null)) {
      errors.dimensions = "Dimensions must be valid numbers.";
    } else if ([length, width, height].some((value) => value < 0)) {
      errors.dimensions = "Dimensions cannot be negative.";
    } else if ([length, width, height].some((value) => value === 0)) {
      errors.dimensions = "Dimensions must be greater than 0.";
    }
  }

  if (invoice != null && invoice < 0) {
    errors.invoiceValue = "Invoice value cannot be negative.";
  }

  if (form.senderType === "juridical") {
    if (hs == null) {
      errors.uniqueHSCodes = "Enter the number of unique HS codes.";
    } else if (!Number.isInteger(hs)) {
      errors.uniqueHSCodes = "HS code count must be a whole number.";
    } else if (hs < 1) {
      errors.uniqueHSCodes = "HS code count must be at least 1.";
    }
  }

  if (form.invoiceCurrency !== "MDL" && form.invoiceCurrency !== "EUR") {
    errors.invoiceCurrency = "Choose MDL or EUR.";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: {
      weight,
      length,
      width,
      height,
      invoice: invoice ?? 0,
      hs: hs ?? 1,
    },
  };
}

export function validateSettings(settings) {
  const errors = {};
  const rate = parseNumber(settings.eurToMdl);
  if (rate == null || rate <= 0) {
    errors.eurToMdl = "Enter a valid EUR → MDL exchange rate greater than 0.";
  }
  return { ok: Object.keys(errors).length === 0, errors, eurToMdl: rate };
}
