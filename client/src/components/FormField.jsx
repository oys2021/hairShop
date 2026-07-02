export default function FormField({ label, children, error }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs font-bold text-brand-red">{error}</span> : null}
    </label>
  );
}
