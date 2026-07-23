import config from "../config.js";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import {
  WhatsAppIcon,
  PinIcon,
  ClockIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
} from "../components/icons.jsx";
import { whatsappInfoLink } from "../lib/booking.js";

export default function Contact() {
  const socials = [
    { key: "instagram", url: config.socials.instagram, Icon: InstagramIcon, label: "Instagram" },
    { key: "tiktok", url: config.socials.tiktok, Icon: TikTokIcon, label: "TikTok" },
    { key: "youtube", url: config.socials.youtube, Icon: YouTubeIcon, label: "YouTube" },
  ];
  return (
    <div className="container-app pt-10">
      <SectionTitle
        eyebrow="Contact"
        title="On reste joignables"
        subtitle="Le plus simple reste WhatsApp — on répond vite."
      />
      <div className="mt-8 space-y-3">
        <Button variant="whatsapp" href={whatsappInfoLink()} fullWidth>
          <WhatsAppIcon className="h-5 w-5" />
          Écrire sur WhatsApp
        </Button>
        <a href={config.mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
          <Card selectable className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
              <PinIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-white">{config.address}</p>
              <p className="mt-0.5 text-sm text-accent-bright">Ouvrir dans Google Maps</p>
            </div>
          </Card>
        </a>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-bright">
            <ClockIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-white">{config.hours.days}</p>
            <p className="mt-0.5 text-sm text-white/60">
              {config.hours.open} – {config.hours.close}
            </p>
          </div>
        </Card>
      </div>
      <section className="mt-10">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          Suivez-nous
        </h3>
        <div className="flex gap-3">
          {socials.map(({ key, url, Icon, label }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-14 flex-1 items-center justify-center rounded-2xl border border-white/10 text-white/70 transition-colors hover:border-accent hover:text-accent-bright"
            >
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
