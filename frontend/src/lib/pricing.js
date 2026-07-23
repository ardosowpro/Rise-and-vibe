import config from "../config.js";
import { todayStr } from "./format.js";

// Grille tarifaire active.
// Promo active ssi pricing.promoActive === true ET date locale du jour <= promoEndDate
// (la promo vaut toute la journée de fin, bascule automatique le lendemain).
export function getActivePricing() {
  const { pricing } = config;
  const isPromo =
    pricing.promoActive === true && todayStr() <= pricing.promoEndDate;
  const grid = isPromo ? pricing.promo : pricing.horsPromo;
  return {
    isPromo,
    label: grid.label,
    note: isPromo ? grid.note : null,
    endLabel: isPromo ? grid.endLabel : null,
    packages: grid.packages,
    hourlyRate: grid.hourlyRate,
    surDevis: pricing.surDevis,
  };
}

// Suffixe promo pour les messages WhatsApp : " (promo jusqu'au 20 août)"
export function promoSuffix(pricing = getActivePricing()) {
  return pricing.isPromo ? ` (promo ${pricing.endLabel.charAt(0).toLowerCase()}${pricing.endLabel.slice(1)})` : "";
}

export default getActivePricing;
