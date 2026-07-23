import config from "../config.js";

// Formate un prix : 15 000 FCFA
export function formatPrice(value, withCurrency = true) {
  const n = new Intl.NumberFormat("fr-FR").format(value);
  return withCurrency ? `${n} ${config.currency}` : n;
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value) ? null : value;
  const parts = String(value).split("-").map(Number);
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const date = new Date(value);
  return isNaN(date) ? null : date;
}

// "lundi 3 mars"
export function formatDateShort(value) {
  const d = toDate(value);
  return d
    ? new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(d)
    : "";
}

// "lundi 3 mars 2026"
export function formatDateLong(value) {
  const d = toDate(value);
  return d
    ? new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d)
    : "";
}

// Date du jour au format YYYY-MM-DD
export function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Le service est-il tarifé "par sons" (promo voix) ?
export function isVoicePromo(service) {
  return service?.pricing === "sons";
}

export function promoPrice(sons) {
  return config.voicePromo.prices[sons] ?? null;
}

export function promoMaxSons() {
  return config.voicePromo.maxSons;
}

export function promoSonsOptions() {
  return Object.keys(config.voicePromo.prices)
    .map(Number)
    .sort((a, b) => a - b);
}

export function promoMinPrice() {
  return Math.min(...Object.values(config.voicePromo.prices));
}

export function priceLabel(service) {
  return isVoicePromo(service) ? `Promo dès ${formatPrice(promoMinPrice())}` : "Sur devis";
}
