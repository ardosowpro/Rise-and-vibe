import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import config from "../config.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { PromoBadge } from "../components/PricingBlocks.jsx";
import { CalendarIcon, CheckIcon, WhatsAppIcon } from "../components/icons.jsx";
import reservationsApi from "../lib/reservations.js";
import { formatPrice, formatDateShort, todayStr } from "../lib/format.js";
import { getActivePricing, promoSuffix } from "../lib/pricing.js";
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
const FORFAIT_DURATION = 2; // durée bloquée par défaut pour un forfait
const ANY_ENGINEER = "Peu importe";

const MODES = [
  { id: "forfait", label: "Forfait", desc: "Un prix fixe pour ton projet" },
  { id: "heure", label: "Session à l'heure", desc: "Le studio au tarif horaire" },
  { id: "devis", label: "Sur devis", desc: "Mixage, mastering, projets…" },
];

// Nombre de sons associé à un forfait (pour l'enregistrement API)
const PACKAGE_SONS = { "1son": 1, "2sons": 2, "3sons": 3, ep5: 5 };

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

// Carte radio générique
function ChoiceCard({ selected, onSelect, children, className = "" }) {
  return (
    <Card
      selectable
      selected={selected}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      className={className}
    >
      {children}
    </Card>
  );
}

export default function Reserver() {
  const [searchParams] = useSearchParams();
  const pricing = getActivePricing();

  const [mode, setMode] = useState(() => {
    const m = searchParams.get("mode");
    return MODES.some((x) => x.id === m) ? m : "forfait";
  });
  const [packageId, setPackageId] = useState(pricing.packages[0]?.id ?? "");
  const [devisItem, setDevisItem] = useState(pricing.surDevis[0] ?? "");
  const [engineer, setEngineer] = useState(ANY_ENGINEER);
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

  const isDevis = mode === "devis";
  const isForfait = mode === "forfait";
  const engineers = [...config.team.map((m) => m.name), ANY_ENGINEER];

  const slots = useMemo(() => startSlots(), []);
  const occupied = useMemo(() => occupiedHours(reservations), [reservations]);
  const isBookable = (slot) =>
    isSlotFree(slot, occupied) && maxDurationFrom(slot, occupied, CLOSE_HOUR) >= MIN_DURATION;

  useEffect(() => {
    if (!date || isDevis) {
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
  }, [date, isDevis]);

  // Si le créneau choisi devient indisponible, on le désélectionne
  useEffect(() => {
    if (start && !isDevis && !isBookable(start)) setStart("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occupied, start, isDevis]);

  const maxDuration = start ? maxDurationFrom(start, occupied, CLOSE_HOUR) : 8;
  const finalDuration = Math.min(
    Math.max(duration, MIN_DURATION),
    Math.max(MIN_DURATION, maxDuration)
  );
  const selectedPackage = pricing.packages.find((p) => p.id === packageId) || pricing.packages[0];
  const total = isForfait
    ? selectedPackage?.price ?? null
    : isDevis
      ? null
      : finalDuration * pricing.hourlyRate;
  const durations = [1, 2, 3, 4, 5, 6, 7, 8].filter((d) => d >= MIN_DURATION && d <= maxDuration);
  const dayFull = date && !loading && slots.every((s) => !isBookable(s));

  const contactOk = firstName.trim() && lastName.trim() && phone.trim().length >= 6;
  const canSend = isDevis
    ? Boolean(devisItem && contactOk)
    : Boolean(
        date &&
          start &&
          isBookable(start) &&
          (isForfait || finalDuration >= MIN_DURATION) &&
          (isForfait ? selectedPackage : true) &&
          contactOk
      );

  const waHref = useMemo(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    let lines;
    if (isDevis) {
      lines = [
        `Salut ${config.studioName} ! Je souhaite un devis.`,
        `Prestation : ${devisItem}`,
        "Détails : (je te donne plus d'infos ici)",
        `Nom : ${fullName}`,
        `Tél : ${phone}`,
      ];
    } else if (isForfait) {
      lines = [
        `Salut ${config.studioName} ! Je souhaite réserver un forfait.`,
        `Forfait : ${selectedPackage?.label ?? ""}${promoSuffix(pricing)}`,
        `Total : ${formatPrice(total)}`,
        `Créneau souhaité : ${formatDateShort(date)}, ${start ? formatHour(start) : ""}`,
        `Ingénieur : ${engineer}`,
        `Nom : ${fullName}`,
        `Tél : ${phone}`,
      ];
    } else {
      lines = [
        `Salut ${config.studioName} ! Je souhaite réserver une session studio.`,
        `Session à l'heure${promoSuffix(pricing)} : ${finalDuration}h × ${formatPrice(pricing.hourlyRate)}`,
        `Total : ${formatPrice(total)}`,
        `Date : ${formatDateShort(date)}`,
        `Heure : ${start ? formatHour(start) : ""}, durée ${finalDuration}h`,
        `Ingénieur : ${engineer}`,
        `Nom : ${fullName}`,
        `Tél : ${phone}`,
      ];
    }
    return whatsappLink(lines.join("\n"));
  }, [
    isDevis,
    isForfait,
    devisItem,
    selectedPackage,
    pricing,
    total,
    date,
    start,
    finalDuration,
    engineer,
    firstName,
    lastName,
    phone,
  ]);

  const submit = () => {
    if (!canSend) return;
    setError("");
    if (!isDevis) {
      // Les forfaits et sessions à l'heure sont enregistrés via l'API,
      // le devis passe uniquement par WhatsApp.
      const gridNote = pricing.isPromo ? "grille promo" : "grille standard";
      const record = isForfait
        ? {
            service: `Forfait ${selectedPackage.label}`,
            service_id: `forfait-${selectedPackage.id}`,
            sons: PACKAGE_SONS[selectedPackage.id] ?? null,
            duration: FORFAIT_DURATION,
            note: `Forfait ${selectedPackage.label} (${gridNote}) · Ingénieur : ${engineer}`,
          }
        : {
            service: "Session studio à l'heure",
            service_id: "session-heure",
            sons: null,
            duration: finalDuration,
            note: `Session à l'heure (${gridNote}, ${formatPrice(pricing.hourlyRate)}/h) · Ingénieur : ${engineer}`,
          };
      reservationsApi
        .create({
          ...record,
          date,
          start_time: start,
          price: total,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          status: "pending",
        })
        .then(() => reservationsApi.getByDate(date).then(setReservations))
        .catch(() => setError("La demande n'a pas pu être enregistrée. Réessaie."));
    }
    setSent(true);
  };

  const reset = () => {
    setSent(false);
    setStart("");
    setDuration(MIN_DURATION);
    setFirstName("");
    setLastName("");
    setPhone("");
    setError("");
  };

  if (sent) {
    return (
      <div className="container-app flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
          <CheckIcon className="h-9 w-9" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-white">
          {isDevis ? "Demande de devis envoyée !" : "Demande envoyée !"}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-white/60">
          {isDevis ? (
            <>Continue la discussion sur WhatsApp pour préciser ton projet, on te répond vite.</>
          ) : (
            <>
              Ta demande est <strong className="text-white">en attente</strong> de validation par
              le studio. On te confirme au plus vite sur WhatsApp.
            </>
          )}
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

  // Numérotation des étapes selon le mode
  let n = 1;
  const stepMode = n++;
  const stepChoice = n++;
  const stepEngineer = isDevis ? null : n++;
  const stepDate = isDevis ? null : n++;
  const stepHour = isDevis ? null : n++;
  const stepDuration = mode === "heure" ? n++ : null;
  const stepContact = n++;
  const stepSummary = n++;

  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow="Réservation"
        title="Réserve ta session"
        subtitle="Choisis ta formule et ton créneau, on valide ensemble sur WhatsApp."
      />
      <Link
        to="/disponibilites"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-ink-800 py-3 text-sm font-medium text-accent-bright transition-colors hover:border-accent/40"
      >
        <CalendarIcon className="h-5 w-5" />
        Voir le calendrier des disponibilités
      </Link>
      <div className="mt-8 space-y-9">
        <Step n={stepMode} title="Que veux-tu réserver ?">
          <div className="grid gap-3">
            {MODES.map((m) => (
              <ChoiceCard
                key={m.id}
                selected={mode === m.id}
                onSelect={() => setMode(m.id)}
                className="flex items-center justify-between p-4"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-white">{m.label}</span>
                  <span className="mt-0.5 block text-xs text-white/50">{m.desc}</span>
                </span>
                {mode === m.id && <CheckIcon className="h-5 w-5 shrink-0 text-accent-bright" />}
              </ChoiceCard>
            ))}
          </div>
        </Step>

        {isForfait && (
          <Step n={stepChoice} title="Choisis ton forfait">
            {pricing.isPromo && (
              <div className="flex flex-wrap items-center gap-2">
                <PromoBadge pricing={pricing} />
                <span className="text-xs text-white/50">{pricing.note}.</span>
              </div>
            )}
            <div className="grid gap-3">
              {pricing.packages.map((p) => (
                <ChoiceCard
                  key={p.id}
                  selected={packageId === p.id}
                  onSelect={() => setPackageId(p.id)}
                  className="flex items-center justify-between p-4"
                >
                  <span className="font-medium text-white">{p.label}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-accent-bright">
                      {formatPrice(p.price)}
                    </span>
                    {packageId === p.id && <CheckIcon className="h-5 w-5 text-accent-bright" />}
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </Step>
        )}

        {mode === "heure" && (
          <Step n={stepChoice} title="Tarif horaire">
            <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
              <span className="text-sm text-white/70">
                Studio + ingénieur :{" "}
                <span className="font-semibold text-accent-bright">
                  {formatPrice(pricing.hourlyRate)}
                </span>
                <span className="text-white/50"> / heure</span>
              </span>
              <PromoBadge pricing={pricing} />
            </Card>
          </Step>
        )}

        {isDevis && (
          <Step n={stepChoice} title="Quelle prestation ?">
            <div className="grid gap-3">
              {pricing.surDevis.map((item) => (
                <ChoiceCard
                  key={item}
                  selected={devisItem === item}
                  onSelect={() => setDevisItem(item)}
                  className="flex items-center justify-between p-4"
                >
                  <span className="font-medium text-white">{item}</span>
                  {devisItem === item && <CheckIcon className="h-5 w-5 text-accent-bright" />}
                </ChoiceCard>
              ))}
            </div>
            <p className="text-xs text-white/50">
              Pas de prix fixe : le studio étudie ton projet et te propose un devis sur WhatsApp.
            </p>
          </Step>
        )}

        {!isDevis && (
          <Step n={stepEngineer} title="Ton ingénieur">
            <div className="grid grid-cols-3 gap-2">
              {engineers.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setEngineer(name)}
                  aria-pressed={engineer === name}
                  className={[
                    "min-h-[48px] rounded-xl border px-2 text-sm font-medium transition-all active:scale-95",
                    engineer === name
                      ? "border-accent bg-accent/15 text-white shadow-glow-sm"
                      : "border-white/10 bg-ink-800 text-white/70 hover:border-white/25",
                  ].join(" ")}
                >
                  {name}
                </button>
              ))}
            </div>
          </Step>
        )}

        {!isDevis && (
          <>
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
              {date && (
                <p className="text-sm capitalize text-accent-bright">{formatDateShort(date)}</p>
              )}
            </Step>

            <Step
              n={stepHour}
              title={isForfait ? "Créneau souhaité pour démarrer" : "Heure de début"}
            >
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
                    {isForfait && (
                      <p className="text-xs text-white/50">
                        Le forfait n'a pas de durée fixe : indique simplement quand tu veux
                        démarrer, le studio organise la suite avec toi.
                      </p>
                    )}
                  </>
                )
              ) : (
                <p className="text-sm text-white/50">Choisis d'abord une date.</p>
              )}
            </Step>
          </>
        )}

        {mode === "heure" && (
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
        )}

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
              {isDevis ? (
                <>
                  <SummaryRow label="Demande" value="Devis" />
                  <SummaryRow label="Prestation" value={devisItem} />
                </>
              ) : isForfait ? (
                <>
                  <SummaryRow label="Formule" value={`Forfait ${selectedPackage?.label ?? ""}`} />
                  <SummaryRow label="Ingénieur" value={engineer} />
                  <SummaryRow
                    label="Créneau souhaité"
                    value={
                      date && start ? `${formatDateShort(date)} · ${formatHour(start)}` : "—"
                    }
                    capitalize
                  />
                </>
              ) : (
                <>
                  <SummaryRow label="Formule" value="Session à l'heure" />
                  <SummaryRow label="Ingénieur" value={engineer} />
                  <SummaryRow label="Date" value={date ? formatDateShort(date) : "—"} capitalize />
                  <SummaryRow
                    label="Heure"
                    value={start ? `${formatHour(start)} · ${finalDuration}h` : "—"}
                  />
                </>
              )}
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  {isDevis ? "Tarif" : "Total"}
                </p>
                <p className="text-xs text-white/40">
                  {isDevis
                    ? "Le studio te répond sur WhatsApp"
                    : pricing.isPromo
                      ? `Grille promo — ${pricing.endLabel.charAt(0).toLowerCase()}${pricing.endLabel.slice(1)}`
                      : "Tarifs standards"}
                </p>
              </div>
              <p
                className={`font-display font-bold text-gradient ${isDevis ? "text-xl" : "text-3xl"}`}
              >
                {isDevis ? "Sur devis" : formatPrice(total)}
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
            {isDevis ? "Demander un devis" : "Envoyer ma demande"}
          </Button>
          <p className="text-center text-sm text-white/50">
            {canSend
              ? isDevis
                ? "Ta demande part directement sur WhatsApp."
                : "Ta demande sera confirmée par le studio sur WhatsApp."
              : isDevis
                ? "Choisis une prestation et complète tes coordonnées."
                : "Choisis un créneau disponible et complète tes coordonnées."}
          </p>
        </div>
      </div>
    </div>
  );
}
