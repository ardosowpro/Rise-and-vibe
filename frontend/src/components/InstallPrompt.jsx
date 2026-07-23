import { useEffect, useState } from "react";
import Button from "./Button.jsx";
import { DownloadIcon, CloseIcon, ShareIosIcon } from "./icons.jsx";

const DISMISS_KEY = "rise_lab_install_dismissed";
const DISMISS_DAYS = 14;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function recentlyDismissed() {
  const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return Date.now() - t < DISMISS_DAYS * 24 * 3600 * 1000;
}

// Invitation à installer l'application, affichée dès la première ouverture :
// - Android/Chrome : bouton natif via beforeinstallprompt dès qu'il est disponible,
//   sinon guide « menu ⋮ → Ajouter à l'écran d'accueil »
// - iOS/Safari : guide « Partager → Sur l'écran d'accueil »
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    setVisible(true);
    if (isIos()) return;
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome !== "accepted") localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-3 z-50 mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800/95 p-4 shadow-glow backdrop-blur-lg"
      style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-label="Installer l'application"
    >
      <button
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/5 hover:text-white/80"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-xl bg-white" />
        <div className="min-w-0">
          <p className="font-semibold text-white">Installe l'app Rise and Vibe</p>
          {isIos() ? (
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              Ajoute l'app sur ton iPhone : touche{" "}
              <span className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-white">
                <ShareIosIcon className="h-3.5 w-3.5" />
                Partager
              </span>{" "}
              dans Safari, puis{" "}
              <span className="font-semibold text-white">« Sur l'écran d'accueil »</span>.
            </p>
          ) : deferred ? (
            <>
              <p className="mt-0.5 text-xs text-white/60">
                Accès direct depuis ton écran d'accueil, même hors connexion.
              </p>
              <Button onClick={install} className="mt-3 min-h-[40px] px-4 text-sm">
                <DownloadIcon className="h-4 w-4" />
                Installer l'application
              </Button>
            </>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              Ouvre le menu{" "}
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-white">⋮</span>{" "}
              de ton navigateur puis choisis{" "}
              <span className="font-semibold text-white">« Ajouter à l'écran d'accueil »</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
