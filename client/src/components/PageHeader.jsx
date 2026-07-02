export default function PageHeader({ title, subtitle }) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-black tracking-normal text-brand-ink">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-brand-muted">{subtitle}</p> : null}
    </header>
  );
}
