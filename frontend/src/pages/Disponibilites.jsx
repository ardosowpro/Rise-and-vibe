import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config.js";
import SectionTitle from "../components/SectionTitle.jsx";
import reservationsApi from "../lib/reservations.js";
import { todayStr, formatDateShort } from "../lib/format.js";
import {
  startSlots,
  formatHour,
  occupiedHours,
  isSlotFree,
  maxDurationFrom,
} from "../lib/booking.js";
import { addDays, formatWeekday, dayNumber } from "../lib/dates.js";

const CLOSE_HOUR = parseInt(config.hours.close.split(":")[0], 10);
const MIN_DURATION = config.minDurationHours;
const DAYS_AHEAD = 21;

export default function Disponibilites() {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => todayStr());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const slots = useMemo(() => startSlots(), []);
  const occupied = useMemo(() => occupiedHours(reservations), [reservations]);
  const days = useMemo(
    () => Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(todayStr(), i)),
    []
  );

  const isBookable = (slot) =>
    isSlotFree(slot, occupied) && maxDurationFrom(slot, occupied, CLOSE_HOUR) >= MIN_DURATION;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await reservationsApi.getByDate(date);
        if (alive) setReservations(data);
      } catch {
        if (alive) setReservations([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const unsubscribe = reservationsApi.subscribe(load);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [date]);

  const dayFull = !loading && slots.every((s) => !isBookable(s));
  const goReserve = (slot) => {
    navigate(`/reserver?date=${date}&start=${encodeURIComponent(slot)}`);
  };

  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow="Disponibilités"
        title="Trouve ton créneau"
        subtitle="Tape un créneau libre pour lancer ta demande de réservation."
      />
      <div className="mt-6 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-2 pb-1">
          {days.map((d) => {
            const active = d === date;
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                aria-pressed={active}
                className={[
                  "flex min-h-[64px] w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border transition-all active:scale-95",
                  active
                    ? "border-accent bg-accent/15 text-white shadow-glow-sm"
                    : "border-white/10 bg-ink-800 text-white/70 hover:border-white/25",
                ].join(" ")}
              >
                <span className="text-[11px] uppercase text-white/50">
                  {formatWeekday(d).replace(".", "")}
                </span>
                <span className="text-lg font-bold leading-none">{dayNumber(d)}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-5 text-sm font-medium capitalize text-accent-bright">
        {formatDateShort(date)}
      </p>
      <div className="mt-3">
        {loading ? (
          <p className="text-sm text-white/50">Chargement des disponibilités…</p>
        ) : dayFull ? (
          <p className="rounded-2xl border border-white/10 bg-ink-800/50 p-5 text-center text-sm text-amber-300/90">
            Journée complète. Choisis un autre jour.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {slots.map((slot) => {
              const free = isBookable(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!free}
                  onClick={() => goReserve(slot)}
                  className={[
                    "flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl border text-sm transition-all",
                    free
                      ? "border-accent/40 bg-accent/10 text-white hover:border-accent hover:bg-accent/20 active:scale-95"
                      : "cursor-not-allowed border-white/5 bg-ink-900 text-white/25",
                  ].join(" ")}
                >
                  <span className="font-semibold">{formatHour(slot)}</span>
                  <span className={`text-[11px] ${free ? "text-accent-bright" : "text-white/30"}`}>
                    {free ? "Libre" : "Occupé"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center gap-4 text-xs text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-accent/50 bg-accent/20" />
          Libre
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ink-900" />
          Occupé
        </span>
      </div>
      <p className="mt-6 text-center text-xs text-white/40">
        La demande est confirmée par le studio sur WhatsApp.
      </p>
    </div>
  );
}
