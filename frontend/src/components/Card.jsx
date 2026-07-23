export default function Card({
  children,
  className = "",
  selectable = false,
  selected = false,
  as: Tag = "div",
  ...props
}) {
  const base = "rounded-2xl border bg-ink-800/70 backdrop-blur-sm transition-all duration-200";
  const state = selectable
    ? selected
      ? "border-accent bg-accent/10 shadow-glow-sm cursor-pointer"
      : "border-white/10 hover:border-white/25 hover:bg-ink-700/70 cursor-pointer"
    : "border-white/10";
  return (
    <Tag className={`${base} ${state} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
