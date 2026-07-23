import { Link } from "react-router-dom";
import config from "../config.js";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import HeroSlideshow from "../components/HeroSlideshow.jsx";
import ClientLogos from "../components/ClientLogos.jsx";
import PricingBlocks, { PromoBadge } from "../components/PricingBlocks.jsx";
import { CalendarIcon, SparkIcon, ArrowRightIcon } from "../components/icons.jsx";
import { formatPrice } from "../lib/format.js";
import { getActivePricing } from "../lib/pricing.js";

function FeatureLink({ to, title, desc }) {
  return (
    <Link to={to}>
      <Card selectable className="flex items-center gap-4 p-5">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-white/60">{desc}</p>
        </div>
        <ArrowRightIcon className="h-5 w-5 shrink-0 text-accent-bright" />
      </Card>
    </Link>
  );
}

export default function Home() {
  const pricing = getActivePricing();
  const minPackage = pricing.packages.reduce((a, b) => (b.price < a.price ? b : a));
  return (
    <div>
      {/* Héro avec diaporama des photos de sessions */}
      <section className="relative overflow-hidden">
        <HeroSlideshow />
        <div
          className="absolute inset-0 -z-10 opacity-[0.15]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 22px)",
            maskImage: "linear-gradient(180deg, transparent, black 30%, transparent)",
          }}
        />
        <div className="container-app flex min-h-[78vh] flex-col justify-end pb-10 pt-24">
          <p className="eyebrow animate-fade-up">Studio d'enregistrement · {config.address}</p>
          <h1 className="mt-3 text-5xl font-bold leading-[1.05] text-white animate-fade-up">
            {config.studioName.split(" ")[0]}{" "}
            <span className="text-gradient">
              {config.studioName.split(" ").slice(1).join(" ") || "Lab"}
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-lg text-white/70 animate-fade-up">
            {config.tagline} Enregistrement, mixage et mastering pensés pour les artistes
            d'aujourd'hui.
          </p>
          <div className="mt-8 flex flex-col gap-3 animate-fade-up">
            <Button to="/reserver" fullWidth>
              <CalendarIcon className="h-5 w-5" />
              Réserver une session
            </Button>
            <Button to="/disponibilites" variant="secondary" fullWidth>
              Voir les créneaux disponibles
            </Button>
            <p className="text-center text-sm text-white/60">
              {pricing.isPromo && (
                <span className="mb-1 block">
                  <PromoBadge pricing={pricing} />
                </span>
              )}
              Forfaits dès{" "}
              <span className="font-semibold text-white">{formatPrice(minPackage.price)}</span>
              {" · "}Session studio{" "}
              <span className="font-semibold text-white">{formatPrice(pricing.hourlyRate)}</span>/h
            </p>
          </div>
        </div>
      </section>

      {/* Prestations */}
      <section className="container-app mt-8 space-y-5">
        <SectionTitle
          eyebrow="Nos prestations"
          title="Ce qu'on fait pour toi"
          subtitle="Enregistrement au forfait ou à l'heure. Mixage, mastering et projets sur devis."
        />
        <div className="grid gap-3">
          {config.services.map((service) => (
            <Card key={service.id} className="flex items-start gap-4 p-5">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 font-display text-lg font-bold text-accent-bright">
                {service.short.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{service.label}</h3>
                <p className="mt-1 text-sm text-white/60">{service.description}</p>
                <p className="mt-2 text-sm font-semibold text-accent-bright">
                  {service.pricing === "sons"
                    ? `Forfaits dès ${formatPrice(minPackage.price)}`
                    : "Sur devis"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Ils nous ont fait confiance */}
      <ClientLogos />

      {/* Tarifs */}
      <section className="container-app mt-14 space-y-5">
        <SectionTitle
          eyebrow="Tarifs"
          title="Des prix clairs"
          subtitle={
            pricing.isPromo
              ? `Période promo en cours - ${pricing.endLabel.charAt(0).toLowerCase()}${pricing.endLabel.slice(1)}.`
              : "Tarifs standards du studio."
          }
        />
        <PricingBlocks />
        <Link
          to="/tarifs"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-accent-bright hover:underline"
        >
          Voir la page tarifs <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </section>

      {/* Plus qu'un studio */}
      <section className="container-app mt-14 space-y-4">
        <SectionTitle eyebrow={config.studioName} title="Plus qu'un studio" />
        <div className="grid gap-3">
          <FeatureLink
            to="/masterclass"
            title={`${config.studioName} Masterclass`}
            desc="Apprends la production musicale (MAO) avec nos ingénieurs."
          />
          <FeatureLink
            to="/sessions"
            title={`${config.studioName} Sessions`}
            desc="Séminaires et rencontres avec des artistes invités."
          />
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="container-app mt-14">
        <Card className="relative overflow-hidden p-6 text-center">
          <div
            className="absolute inset-0 -z-10 opacity-70"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(80% 120% at 50% 0%, rgba(225,87,67,0.22), transparent 60%)",
            }}
          />
          <SparkIcon className="mx-auto h-8 w-8 text-accent-bright" />
          <h3 className="mt-3 text-xl font-bold text-white">Prêt·e à enregistrer ?</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">
            Réserve ta session en moins d'une minute. Confirmation par le studio sur WhatsApp.
          </p>
          <Button to="/reserver" className="mt-5">
            Réserver maintenant
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </Card>
      </section>
    </div>
  );
}
