import { Link } from "react-router-dom";
import Card from "./Card.jsx";
import { formatPrice } from "../lib/format.js";
import { getActivePricing } from "../lib/pricing.js";
import { ArrowRightIcon } from "./icons.jsx";

// Badge « Promo jusqu'au 20 août »
export function PromoBadge({ pricing, className = "" }) {
  if (!pricing.isPromo) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-bright ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" aria-hidden="true" />
      Promo {pricing.endLabel.charAt(0).toLowerCase()}
      {pricing.endLabel.slice(1)}
    </span>
  );
}

// Trois blocs tarifaires : Forfaits, Session studio, Sur devis.
// N'affiche jamais les deux grilles en même temps : uniquement la grille active.
export default function PricingBlocks({ withLinks = true }) {
  const pricing = getActivePricing();
  return (
    <div className="space-y-4">
      {/* Forfaits */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-white">Forfaits enregistrement</h3>
          <PromoBadge pricing={pricing} />
        </div>
        {pricing.isPromo && pricing.note && (
          <p className="mt-1.5 text-xs text-white/50">{pricing.note}.</p>
        )}
        <ul className="mt-4 divide-y divide-white/5">
          {pricing.packages.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <span className="text-white/80">{p.label}</span>
              <span className="font-semibold text-accent-bright">{formatPrice(p.price)}</span>
            </li>
          ))}
        </ul>
        {withLinks && (
          <Link
            to="/reserver?mode=forfait"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-bright hover:underline"
          >
            Réserver un forfait <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </Card>

      {/* Session studio à l'heure */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-white">Session studio</h3>
          <PromoBadge pricing={pricing} />
        </div>
        <p className="mt-3 text-sm text-white/70">
          Le studio et un ingénieur, à l'heure :{" "}
          <span className="font-semibold text-accent-bright">
            {formatPrice(pricing.hourlyRate)}
          </span>
          <span className="text-white/50"> / heure</span>
        </p>
        {withLinks && (
          <Link
            to="/reserver?mode=heure"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-bright hover:underline"
          >
            Réserver une session <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </Card>

      {/* Sur devis */}
      <Card className="p-5">
        <h3 className="font-semibold text-white">Sur devis</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {pricing.surDevis.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70"
            >
              {item}
            </li>
          ))}
        </ul>
        {withLinks && (
          <Link
            to="/reserver?mode=devis"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-bright hover:underline"
          >
            Demander un devis <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </Card>
    </div>
  );
}
