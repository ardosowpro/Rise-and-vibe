import { useEffect, useMemo, useState } from "react";
import config from "../config.js";
import { ClockIcon, CheckIcon, PlusIcon, CloseIcon } from "../components/icons.jsx";
import reservationsApi, { setAgendaCode, clearAgendaCode } from "../lib/reservations.js";
import { todayStr, formatDateShort, formatDateLong, formatPrice } from "../lib/format.js";
import { formatHour } from "../lib/booking.js";
import {
  addDays,
  addMonths,
  weekDays,
  monthGrid,
  monthKey,
  formatMonth,
  formatWeekday,
  dayNumber,
} from "../lib/dates.js";

const OPEN_HOUR = parseInt(config.hours.open.split(":")[0], 10);
const CLOSE_HOUR = parseInt(config.hours.close.split(":")[0], 10);
const HOUR_PX = 64;
const UNLOCK_KEY = "rise_lab_agenda_unlocked";

const STATUS_STYLES = {
  pending: {
    label: "En attente",
    chip: "bg-amber-400/20 text-amber-200",
    block: "border border-dashed border-amber-400/60 bg-amber-400/10",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmé",
    chip: "bg-accent/20 text-accent-bright",
    block: "border border-accent/50 bg-accent/15",
    dot: "bg-accent",
  },
  blocked: {
    label: "Bloqué",
    chip: "bg-white/10 text-white/60",
    block: "border border-white/15 bg-white/[0.06]",
    dot: "bg-white/50",
  },
};
const VISIBLE_STATUSES = ["pending", "confirmed", "blocked"];

function displayName(r) {
  return r.status === "blocked"
    ? (r.service || "").trim() || "Bloqué"
    : `${r.first_name || ""} ${r.last_name || ""}`.trim() || r.service || "-";
}

export default function Agenda() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(UNLOCK_KEY) === "1");
  return unlocked ? (
    <AgendaBoard
      onLock={() => {
        localStorage.removeItem(UNLOCK_KEY);
        clearAgendaCode();
        setUnlocked(false);
      }}
    />
  ) : (
    <LockScreen onUnlock={() => setUnlocked(true)} />
  );
}

function LockScreen({ onUnlock }) {
  const [code, setCode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);
  // Le code est vérifié par le serveur : il n'apparaît nulle part dans le JS public
  const submit = async (e) => {
    e.preventDefault();
    setChecking(true);
    try {
      const res = await fetch("/api/agenda/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        localStorage.setItem(UNLOCK_KEY, "1");
        setAgendaCode(code.trim());
        onUnlock();
      } else {
        setWrong(true);
      }
    } catch {
      setWrong(true);
    } finally {
      setChecking(false);
    }
  };
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-ink-950 px-6">
      <div className="w-full max-w-xs text-center">
        <p className="eyebrow">Espace ingénieurs</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Agenda {config.studioName}</h1>
        <p className="mt-2 text-sm text-white/50">
          Entre le code d'accès pour voir les demandes et les créneaux.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setWrong(false);
            }}
            placeholder="Code d'accès"
            aria-label="Code d'accès"
            autoFocus
            className="w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-3.5 text-center text-white outline-none placeholder:text-white/30 focus:border-accent"
          />
          {wrong && <p className="text-sm text-red-400">Code incorrect.</p>}
          <button
            type="submit"
            className="min-h-[48px] w-full rounded-2xl bg-accent font-semibold text-white shadow-glow transition-all hover:bg-accent-bright active:scale-[0.98]"
          >
            Entrer
          </button>
        </form>
        <a href="/" className="mt-6 inline-block text-sm text-white/40 hover:text-white/70">
          ← Retour au site
        </a>
      </div>
    </div>
  );
}

function AgendaBoard({ onLock }) {
  const [items, setItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => todayStr());
  const [view, setView] = useState("day");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      setItems(await reservationsApi.getAll());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return reservationsApi.subscribe(load);
  }, []);

  const byDate = useMemo(() => {
    const map = {};
    for (const r of items) {
      if (VISIBLE_STATUSES.includes(r.status)) (map[r.date] ||= []).push(r);
    }
    for (const d of Object.keys(map)) {
      map[d].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [items]);

  const pendings = useMemo(
    () =>
      items
        .filter((r) => r.status === "pending" && r.date >= todayStr())
        .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time)),
    [items]
  );

  const setStatus = (id, status) => reservationsApi.updateStatus(id, status).then(load);
  const openDay = (d) => {
    setSelectedDate(d);
    setView("day");
  };
  const prev = () =>
    setSelectedDate((d) => (view === "month" ? addMonths(d, -1) : addDays(d, view === "week" ? -7 : -1)));
  const next = () =>
    setSelectedDate((d) => (view === "month" ? addMonths(d, 1) : addDays(d, view === "week" ? 7 : 1)));
  const heading = () => {
    if (view === "month") return formatMonth(selectedDate);
    if (view === "week") {
      const days = weekDays(selectedDate);
      return `${dayNumber(days[0])} – ${dayNumber(days[6])} ${formatMonth(days[6])}`;
    }
    return formatDateLong(selectedDate);
  };

  return (
    <div className="min-h-[100dvh] bg-ink-950 pb-16">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-ink-900/90 px-5 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Espace ingénieurs</p>
            <h1 className="text-lg font-bold text-white">Agenda</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-accent px-3 font-semibold text-white shadow-glow-sm transition-all hover:bg-accent-bright active:scale-95"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter
            </button>
            <button
              onClick={onLock}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              Verrouiller
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-2xl space-y-8 px-5 pt-6">
        {loading ? (
          <p className="text-sm text-white/50">Chargement…</p>
        ) : (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Demandes en attente</h2>
                {pendings.length > 0 && (
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200">
                    {pendings.length}
                  </span>
                )}
              </div>
              {pendings.length === 0 ? (
                <p className="text-sm text-white/40">Aucune demande en attente.</p>
              ) : (
                <div className="space-y-3">
                  {pendings.map((r) => (
                    <PendingCard
                      key={r.id}
                      r={r}
                      onValidate={() => setStatus(r.id, "confirmed")}
                      onReject={() => setStatus(r.id, "rejected")}
                      onOpenDay={() => openDay(r.date)}
                    />
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">Calendrier</h2>
                <ViewSwitch view={view} setView={setView} />
              </div>
              <div className="flex items-center gap-2">
                <NavButton label="Précédent" onClick={prev}>
                  ‹
                </NavButton>
                <div className="flex-1 text-center">
                  <p className="text-sm font-medium capitalize text-white">{heading()}</p>
                  {selectedDate !== todayStr() && (
                    <button
                      onClick={() => setSelectedDate(todayStr())}
                      className="text-xs text-accent-bright hover:underline"
                    >
                      Aujourd'hui
                    </button>
                  )}
                </div>
                <NavButton label="Suivant" onClick={next}>
                  ›
                </NavButton>
              </div>
              {view === "day" && (
                <DayView
                  date={selectedDate}
                  items={byDate[selectedDate] || []}
                  onValidate={(id) => setStatus(id, "confirmed")}
                  onReject={(id) => setStatus(id, "rejected")}
                />
              )}
              {view === "week" && (
                <WeekView selectedDate={selectedDate} byDate={byDate} onOpenDay={openDay} />
              )}
              {view === "month" && (
                <MonthView selectedDate={selectedDate} byDate={byDate} onOpenDay={openDay} />
              )}
              <Legend />
            </section>
          </>
        )}
      </div>
      {showAdd && (
        <AddModal
          defaultDate={selectedDate}
          onClose={() => setShowAdd(false)}
          onSaved={(d) => {
            setShowAdd(false);
            load();
            openDay(d);
          }}
        />
      )}
    </div>
  );
}

function NavButton({ children, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-lg text-white/70 hover:border-white/25"
    >
      {children}
    </button>
  );
}

function ViewSwitch({ view, setView }) {
  const options = [
    ["day", "Jour"],
    ["week", "Semaine"],
    ["month", "Mois"],
  ];
  return (
    <div className="flex rounded-xl border border-white/10 bg-ink-800 p-0.5">
      {options.map(([value, label]) => (
        <button
          key={value}
          onClick={() => setView(value)}
          aria-pressed={view === value}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            view === value ? "bg-accent text-white" : "text-white/60 hover:text-white",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
      {Object.entries(STATUS_STYLES).map(([key, style]) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-sm ${style.dot}`} />
          {style.label}
        </span>
      ))}
    </div>
  );
}

function PendingCard({ r, onValidate, onReject, onOpenDay }) {
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-ink-800/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-white">
            {r.first_name} {r.last_name}
          </p>
          <p className="mt-0.5 text-sm text-white/60">{r.service}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold text-amber-200">
          En attente
        </span>
      </div>
      <div className="mt-3 space-y-1 text-sm text-white/70">
        <button
          onClick={onOpenDay}
          className="flex items-center gap-2 capitalize text-accent-bright hover:underline"
        >
          <ClockIcon className="h-4 w-4" />
          {formatDateShort(r.date)} · {formatHour(r.start_time)} ({r.duration}h)
        </button>
        <p className="text-white/60">
          {r.sons ? `${r.sons} son${r.sons > 1 ? "s" : ""} · ` : ""}
          {r.price ? formatPrice(r.price) : "Sur devis"} ·{" "}
          <a
            href={`tel:${(r.phone || "").replace(/\s/g, "")}`}
            className="text-white hover:underline"
          >
            {r.phone}
          </a>
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onValidate}
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#25D366] font-semibold text-black transition-all active:scale-95"
        >
          <CheckIcon className="h-5 w-5" />
          Valider
        </button>
        <button
          onClick={onReject}
          className="min-h-[44px] rounded-xl border border-white/15 font-semibold text-white/80 transition-all hover:border-red-400/50 hover:text-red-300 active:scale-95"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}

function DayView({ items, onValidate, onReject }) {
  const hours = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) hours.push(h);
  const height = (CLOSE_HOUR - OPEN_HOUR) * HOUR_PX;
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-3">
      <div className="relative" style={{ height }}>
        {hours.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 flex items-start gap-2"
            style={{ top: (h - OPEN_HOUR) * HOUR_PX }}
          >
            <span className="w-10 shrink-0 text-right text-xs text-white/40">{h}h</span>
            <span className="mt-2 flex-1 border-t border-white/5" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-12 right-0">
          {items.map((r) => {
            const top = (parseInt(r.start_time, 10) - OPEN_HOUR) * HOUR_PX;
            const blockHeight = r.duration * HOUR_PX;
            const style = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
            const isPending = r.status === "pending";
            const isBlocked = r.status === "blocked";
            return (
              <div
                key={r.id}
                className={`absolute left-0 right-0 overflow-hidden rounded-xl p-2.5 text-xs ${style.block}`}
                style={{ top: top + 2, height: blockHeight - 4 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-semibold text-white">{displayName(r)}</span>
                  <span className={style.chip.split(" ").pop()}>{style.label}</span>
                </div>
                <p className="truncate text-white/60">
                  {!isBlocked && `${r.service} · `}
                  {formatHour(r.start_time)} ({r.duration}h)
                </p>
                {isPending ? (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => onValidate(r.id)}
                      className="rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-bold text-black active:scale-95"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => onReject(r.id)}
                      className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/70 hover:text-red-300 active:scale-95"
                    >
                      Refuser
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onReject(r.id)}
                    className="mt-2 text-xs text-white/40 underline hover:text-red-300"
                  >
                    {isBlocked ? "Débloquer" : "Annuler / libérer"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({ selectedDate, byDate, onOpenDay }) {
  const days = weekDays(selectedDate);
  const today = todayStr();
  return (
    <div className="space-y-2">
      {days.map((d) => {
        const dayItems = byDate[d] || [];
        const isToday = d === today;
        return (
          <div
            key={d}
            className={`rounded-2xl border p-3 ${isToday ? "border-accent/40 bg-accent/[0.06]" : "border-white/10 bg-ink-800/40"}`}
          >
            <button
              onClick={() => onOpenDay(d)}
              className="mb-2 flex w-full items-center justify-between"
            >
              <span className="text-sm font-semibold capitalize text-white">
                {formatWeekday(d)} {dayNumber(d)}
              </span>
              <span className="text-xs text-white/40">
                {dayItems.length ? `${dayItems.length} créneau${dayItems.length > 1 ? "x" : ""}` : "Libre"}
              </span>
            </button>
            {dayItems.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {dayItems.map((r) => {
                  const style = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onOpenDay(d)}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs ${style.block}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                      <span className="shrink-0 font-semibold text-white">
                        {formatHour(r.start_time)}
                      </span>
                      <span className="truncate text-white/70">
                        {displayName(r)} · {r.duration}h
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ selectedDate, byDate, onOpenDay }) {
  const weeks = monthGrid(selectedDate);
  const today = todayStr();
  const currentMonth = monthKey(selectedDate);
  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/40 p-3">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white/30">
        {labels.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d) => {
          const dayItems = byDate[d] || [];
          const inMonth = monthKey(d) === currentMonth;
          const isToday = d === today;
          const statuses = [...new Set(dayItems.map((r) => r.status))];
          return (
            <button
              key={d}
              onClick={() => onOpenDay(d)}
              className={[
                "flex aspect-square flex-col items-center justify-start gap-1 rounded-lg p-1 transition-colors",
                inMonth ? "bg-ink-900/60 hover:bg-ink-700" : "bg-transparent",
                isToday ? "ring-1 ring-accent" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "text-xs",
                  inMonth ? "text-white" : "text-white/25",
                  isToday ? "font-bold text-accent-bright" : "",
                ].join(" ")}
              >
                {dayNumber(d)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-0.5">
                {statuses.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 w-1.5 rounded-full ${(STATUS_STYLES[s] || STATUS_STYLES.confirmed).dot}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-800 px-3 py-3 text-white outline-none placeholder:text-white/30 focus:border-accent";

function ModalField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

function AddModal({ defaultDate, onClose, onSaved }) {
  const [mode, setMode] = useState("block");
  const [date, setDate] = useState(defaultDate || todayStr());
  const [start, setStart] = useState(`${String(OPEN_HOUR).padStart(2, "0")}:00`);
  const [duration, setDuration] = useState(2);
  const [clientName, setClientName] = useState("");
  const [serviceLabel, setServiceLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const startHour = parseInt(start, 10);
  const hours = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR - 1; h++) hours.push(h);
  const maxDuration = Math.min(12, CLOSE_HOUR - startHour);
  const durations = Array.from({ length: maxDuration }, (_, i) => i + 1);
  const finalDuration = Math.min(duration, maxDuration);
  const isBlock = mode === "block";
  const valid = date && start && finalDuration >= 1 && (isBlock || clientName.trim());

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      await reservationsApi.create({
        service: isBlock ? serviceLabel.trim() || "Indisponible" : serviceLabel.trim() || "Réservation",
        service_id: isBlock ? "block" : "manual",
        date,
        start_time: start,
        duration: finalDuration,
        sons: null,
        price: null,
        first_name: isBlock ? "" : clientName.trim(),
        last_name: "",
        phone: isBlock ? "" : phone.trim(),
        status: isBlock ? "blocked" : "confirmed",
      });
      onSaved(date);
    } catch {
      setError("Impossible d'enregistrer. Réessaie.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Ajouter au calendrier</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            ["block", "Bloquer un créneau"],
            ["booking", "Réservation manuelle"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={[
                "min-h-[44px] rounded-xl border px-3 text-sm font-semibold transition-all active:scale-95",
                mode === value
                  ? "border-accent bg-accent/15 text-white"
                  : "border-white/10 bg-ink-800 text-white/60",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {!isBlock && (
            <ModalField label="Nom du client">
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex : Modou Fall"
                className={inputCls}
              />
            </ModalField>
          )}
          <ModalField label={isBlock ? "Motif (optionnel)" : "Prestation (optionnel)"}>
            <input
              value={serviceLabel}
              onChange={(e) => setServiceLabel(e.target.value)}
              placeholder={isBlock ? "Ex : Maintenance" : "Ex : Prise de voix"}
              className={inputCls}
            />
          </ModalField>
          {!isBlock && (
            <ModalField label="Téléphone (optionnel)">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="tel"
                placeholder="77 123 45 67"
                className={inputCls}
              />
            </ModalField>
          )}
          <ModalField label="Date">
            <input
              type="date"
              value={date}
              min={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </ModalField>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Heure de début">
              <select value={start} onChange={(e) => setStart(e.target.value)} className={inputCls}>
                {hours.map((h) => {
                  const value = `${String(h).padStart(2, "0")}:00`;
                  return (
                    <option key={value} value={value}>
                      {formatHour(value)}
                    </option>
                  );
                })}
              </select>
            </ModalField>
            <ModalField label="Durée">
              <select
                value={finalDuration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={inputCls}
              >
                {durations.map((d) => (
                  <option key={d} value={d}>
                    {d}h
                  </option>
                ))}
              </select>
            </ModalField>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="min-h-[48px] flex-1 rounded-2xl border border-white/15 font-semibold text-white/80 hover:text-white active:scale-95"
          >
            Annuler
          </button>
          <button
            onClick={save}
            disabled={!valid || saving}
            className="min-h-[48px] flex-1 rounded-2xl bg-accent font-semibold text-white shadow-glow transition-all hover:bg-accent-bright active:scale-95 disabled:opacity-40"
          >
            {isBlock ? "Bloquer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
