import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import config from "../config.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { CalendarIcon, CheckIcon, WhatsAppIcon } from "../components/icons.jsx";
import reservationsApi from "../lib/reservations.js";
import {
  formatPrice,
  formatDateShort,
  todayStr,
  isVoicePromo,
  promoPrice,
  promoMaxSons,
  promoSonsOptions,
} from "../lib/format.js";
import {
  startSlots,
  formatHour,
  whatsappLink,
  occupiedHours,
  isSlotFree,
  maxDurationFrom,
} from "../lib/booking.js";

const CLOSE_HOUR = parseInt(config.hours.close.split(":")[0], 10);
const MIN_DURATION = config.minDurationHours;

function Step({ n, title, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent-bright">
          {n}
        </span>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-3.5 text-white outline-none placeholder:text-white/30 focus:border-accent"
        {...props}
      />
    </label>
  );
}

function SummaryRow({ label, value, capitalize = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-white/50">{label}</dt>
      <dd className={`text-right font-medium text-white ${capitalize ? "capitalize" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

export default function Reserver() {
  const [searchParams] = useSearchParams();
  const [serviceId, setServiceId] = useState(config.services[0].id);
  const [sons, setSons] = useState(1);
  const [date, setDate] = useState(() => {
    const d = searchParams.get("date");
    return d && d >= todayStr() ? d : "";
  });
  const [start, setStart] = useState(() => searchParams.get("start") || "");
  const [duration, setDuration] = useState(MIN_DURATION);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const slots = useMemo(() => startSlots(), []);
  const occupied = useMemo(() => occupiedHours(reservations), [reservations]);
  const isBookable = (slot) =>
    isSlotFree(slot, occupied) && maxDurationFrom(slot, occupied, CLOSE_HOUR) >= MIN_DURATION;

  useEffect(() => {
    if (!date) {
      setReservations([]);
      return;
    }
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

  // Si le créneau choisi devient indisponible, on le désélectionne
  useEffect(() => {
    if (start && !isBookable(start)) setStart("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupied, start]);

  const maxDuration = start ? maxDurationFrom(start, occupied, CLOSE_HOUR) : 8;
  const finalDuration = Math.min(Math.max(duration, MIN_DURATION), Math.max(MIN_DURATION, maxDuration));
  const service = config.services.find((s) => s.id === serviceId);
  const promo = isVoicePromo(service);
  const total = promo ? promoPrice(sons) : null;
  const stepDate = promo ? 3 : 2;
  const stepHour = promo ? 4 : 3;
  const stepDuration = promo ? 5 : 4;
  const stepContact = promo ? 6 : 5;
  const stepSummary = promo ? 7 : 6;
  const durations = [1, 2, 3, 4, 5, 6, 7, 8].filter((d) => d >= MIN_DURATION && d <= maxDuration);
  const dayFull = date && !loading && slots.every((s) => !isBookable(s));
  const canSend =
    serviceId &&
    date &&
    start &&
    isBookable(start) &&
    finalDuration >= MIN_DURATION &&
    firstName.trim() &&
    lastName.trim() &&
    phone.trim().length >= 6;

  const waHref = useMemo(() => {
    const lines = [
      `Salut ${config.studioName} ! Je souhaite réserver une session.`,
      `Type : ${service?.label ?? ""}`,
    ];
    if (promo) {
      lines.push(`Sons : ${sons}`);
      lines.push(`Total : ${formatPrice(total)}`);
    } else {
      lines.push("Tarif : sur devis");
    }
    lines.push(`Date : ${formatDateShort(date)}`);
    lines.push(`Heure : ${start ? formatHour(start) : ""}, durée ${finalDuration}h (min, extensible)`);
    lines.push(`Nom : ${firstName} ${lastName}`.trim());
    lines.push(`Tél : ${phone}`);
    return whatsappLink(lines.join("\n"));
  }, [service, promo, sons, total, date, start, finalDuration, firstName, lastName, phone]);

  const submit = () => {
    if (!canSend) return;
    setError("");
    reservationsApi
      .create({
        service: service.label,
        service_id: serviceId,
        date,
        start_time: start,
        duration: finalDuration,
        sons: promo ? sons : null,
        price: promo ? total : null,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        status: "pending",
      })
      .then(() => reservationsApi.getByDate(date).then(setReservations))
      .catch(() => setError("La demande n'a pas pu être enregistrée. Réessaie."));
    setSent(true);
  };

  const reset = () => {
    setSent(false);
    setSons(1);
    setStart("");
    setDuration(MIN_DURATION);
    setFirstName("");
    setLastName("");
    setPhone("");
  };

  if (sent) {
    return (
      <div className="container-app flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
          <CheckIcon className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-white">Demande envoyée !</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-white/60">
          Ta demande de session est <strong className="text-white">en attente</strong> de validation
          par le studio. On te confirme au plus vite sur WhatsApp.
        </p>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <div className="mt-8 flex w-full flex-col gap-3">
          <Button variant="whatsapp" href={waHref} fullWidth>
            <WhatsAppIcon className="h-5 w-5" />
            Rouvrir WhatsApp
          </Button>
          <Button variant="secondary" onClick={reset} fullWidth>
            Faire une autre réservation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow="Réservation"
        title="Réserve ta session"
        subtitle="Choisis un créneau disponible, on valide ensemble sur WhatsApp."
      />
      <Link
        to="/disponibilites"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-ink-800 py-3 text-sm font-medium text-accent-bright transition-colors hover:border-accent/40"
      >
        <CalendarIcon className="h-5 w-5" />
        Voir le calendrier des disponibilités
      </Link>
      <div className="mt-8 space-y-9">
        <Step n={1} title="Type de session">
          <div className="grid gap-3">
            {config.services.map((s) => (
              <Card
                key={s.id}
                selectable
                selected={serviceId === s.id}
                onClick={() => setServiceId(s.id)}
                role="radio"
                aria-checked={serviceId === s.id}
                tabIndex={0}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setServiceId(s.id))
                }
                className="flex items-center justify-between p-4"
              >
                <span className="font-medium text-white">{s.label}</span>
                {serviceId === s.id && <CheckIcon className="h-5 w-5 text-accent-bright" />}
              </Card>
            ))}
          </div>
        </Step>

        {promo && (
          <Step n={2} title="Nombre de sons">
            <div className="grid grid-cols-2 gap-3">
              {promoSonsOptions().map((n) => (
                <Card
                  key={n}
                  selectable
                  selected={sons === n}
                  onClick={() => setSons(n)}
                  role="radio"
                  aria-checked={sons === n}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSons(n))
                  }
                  className="flex flex-col items-center gap-1 p-4 text-center"
                >
                  <span className="text-lg font-extrabold uppercase tracking-widest text-accent-bright">
                    PROMOTION
                  </span>
                  <span className="font-semibold text-white">
                    {n} son{n > 1 ? "s" : ""}
                  </span>
                  <span className="text-sm text-accent-bright">{formatPrice(promoPrice(n))}</span>
                </Card>
              ))}
            </div>
            <p className="text-xs text-white/50">
              Plus de {promoMaxSons()} sons ? Précise-le sur WhatsApp après l'envoi.
            </p>
          </Step>
        )}

        <Step n={stepDate} title="Date">
          <input
            type="date"
            value={date}
            min={todayStr()}
            onChange={(e) => {
              setDate(e.target.value);
              setStart("");
            }}
            aria-label="Date de la session"
            className="w-full rounded-2xl border border-white/10 bg-ink-800 px-4 py-3.5 text-white outline-none [color-scheme:dark] focus:border-accent"
          />
          {date && <p className="text-sm capitalize text-accent-bright">{formatDateShort(date)}</p>}
        </Step>

        <Step n={stepHour} title="Heure de début">
          {date ? (
            loading ? (
              <p className="text-sm text-white/50">Chargement des disponibilités…</p>
            ) : dayFull ? (
              <p className="text-sm text-amber-300/90">
                Cette journée est complète. Choisis une autre date.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const taken = !isSlotFree(slot, occupied);
                    const bookable = isBookable(slot);
                    const active = start === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!bookable}
                        onClick={() => setStart(slot)}
                        aria-pressed={active}
                        title={
                          bookable
                            ? undefined
                            : taken
                              ? "Créneau occupé"
                              : `Minimum ${MIN_DURATION}h impossible sur ce créneau`
                        }
                        className={[
                          "min-h-[48px] rounded-xl border text-sm font-medium transition-all",
                          bookable
                            ? active
                              ? "border-accent bg-accent/15 text-white shadow-glow-sm active:scale-95"
                              : "border-white/10 bg-ink-800 text-white/70 hover:border-white/25 active:scale-95"
                            : "cursor-not-allowed border-white/5 bg-ink-900 text-white/25 line-through",
                        ].join(" ")}
                      >
                        {formatHour(slot)}
                      </button>
                    );
                  })}
                </div>
                <p className="flex items-center gap-3 text-xs text-white/40">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm border border-white/20 bg-ink-800" />
                    Libre
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-ink-900" />
                    Occupé
                  </span>
                </p>
              </>
            )
          ) : (
            <p className="text-sm text-white/50">Choisis d'abord une date.</p>
          )}
        </Step>

        <Step n={stepDuration} title="Durée">
          {start ? (
            <>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    aria-pressed={finalDuration === d}
                    className={[
                      "min-h-[48px] rounded-xl border text-sm font-semibold transition-all active:scale-95",
                      finalDuration === d
                        ? "border-accent bg-accent/15 text-white shadow-glow-sm"
                        : "border-white/10 bg-ink-800 text-white/70 hover:border-white/25",
                    ].join(" ")}
                  >
                    {d}h
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/50">
                Sessions de {MIN_DURATION}h minimum.
                {maxDuration < 8 &&
                  ` Jusqu'à ${maxDuration}h à partir de ${formatHour(start)} (créneau suivant occupé ou fermeture à ${config.hours.close}).`}
              </p>
            </>
          ) : (
            <p className="text-sm text-white/50">Choisis d'abord une heure de début.</p>
          )}
        </Step>

        <Step n={stepContact} title="Tes coordonnées">
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Prénom"
                value={firstName}
                onChange={setFirstName}
                autoComplete="given-name"
                placeholder="Modou"
              />
              <Field
                label="Nom"
                value={lastName}
                onChange={setLastName}
                autoComplete="family-name"
                placeholder="Fall"
              />
            </div>
            <Field
              label="Téléphone"
              value={phone}
              onChange={setPhone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="77 123 45 67"
            />
          </div>
        </Step>

        <Step n={stepSummary} title="Récapitulatif">
          <Card className="p-5">
            <dl className="space-y-2.5 text-sm">
              <SummaryRow label="Type" value={service?.label} />
              {promo && <SummaryRow label="Sons" value={`${sons} son${sons > 1 ? "s" : ""}`} />}
              <SummaryRow label="Date" value={date ? formatDateShort(date) : "—"} capitalize />
              <SummaryRow
                label="Heure"
                value={start ? `${formatHour(start)} · ${finalDuration}h` : "—"}
              />
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  {promo ? "Total" : "Tarif"}
                </p>
                <p className="text-xs text-white/40">
                  {promo
                    ? `Prise de voix · ${sons} son${sons > 1 ? "s" : ""}`
                    : "Le studio te répond sur WhatsApp"}
                </p>
              </div>
              <p className={`font-display font-bold text-gradient ${promo ? "text-3xl" : "text-xl"}`}>
                {promo ? formatPrice(total) : "Sur devis"}
              </p>
            </div>
          </Card>
        </Step>

        <div className="space-y-3">
          <Button
            variant="whatsapp"
            href={canSend ? waHref : undefined}
            onClick={canSend ? submit : undefined}
            fullWidth
            disabled={!canSend}
            aria-disabled={!canSend}
          >
            <WhatsAppIcon className="h-5 w-5" />
            Envoyer ma demande
          </Button>
          <p className="text-center text-sm text-white/50">
            {canSend
              ? "Ta demande sera confirmée par le studio sur WhatsApp."
              : "Choisis un créneau disponible et complète tes coordonnées."}
          </p>
        </div>
      </div>
    </div>
  );
}
