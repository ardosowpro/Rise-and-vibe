import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import config from "../config.js";
import {
  HomeIcon,
  CalendarIcon,
  ClockIcon,
  SparkIcon,
  MicIcon,
  InstagramIcon,
  TikTokIcon,
  YouTubeIcon,
  PinIcon,
  LockIcon,
} from "./icons.jsx";

const navItems = [
  { to: "/", label: "Accueil", icon: HomeIcon, end: true },
  { to: "/disponibilites", label: "Dispos", icon: ClockIcon },
  { to: "/reserver", label: "Réserver", icon: CalendarIcon },
  { to: "/masterclass", label: "Événements", icon: SparkIcon, match: ["/masterclass", "/sessions"] },
  { to: "/studio", label: "Studio", icon: MicIcon },
];

function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/90 backdrop-blur-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {navItems.map(({ to, label, icon: Icon, end, match }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors",
                isActive || (match && match.includes(window.location.pathname))
                  ? "text-accent-bright"
                  : "text-white/50 hover:text-white/80",
              ].join(" ")
            }
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function Footer() {
  const socials = [
    { key: "instagram", url: config.socials.instagram, Icon: InstagramIcon, label: "Instagram" },
    { key: "tiktok", url: config.socials.tiktok, Icon: TikTokIcon, label: "TikTok" },
    { key: "youtube", url: config.socials.youtube, Icon: YouTubeIcon, label: "YouTube" },
  ];
  return (
    <footer className="mt-16 border-t border-white/10 bg-ink-900/60">
      <div className="container-app space-y-6 pt-10 pb-28">
        <div>
          <p className="font-display text-xl font-bold text-white">{config.studioName}</p>
          <p className="mt-1 text-sm text-white/50">{config.tagline}</p>
        </div>
        <div className="space-y-3 text-sm text-white/70">
          <p className="flex items-center gap-2">
            <PinIcon className="h-5 w-5 text-accent-bright" />
            {config.address}
          </p>
          <p className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-accent-bright" />
            {config.hours.days}, {config.hours.open} – {config.hours.close}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {socials.map(({ key, url, Icon, label }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-accent hover:text-accent-bright"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-sm">
          <Link to="/contact" className="text-accent-bright hover:underline">
            Contact
          </Link>
          <p className="text-white/30">© {config.studioName}</p>
        </div>
      </div>
    </footer>
  );
}

function FloatingReserve() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/reserver")) return null;
  return (
    <Link
      to="/reserver"
      className="fixed bottom-[76px] right-4 z-40 flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-5 font-semibold text-white shadow-glow animate-pulse-glow transition-transform active:scale-95"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Réserver une session"
    >
      <CalendarIcon className="h-5 w-5" />
      Réserver
    </Link>
  );
}

function AgendaLink() {
  return (
    <Link
      to="/agenda"
      aria-label="Espace ingénieurs — agenda"
      className="fixed right-3 top-3 z-40 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-900/70 px-3 py-1.5 text-xs font-medium text-white/50 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white/90"
      style={{ marginTop: "env(safe-area-inset-top)" }}
    >
      <LockIcon className="h-4 w-4" />
      Agenda
    </Link>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <Footer />
      <AgendaLink />
      <FloatingReserve />
      <BottomNav />
    </div>
  );
}
