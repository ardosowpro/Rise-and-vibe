// Icônes SVG inline (identiques à l'original)

const Base = ({ children, className = "w-6 h-6" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const HomeIcon = (props) => (
  <Base {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Base>
);

export const CalendarIcon = (props) => (
  <Base {...props}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </Base>
);

export const LaptopIcon = (props) => (
  <Base {...props}>
    <rect x="4.5" y="4.5" width="15" height="10.5" rx="1.5" />
    <path d="M2.5 19h19M4.5 15l-1.5 4M19.5 15l1.5 4" />
  </Base>
);

export const SlidersIcon = (props) => (
  <Base {...props}>
    <path d="M6 4v6M6 14v6M12 4v10M12 18v2M18 4v2M18 10v10" />
    <path d="M4 12h4M10 16h4M16 8h4" />
  </Base>
);

export const TagIcon = (props) => (
  <Base {...props}>
    <path d="M20.6 13.4 12 22 2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </Base>
);

export const SparkIcon = (props) => (
  <Base {...props}>
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    <path d="M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />
  </Base>
);

export const MicIcon = (props) => (
  <Base {...props}>
    <path d="M12 3a4 4 0 0 0-4 4v4a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4Z" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
  </Base>
);

export const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
);

export const InstagramIcon = (props) => (
  <Base {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </Base>
);

export const TikTokIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.5 3c.3 2.2 1.6 3.7 3.7 3.9v2.6c-1.3.1-2.5-.3-3.7-1v5.9c0 3.4-2.6 5.6-5.7 5.6-2.9 0-5.3-2.2-5.3-5.1 0-3.1 2.6-5.2 5.9-4.9v2.7c-.4-.1-.9-.2-1.3-.1-1.2.1-2 .9-1.9 2.1.1 1.2 1 1.9 2.2 1.8 1.2-.1 1.9-1 1.9-2.3V3h3.5Z" />
  </svg>
);

export const YouTubeIcon = (props) => (
  <Base {...props}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" />
    <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
  </Base>
);

export const PinIcon = (props) => (
  <Base {...props}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);

export const ClockIcon = (props) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const CheckIcon = (props) => (
  <Base {...props}>
    <path d="m5 12 5 5L20 7" />
  </Base>
);

export const ArrowRightIcon = (props) => (
  <Base {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const PlusIcon = (props) => (
  <Base {...props}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const CloseIcon = (props) => (
  <Base {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const LockIcon = (props) => (
  <Base {...props}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </Base>
);
