import config from "../config.js";

function hourOf(time) {
  const [h] = String(time).split(":").map(Number);
  return h;
}

// Liste des heures de début possibles (ouverture → fermeture - durée minimale)
export function startSlots() {
  const open = hourOf(config.hours.open);
  const close = hourOf(config.hours.close);
  const min = config.minDurationHours;
  const slots = [];
  for (let h = open; h <= close - min; h++) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

// "14:00" → "14h00"
export function formatHour(time) {
  const [h, m] = String(time).split(":");
  return `${Number(h)}h${m}`;
}

// Lien WhatsApp pré-rempli
export function whatsappLink(message) {
  return `https://wa.me/${String(config.whatsappNumber).replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

export function whatsappInfoLink() {
  return whatsappLink(`Salut ${config.studioName} ! J'aimerais avoir plus d'informations.`);
}

// --- Créneaux occupés ---

export function slotHour(time) {
  return parseInt(String(time).split(":")[0], 10);
}

// Ensemble des heures occupées par une liste de réservations
export function occupiedHours(reservations) {
  const set = new Set();
  for (const r of reservations) {
    const start = slotHour(r.start_time);
    for (let h = start; h < start + r.duration; h++) set.add(h);
  }
  return set;
}

// Le créneau est-il libre ?
export function isSlotFree(time, occupied) {
  return !occupied.has(slotHour(time));
}

// Durée maximale possible à partir d'un créneau (plafonnée à 8h)
export function maxDurationFrom(time, occupied, closeHour) {
  const start = slotHour(time);
  let n = 0;
  for (let h = start; h < closeHour && n < 8 && !occupied.has(h); h++) n++;
  return n;
}
