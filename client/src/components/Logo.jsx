export default function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 rounded-xl bg-orange-100">
        <span className="absolute left-[17px] top-[7px] h-8 w-3.5 rounded-full bg-brand-orange" />
        <span className="absolute left-[28px] top-[19px] h-5 w-3.5 rounded-full bg-brand-cyan" />
      </div>
      <div>
        <p className={`text-xl font-black leading-6 ${dark ? 'text-white' : 'text-brand-ink'}`}>Kalon POS</p>
        <p className={`text-xs ${dark ? 'text-indigo-100' : 'text-brand-muted'}`}>Beauty retail admin</p>
      </div>
    </div>
  );
}
