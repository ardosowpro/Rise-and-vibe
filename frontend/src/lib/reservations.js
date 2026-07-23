// Couche de données : réservations via l'API REST locale (même origine).
// Interface identique à l'originale : { getAll, getByDate, create, updateStatus, subscribe }.

const API = "/api/reservations";
const AGENDA_CODE_KEY = "rise_lab_agenda_code";

// Le code agenda saisi est mémorisé pour être envoyé avec les changements de statut
export function setAgendaCode(code) {
  localStorage.setItem(AGENDA_CODE_KEY, code);
}
export function getAgendaCode() {
  return localStorage.getItem(AGENDA_CODE_KEY) || "";
}
export function clearAgendaCode() {
  localStorage.removeItem(AGENDA_CODE_KEY);
}

// L'API stocke les champs tels quels (first_name, last_name, price, service_id…).
function toApi(r) {
  return {
    service: r.service ?? null,
    service_id: r.service_id ?? null,
    sons: r.sons ?? null,
    date: r.date,
    start_time: r.start_time,
    duration: r.duration,
    first_name: r.first_name ?? "",
    last_name: r.last_name ?? "",
    phone: r.phone ?? "",
    price: r.price ?? null,
    note: r.note ?? "",
    status: r.status || "pending",
  };
}

function fromApi(r) {
  return r;
}

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur API (${res.status})`);
  }
  return res.json();
}

export const reservationsApi = {
  // Toutes les réservations, triées par date puis heure (tri fait côté API, re-trié par sécurité)
  async getAll() {
    const data = await request(API);
    return data
      .map(fromApi)
      .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time));
  },

  // Réservations actives (pending / confirmed / blocked) d'une journée
  async getByDate(date) {
    const data = await request(`${API}?date=${encodeURIComponent(date)}`);
    return data.map(fromApi);
  },

  // Crée une réservation (statut "pending" par défaut côté API)
  async create(record) {
    const data = await request(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toApi(record)),
    });
    return fromApi(data);
  },

  // Change le statut ; nécessite le code agenda (403 sinon)
  async updateStatus(id, status) {
    await request(`${API}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Agenda-Code": getAgendaCode(),
      },
      body: JSON.stringify({ status }),
    });
  },

  // Abonnement temps réel via Server-Sent Events
  subscribe(cb) {
    const es = new EventSource(`${API}/stream`);
    es.onmessage = () => cb();
    return () => es.close();
  },
};

export default reservationsApi;
