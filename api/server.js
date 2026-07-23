import express from "express";
import { timingSafeEqual } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

const PORT = process.env.PORT || 4001;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "riseandvibe";
const AGENDA_CODE = process.env.AGENDA_CODE || "patiakh";

const ACTIVE_STATUSES = ["pending", "confirmed", "blocked"];
const ALL_STATUSES = ["pending", "confirmed", "blocked", "cancelled", "rejected"];

const client = new MongoClient(MONGO_URL);
await client.connect();
const reservations = client.db(DB_NAME).collection("reservations");
await reservations.createIndex({ date: 1, start_time: 1 });

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

// --- Limitation de débit simple (par IP, fenêtre glissante en mémoire) ---
const rlBuckets = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
    const key = `${req.method} ${req.path.split("/").slice(0, 3).join("/")} ${ip}`;
    const now = Date.now();
    const hits = (rlBuckets.get(key) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      return res.status(429).json({ error: "Trop de requêtes, réessaie dans un instant." });
    }
    hits.push(now);
    rlBuckets.set(key, hits);
    next();
  };
}
// Nettoyage périodique des compteurs
setInterval(() => {
  const now = Date.now();
  for (const [k, hits] of rlBuckets) {
    if (!hits.some((t) => now - t < 3600000)) rlBuckets.delete(k);
  }
}, 600000).unref();

// Chaîne courte et saine (tronque et retire les caractères de contrôle)
function clean(v, max = 200) {
  return String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

// --- Server-Sent Events : notifie les clients à chaque changement ---
const sseClients = new Set();
function broadcast() {
  for (const res of sseClients) res.write("data: change\n\n");
}

app.get("/api/reservations/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("data: connected\n\n");
  sseClients.add(res);
  const ping = setInterval(() => res.write(": ping\n\n"), 25000);
  req.on("close", () => {
    clearInterval(ping);
    sseClients.delete(res);
  });
});

function serialize(doc) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

app.get("/api/reservations", async (req, res) => {
  const { date } = req.query;
  const filter = date ? { date, status: { $in: ACTIVE_STATUSES } } : {};
  const docs = await reservations
    .find(filter)
    .sort({ date: 1, start_time: 1 })
    .toArray();
  res.json(docs.map(serialize));
});

app.post("/api/reservations", rateLimit(10, 60000), async (req, res) => {
  const b = req.body || {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || "") || !/^\d{1,2}:\d{2}$/.test(b.start_time || "")) {
    return res.status(400).json({ error: "date ou heure invalide" });
  }
  const duration = Number(b.duration);
  if (!Number.isInteger(duration) || duration < 1 || duration > 12) {
    return res.status(400).json({ error: "durée invalide" });
  }
  const doc = {
    service: b.service == null ? null : clean(b.service, 120),
    service_id: b.service_id == null ? null : clean(b.service_id, 40),
    sons: b.sons == null ? null : Math.max(0, Math.min(99, Number(b.sons) || 0)),
    date: clean(b.date, 10),
    start_time: clean(b.start_time, 5),
    duration,
    first_name: clean(b.first_name, 80),
    last_name: clean(b.last_name, 80),
    name: clean(b.name, 160) || `${clean(b.first_name, 80)} ${clean(b.last_name, 80)}`.trim(),
    phone: clean(b.phone, 30),
    price: b.price == null ? null : Math.max(0, Math.min(10000000, Number(b.price) || 0)),
    note: clean(b.note, 500),
    status: ALL_STATUSES.includes(b.status) ? b.status : "pending",
    created_at: new Date().toISOString(),
  };
  const { insertedId } = await reservations.insertOne(doc);
  broadcast();
  res.status(201).json(serialize({ _id: insertedId, ...doc }));
});

// Comparaison à temps constant (évite les attaques par chronométrage)
function codeOk(given) {
  const a = Buffer.from(String(given ?? ""));
  const b = Buffer.from(AGENDA_CODE);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Vérification du code agenda côté serveur (le code n'apparaît plus dans le JS public)
app.post("/api/agenda/verify", rateLimit(5, 60000), (req, res) => {
  if (!codeOk(req.body?.code)) {
    return res.status(403).json({ ok: false });
  }
  res.json({ ok: true });
});

app.patch("/api/reservations/:id", rateLimit(30, 60000), async (req, res) => {
  if (!codeOk(req.get("x-agenda-code"))) {
    return res.status(403).json({ error: "code agenda invalide" });
  }
  const { status } = req.body || {};
  if (!ALL_STATUSES.includes(status)) {
    return res.status(400).json({ error: "statut invalide" });
  }
  let _id;
  try {
    _id = new ObjectId(req.params.id);
  } catch {
    return res.status(400).json({ error: "id invalide" });
  }
  const { matchedCount } = await reservations.updateOne({ _id }, { $set: { status } });
  if (!matchedCount) return res.status(404).json({ error: "réservation introuvable" });
  broadcast();
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`riseandvibe-api en écoute sur 127.0.0.1:${PORT}`);
});
