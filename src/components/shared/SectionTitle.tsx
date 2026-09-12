interface SectionTitleProps { kicker?: string; title: string; subtitle?: string; action?: React.ReactNode; }
export default function SectionTitle({ kicker, title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex justify-between items-end mb-8 gap-8 flex-wrap">
      <div>
        {kicker && (
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-[2px] w-6 bg-accent" />
            <span className="text-[11px] text-accent tracking-[.24em] uppercase font-semibold font-serif">{kicker}</span>
          </div>
        )}
        <h2 className="font-serif text-[32px] font-semibold m-0 text-ink tracking-[-.005em]">{title}</h2>
        {subtitle && <p className="mt-2.5 text-[14.5px] text-ink-3 max-w-[580px] leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
