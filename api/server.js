import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const PORT = process.env.PORT || 4001;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "riseandvibe";
const AGENDA_CODE = process.env.AGENDA_CODE || "patiakh";

const ACTIVE_STATUSES = ["pending", "confirmed", "blocked"];
const ALL_STATUSES = ["pending", "confirmed", "blocked", "cancelled"];

const client = new MongoClient(MONGO_URL);
await client.connect();
const reservations = client.db(DB_NAME).collection("reservations");
await reservations.createIndex({ date: 1, start_time: 1 });

const app = express();
app.use(express.json());

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

app.post("/api/reservations", async (req, res) => {
  const b = req.body || {};
  if (!b.date || !b.start_time || !b.duration) {
    return res.status(400).json({ error: "date, start_time et duration sont requis" });
  }
  const doc = {
    service: b.service ?? null,
    service_id: b.service_id ?? null,
    sons: b.sons ?? null,
    date: String(b.date),
    start_time: String(b.start_time),
    duration: Number(b.duration),
    first_name: b.first_name ?? "",
    last_name: b.last_name ?? "",
    name: b.name || `${b.first_name || ""} ${b.last_name || ""}`.trim(),
    phone: b.phone ?? "",
    price: b.price ?? null,
    note: b.note ?? "",
    status: ALL_STATUSES.includes(b.status) ? b.status : "pending",
    created_at: new Date().toISOString(),
  };
  const { insertedId } = await reservations.insertOne(doc);
  broadcast();
  res.status(201).json(serialize({ _id: insertedId, ...doc }));
});

app.patch("/api/reservations/:id", async (req, res) => {
  if (req.get("x-agenda-code") !== AGENDA_CODE) {
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
