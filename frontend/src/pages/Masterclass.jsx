import config from "../config.js";
import SectionTitle from "../components/SectionTitle.jsx";
import { EventCard, EmptyEvents } from "../components/EventCard.jsx";
import { whatsappLink } from "../lib/booking.js";
import { formatDateLong, formatPrice } from "../lib/format.js";

export default function Masterclass() {
  const events = config.masterclasses ?? [];
  const infoHref = whatsappLink(
    `Salut ${config.studioName} ! Je veux être informé·e des prochaines ${config.studioName} Masterclass (MAO).`
  );
  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow={`${config.studioName} Masterclass`}
        title="Apprends la MAO"
        subtitle="Des cours de production musicale assistée par ordinateur, animés par nos ingénieurs. De l'idée au morceau exporté."
      />
      <div className="mt-8 space-y-4">
        {events.length === 0 ? (
          <EmptyEvents waHref={infoHref} />
        ) : (
          events.map((ev, i) => {
            const waHref = whatsappLink(
              [
                `Salut ${config.studioName} ! Je veux m'inscrire à la masterclass :`,
                `${ev.title}`,
                `Date : ${formatDateLong(ev.date)}`,
                typeof ev.price === "number" ? `Prix : ${formatPrice(ev.price)}` : "",
              ]
                .filter(Boolean)
                .join("\n")
            );
            return (
              <EventCard
                key={i}
                title={ev.title}
                date={ev.date}
                description={ev.description}
                price={ev.price}
                spots={ev.spots}
                waHref={waHref}
                ctaLabel="Je m'inscris"
              />
            );
          })
        )}
      </div>
    </div>
  );
}
