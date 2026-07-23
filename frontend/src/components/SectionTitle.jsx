export default function SectionTitle({ eyebrow, title, subtitle, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="text-2xl font-bold leading-tight text-white">{title}</h2>
      {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
    </div>
  );
}
