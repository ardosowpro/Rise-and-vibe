import Card from "./Card.jsx";
import Button from "./Button.jsx";
import { CalendarIcon, WhatsAppIcon } from "./icons.jsx";
import { formatDateLong, formatPrice } from "../lib/format.js";

// Carte d'un événement (masterclass ou session)
export function EventCard({
  title,
  date,
  description,
  price,
  spots,
  guest,
  waHref,
  ctaLabel = "Je m'inscris",
}) {
  return (
    <Card className="overflow-hidden p-5 animate-fade-up">
      <div className="flex items-center gap-2 text-accent-bright">
        <CalendarIcon className="h-4 w-4" />
        <span className="text-sm font-medium capitalize">{formatDateLong(date)}</span>
      </div>
      <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
      {guest && (
        <p className="mt-1 text-sm text-white/70">
          Avec <span className="text-white">{guest}</span>
        </p>
      )}
      {description && <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {typeof price === "number" && (
          <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-bright">
            {formatPrice(price)}
          </span>
        )}
        {typeof spots === "number" && <span className="text-xs text-white/50">{spots} places</span>}
      </div>
      <Button variant="whatsapp" href={waHref} fullWidth className="mt-5">
        <WhatsAppIcon className="h-5 w-5" />
        {ctaLabel}
      </Button>
    </Card>
  );
}

// État vide : aucun événement annoncé
export function EmptyEvents({
  title = "Prochaines dates bientôt annoncées",
  message = "Laisse-nous ton contact pour être prévenu·e dès l'ouverture des inscriptions.",
  waHref,
  ctaLabel = "Être informé·e",
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent-bright">
        <CalendarIcon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-white/60">{message}</p>
      <Button variant="whatsapp" href={waHref} className="mt-6">
        <WhatsAppIcon className="h-5 w-5" />
        {ctaLabel}
      </Button>
    </Card>
  );
}
