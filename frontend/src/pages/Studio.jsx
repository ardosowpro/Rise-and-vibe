import { useState } from "react";
import config from "../config.js";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import {
  CheckIcon,
  WhatsAppIcon,
  MicIcon,
  LaptopIcon,
  SlidersIcon,
} from "../components/icons.jsx";

// Groupes de matériel : titre, icône et liste depuis config.equipment
const EQUIPMENT_GROUPS = [
  { key: "daw", title: "Logiciels", Icon: LaptopIcon },
  { key: "hardware", title: "Matériel", Icon: MicIcon },
  { key: "plugins", title: "Plugins", Icon: SlidersIcon },
];
import { whatsappInfoLink } from "../lib/booking.js";

// Chemin de la version WebP optimisée d'une photo (/photos/x.jpg → /photos/optimized/x.webp)
function optimizedSrc(src) {
  const m = src && src.match(/^(.*)\/([^/]+)\.(jpe?g|png)$/i);
  return m ? `${m[1]}/optimized/${m[2]}.webp` : null;
}

// Photo avec version WebP légère et repli en dégradé si l'image manque
function StudioPhoto({ src, className, alt, seed = 0 }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={className}
        aria-label={alt}
        style={{
          background: `radial-gradient(80% 80% at 30% 20%, rgba(225,87,67,0.28), transparent 60%),linear-gradient(${140 + seed * 40}deg, #1e1e2a, #0a0a0f)`,
        }}
      />
    );
  }
  const webp = optimizedSrc(src);
  return (
    <picture>
      {webp && <source srcSet={webp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${className} object-cover`}
      />
    </picture>
  );
}

export default function Studio() {
  const photos = config.studioPhotos || [];
  const previewCount = config.galleryPreviewCount ?? 6;
  const [expanded, setExpanded] = useState(false);
  const galleryPhotos = photos.length > 1 ? photos.slice(1) : [0, 1, 2];
  const visiblePhotos = expanded ? galleryPhotos : galleryPhotos.slice(0, previewCount);
  const hiddenCount = galleryPhotos.length - visiblePhotos.length;
  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow="Le Studio"
        title="Un espace pensé pour créer"
        subtitle={`Au cœur de ${config.address}, un lieu traité acoustiquement et équipé pour donner le meilleur à ta musique.`}
      />
      <StudioPhoto
        src={photos[0]}
        alt="Le studio Rise and Vibe"
        className="mt-6 aspect-[4/3] w-full rounded-2xl border border-white/10"
      />

      <section className="mt-12 space-y-4">
        <SectionTitle eyebrow="Équipement" title="Le matériel" />
        <div className="grid gap-3">
          {EQUIPMENT_GROUPS.map(({ key, title, Icon }) => (
            <Card key={key} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-semibold text-white">{title}</h3>
              </div>
              <ul className="mt-4 grid gap-2.5">
                {(config.equipment[key] || []).map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <SectionTitle eyebrow="L'équipe" title="Aux manettes" />
        <div className="grid grid-cols-2 gap-3">
          {config.team.map((member) => (
            <Card key={member.id} className="overflow-hidden p-4 text-center">
              <div
                className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-bold text-white"
                style={{ background: "linear-gradient(160deg, #b23a29, #e15743)" }}
                aria-hidden="true"
              >
                {member.name.charAt(0)}
              </div>
              <p className="font-semibold text-white">{member.name}</p>
              <p className="mt-0.5 text-xs text-white/60">{member.role}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <SectionTitle eyebrow="Galerie" title="En images" />
        <div className="grid grid-cols-2 gap-3">
          {visiblePhotos.map((photo, i) => (
            <StudioPhoto
              key={i}
              src={typeof photo === "string" ? photo : undefined}
              seed={i + 1}
              alt="Photo du studio Rise and Vibe"
              className="aspect-square w-full rounded-xl border border-white/10"
            />
          ))}
        </div>
        {(hiddenCount > 0 || expanded) && (
          <div className="text-center">
            <Button variant="ghost" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Voir moins" : `Voir plus (${hiddenCount} photos)`}
            </Button>
          </div>
        )}
      </section>

      <section className="mt-12">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-bold text-white">Une question sur le lieu ?</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">
            Écris-nous directement, on te répond rapidement.
          </p>
          <Button variant="whatsapp" href={whatsappInfoLink()} className="mt-5">
            <WhatsAppIcon className="h-5 w-5" />
            Nous écrire
          </Button>
        </Card>
      </section>
    </div>
  );
}
