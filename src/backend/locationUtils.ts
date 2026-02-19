import { CalculationMethod } from "./types";

interface LocationLike {
  country?: string | null;
  city?: string | null;
}

export function getSuggestedCalculationMethod(location: LocationLike): CalculationMethod {
  const country = (location.country || "").toLowerCase().trim();
  const city = (location.city || "").toLowerCase().trim();

  if (city.includes("dubai")) return CalculationMethod.DUBAI;
  if (city.includes("makkah") || city.includes("mecca")) return CalculationMethod.MAKKAH;

  if (country.includes("saudi") || country.includes("arabia")) return CalculationMethod.MAKKAH;
  if (country.includes("egypt")) return CalculationMethod.EGYPT;
  if (country.includes("united states") || country.includes("usa") || country.includes("america")) {
    return CalculationMethod.ISNA;
  }
  if (country.includes("canada")) return CalculationMethod.ISNA;
  if (country.includes("pakistan")) return CalculationMethod.KARACHI;
  if (country.includes("iran")) return CalculationMethod.TEHRAN;
  if (country.includes("turkey")) return CalculationMethod.TURKEY;
  if (country.includes("france")) return CalculationMethod.FRANCE;
  if (country.includes("russia")) return CalculationMethod.RUSSIA;
  if (country.includes("kuwait")) return CalculationMethod.KUWAIT;
  if (country.includes("qatar")) return CalculationMethod.QATAR;
  if (country.includes("uae") || country.includes("emirates")) return CalculationMethod.GULF;
  if (country.includes("singapore")) return CalculationMethod.SINGAPORE;
  if (country.includes("malaysia")) return CalculationMethod.JAKIM;
  if (country.includes("indonesia")) return CalculationMethod.KEMENAG;
  if (country.includes("tunisia")) return CalculationMethod.TUNISIA;
  if (country.includes("algeria")) return CalculationMethod.ALGERIA;
  if (country.includes("morocco") || country.includes("maroc")) return CalculationMethod.MOROCCO;
  if (country.includes("portugal")) return CalculationMethod.PORTUGAL;

  return CalculationMethod.MWL;
}
