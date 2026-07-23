import { useState } from "react";
import config from "../config.js";
import SectionTitle from "./SectionTitle.jsx";

// Logo client : image monochrome claire, avec repli en badge texte élégant
// si l'image est absente ou ne charge pas.
function ClientLogo({ client }) {
  const [failed, setFailed] = useState(!client.logo);
  const title = client.country ? `${client.name} (${client.country})` : client.name;
  if (failed) {
    return (
      <span
        className="flex h-14 items-center justify-center rounded-xl border border-white/15 px-5 font-display text-sm font-semibold tracking-wide text-white/60 transition-colors duration-300 hover:border-accent/40 hover:text-white"
        title={title}
      >
        {client.name}
      </span>
    );
  }
  return (
    <img
      src={client.logo}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-14 w-auto max-w-[180px] object-contain opacity-60 grayscale invert transition-all duration-300 hover:opacity-100 hover:grayscale-0 hover:invert-0"
    />
  );
}

// Section « Ils nous ont fait confiance » : marquee CSS infini lent
// (pause au survol / toucher), logos dupliqués pour la boucle.
export default function ClientLogos() {
  const clients = config.clients || [];
  if (!clients.length) return null;
  return (
    <section className="mt-14">
      <div className="container-app">
        <SectionTitle eyebrow="Références" title="Ils nous ont fait confiance" />
      </div>
      <div className="marquee mt-6" aria-label="Logos de nos clients">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="marquee-group"
              aria-hidden={copy === 1 ? "true" : undefined}
            >
              {clients.map((client) => (
                <ClientLogo key={`${copy}-${client.id}`} client={client} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
