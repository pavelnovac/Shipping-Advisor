import {
  VOLUMETRIC_DIVISOR,
  NOVA_MAX_GIRTH_CM,
  NOVA_MAX_SIDE_CM,
} from "../constants/calculator.js";
import { roundKg } from "./format.js";

export function calculateVolumetricWeightKg(lengthCm, widthCm, heightCm) {
  if (![lengthCm, widthCm, heightCm].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  return roundKg((lengthCm * widthCm * heightCm) / VOLUMETRIC_DIVISOR);
}

export function billableWeightNova(actualWeightKg, volumetricWeightKg) {
  if (actualWeightKg == null || volumetricWeightKg == null) return null;
  return roundKg(Math.max(actualWeightKg, volumetricWeightKg));
}

export function novaDimensionWarning(lengthCm, widthCm, heightCm) {
  if (![lengthCm, widthCm, heightCm].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  const sides = [lengthCm, widthCm, heightCm];
  const maxSide = Math.max(...sides);
  const girth = sides.reduce((sum, side) => sum + side, 0);
  if (maxSide > NOVA_MAX_SIDE_CM || girth > NOVA_MAX_GIRTH_CM) {
    return "Nova Post lists a maximum of 1.5 m on any side and 3 m for the sum of dimensions.";
  }
  return null;
}
