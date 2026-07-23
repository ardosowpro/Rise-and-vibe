// Utilitaires de dates (format YYYY-MM-DD) pour le calendrier de l'agenda

export function parseDay(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function toDayStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Ajoute n jours
export function addDays(day, n) {
  const d = parseDay(day);
  d.setDate(d.getDate() + n);
  return toDayStr(d);
}

// Lundi de la semaine du jour donné
export function weekStart(day) {
  const d = parseDay(day);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toDayStr(d);
}

// Les 7 jours de la semaine
export function weekDays(day) {
  const start = weekStart(day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Grille 6 semaines du mois
export function monthGrid(day) {
  const d = parseDay(day);
  const first = toDayStr(new Date(d.getFullYear(), d.getMonth(), 1, 12));
  let cursor = weekStart(first);
  const weeks = [];
  for (let i = 0; i < 6; i++) {
    weeks.push(Array.from({ length: 7 }, (_, j) => addDays(cursor, j)));
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

// Ajoute n mois (en conservant le jour si possible)
export function addMonths(day, n) {
  const d = parseDay(day);
  const dayOfMonth = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dayOfMonth, last));
  return toDayStr(d);
}

export function monthKey(day) {
  return day.slice(0, 7);
}

export function formatMonth(day) {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(parseDay(day));
}

export function formatWeekday(day) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(parseDay(day));
}

export function dayNumber(day) {
  return parseDay(day).getDate();
}
