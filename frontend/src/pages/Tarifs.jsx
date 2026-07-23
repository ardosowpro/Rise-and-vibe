import config from "../config.js";
import Button from "../components/Button.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import PricingBlocks from "../components/PricingBlocks.jsx";
import { CalendarIcon } from "../components/icons.jsx";
import { getActivePricing } from "../lib/pricing.js";

export default function Tarifs() {
  const pricing = getActivePricing();
  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow="Tarifs"
        title="Nos tarifs"
        subtitle={
          pricing.isPromo
            ? `Période promo en cours - ${pricing.endLabel.charAt(0).toLowerCase()}${pricing.endLabel.slice(1)}.`
            : "Tarifs standards du studio."
        }
      />
      <div className="mt-8">
        <PricingBlocks />
      </div>
      <div className="mt-8">
        <Button to="/reserver" fullWidth>
          <CalendarIcon className="h-5 w-5" />
          Réserver une session
        </Button>
        <p className="mt-3 text-center text-xs text-white/40">
          Ouvert {config.hours.days.toLowerCase()}, {config.hours.open} – {config.hours.close}.
        </p>
      </div>
    </div>
  );
}
