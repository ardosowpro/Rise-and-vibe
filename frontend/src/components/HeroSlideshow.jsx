import { useEffect, useMemo, useState } from "react";
import config from "../config.js";

const INTERVAL_MS = 7000; // temps d'affichage par photo
const supportsReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// "/photos/studio-1.jpg" → "/photos/optimized/studio-1.webp"
function optimizedSrc(photo) {
  const name = photo.split("/").pop().replace(/\.(jpe?g|png)$/i, "");
  return `/photos/optimized/${name}.webp`;
}

// Image avec WebP optimisé + repli jpg d'origine
function Slide({ photo, visible, eager }) {
  return (
    <picture>
      <source srcSet={optimizedSrc(photo)} type="image/webp" />
      <img
        src={photo}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchpriority={eager ? "high" : "low"}
        className={[
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out",
          visible ? "opacity-100 hero-kenburns" : "opacity-0",
        ].join(" ")}
      />
    </picture>
  );
}

// Diaporama d'arrière-plan du héro : fondu enchaîné lent, boucle,
// image fixe si prefers-reduced-motion.
export default function HeroSlideshow() {
  // Le diaporama se limite aux premières photos pour ne pas alourdir la page
  const photos = (config.studioPhotos || []).slice(0, 6);
  const reduced = useMemo(supportsReducedMotion, []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || photos.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % photos.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced, photos.length]);

  if (!photos.length) return null;
  const shown = reduced ? [photos[0]] : photos;

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
      {shown.map((photo, i) => (
        <Slide key={photo} photo={photo} visible={i === index || reduced} eager={i === 0} />
      ))}
      {/* Overlay dégradé sombre pour la lisibilité du texte */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.35) 40%, rgba(10,10,15,0.92) 85%, #0a0a0f 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 70% 0%, rgba(225,87,67,0.18), transparent 55%)",
        }}
      />
    </div>
  );
}
