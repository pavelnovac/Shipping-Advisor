export function parseNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const normalized = String(value).trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundKg(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function toKg(value, unit) {
  if (unit === "g") return roundKg(value / 1000);
  return roundKg(value);
}

export function toGrams(value, unit) {
  if (unit === "g") return Math.round(value);
  return Math.round(value * 1000);
}

export function formatKg(value, { unit = true } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = roundKg(value);
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return unit ? `${text} kg` : text;
}

export function formatGrams(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value)} g`;
}

export function formatMDL(value, { compact = false } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = roundMoney(value);
  if (compact && Number.isInteger(rounded)) {
    return `${rounded.toLocaleString("en-US")} MDL`;
  }
  return `${rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MDL`;
}

export function formatEUR(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `€${roundMoney(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${roundMoney(value).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
