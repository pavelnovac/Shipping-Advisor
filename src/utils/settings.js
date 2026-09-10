import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../constants/calculator.js";

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

export function loadSettings() {
  if (!canUseStorage()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      eurToMdl: Number(parsed.eurToMdl) > 0 ? Number(parsed.eurToMdl) : DEFAULT_SETTINGS.eurToMdl,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function persistSettings(settings) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
