export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-10">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 flex justify-between items-center flex-wrap gap-6">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-base font-semibold text-primary">学术之外</span>
          <span className="font-serif text-[11px] text-ink-3 tracking-[.18em] uppercase">Beyond Academia</span>
          <span className="text-xs text-ink-3">· 替代性学术职业专委会</span>
        </div>
        <span className="font-mono text-[11.5px] text-ink-4 tracking-[.06em]">© 2026</span>
      </div>
    </footer>
  );
}
