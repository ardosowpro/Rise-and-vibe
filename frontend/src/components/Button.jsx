import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

const variants = {
  primary: "bg-accent text-white shadow-glow hover:bg-accent-bright hover:shadow-glow-sm",
  secondary: "bg-ink-700 text-white hover:bg-ink-600 border border-white/10",
  ghost: "bg-transparent text-white/80 hover:text-white hover:bg-white/5",
  whatsapp:
    "bg-[#25D366] text-black font-bold hover:bg-[#20bd5a] shadow-[0_0_30px_-8px_rgba(37,211,102,0.6)]",
};

export default function Button({
  children,
  variant = "primary",
  to,
  href,
  className = "",
  fullWidth = false,
  ...props
}) {
  const cls = `${base} ${variants[variant] || variants.primary} ${fullWidth ? "w-full" : ""} ${className}`;
  if (to)
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {children}
      </a>
    );
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
