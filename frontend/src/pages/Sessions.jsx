import config from "../config.js";
import SectionTitle from "../components/SectionTitle.jsx";
import { EventCard, EmptyEvents } from "../components/EventCard.jsx";
import { whatsappLink } from "../lib/booking.js";
import { formatDateLong } from "../lib/format.js";

export default function Sessions() {
  const events = config.sessions ?? [];
  const infoHref = whatsappLink(
    `Salut ${config.studioName} ! Je veux être informé·e des prochaines ${config.studioName} Sessions (rencontres artistes).`
  );
  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow={`${config.studioName} Sessions`}
        title="Rencontres d'artistes"
        subtitle="Des séminaires et échanges avec des artistes invités : parcours, coulisses et processus créatif."
      />
      <div className="mt-8 space-y-4">
        {events.length === 0 ? (
          <EmptyEvents
            message="Laisse-nous ton contact pour être prévenu·e de la prochaine rencontre."
            waHref={infoHref}
          />
        ) : (
          events.map((ev, i) => {
            const waHref = whatsappLink(
              [
                `Salut ${config.studioName} ! Je veux participer à la session :`,
                `${ev.title}`,
                `Date : ${formatDateLong(ev.date)}`,
                ev.guest ? `Invité : ${ev.guest}` : "",
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
                guest={ev.guest}
                waHref={waHref}
                ctaLabel="Je participe"
              />
            );
          })
        )}
      </div>
    </div>
  );
}
